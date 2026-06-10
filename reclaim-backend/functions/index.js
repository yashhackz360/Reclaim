/**
 * FocusLock Cloud Functions — index.js
 * All backend logic: user lifecycle, unlock flows, streak evaluation, analytics, notifications.
 */

const functions  = require('firebase-functions');
const admin      = require('firebase-admin');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');

admin.initializeApp();
const db  = admin.firestore();
const fcm = admin.messaging();

// ─────────────────────────────────────────────────────────────────────────────
// USER LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * onCreate: Initialize user profile + default rules + streak doc
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const batch = db.batch();

  // Create user profile
  batch.set(db.collection('users').doc(user.uid), {
    id:                   user.uid,
    email:                user.email ?? null,
    displayName:          user.displayName ?? 'FocusLock User',
    photoURL:             user.photoURL ?? null,
    createdAt:            FieldValue.serverTimestamp(),
    subscriptionTier:     'free',
    subscriptionExpiry:   null,
    hardModeEnabled:      false,
    hardModeExpiresAt:    null,
    recoveryPasswordHash: null,
    onboardingCompleted:  false,
    timezone:             'UTC',
    locale:               'en-US',
  });

  // Create default block rules
  const defaultRules = [
    { target: { type: 'url_pattern', value: '*/shorts/*', label: 'YouTube Shorts' },  platform: 'all', action: 'block' },
    { target: { type: 'url_pattern', value: '*/reels/*',  label: 'Instagram Reels' }, platform: 'all', action: 'block' },
    { target: { type: 'domain',      value: 'tiktok.com', label: 'TikTok' },           platform: 'all', action: 'block' },
  ];

  for (const rule of defaultRules) {
    const ref = db.collection('block_rules').doc();
    batch.set(ref, {
      ...rule,
      userId:       user.uid,
      timeLimit:    null,
      pauseSeconds: null,
      schedule:     null,
      createdAt:    FieldValue.serverTimestamp(),
      updatedAt:    FieldValue.serverTimestamp(),
      isHardLocked: false,
    });
  }

  // Init streak
  batch.set(db.collection('streaks').doc(user.uid), {
    currentStreak:  0,
    longestStreak:  0,
    lastActiveDate: null,
    streakHistory:  [],
    milestones:     [],
  });

  await batch.commit();
  functions.logger.info('User initialized:', user.uid);
});

/**
 * onDelete: Clean up all user data
 */
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const collections = ['devices', 'block_rules', 'focus_sessions', 'notifications', 'streaks'];
  for (const col of collections) {
    const snap = await db.collection(col).where('userId', '==', uid).get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
  await db.collection('users').doc(uid).delete();
  functions.logger.info('User cleaned up:', uid);
});

// ─────────────────────────────────────────────────────────────────────────────
// UNLOCK REQUEST FLOW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * onCreate: When user creates an unlock request, notify their partner.
 */
exports.onUnlockRequestCreate = functions.firestore
  .document('unlock_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const req = snap.data();
    const { userId, partnershipId, requestedChange, reason } = req;

    // Enforce: max 1 pending request per user per 24h
    const recent = await db.collection('unlock_requests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .get();

    if (recent.size > 1) {
      await snap.ref.update({ status: 'rejected', partnerNote: 'Rate limit: 1 request per 24h' });
      return;
    }

    // Get partnership + partner FCM token
    const partnership = await db.collection('accountability_partners').doc(partnershipId).get();
    if (!partnership.exists) return;

    const partnerId = partnership.data().partnerId;
    const partnerDoc = await db.collection('users').doc(partnerId).get();
    const partnerFcmToken = partnerDoc.data()?.fcmToken;

    // Create notification for partner
    await db.collection('notifications').add({
      userId:    partnerId,
      type:      'partner_request',
      title:     '🔓 Unlock Request',
      body:      `Your partner wants to change: "${requestedChange}". Reason: "${reason}"`,
      data:      { requestId: context.params.requestId, userId },
      read:      false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Send FCM push
    if (partnerFcmToken) {
      await fcm.send({
        token: partnerFcmToken,
        notification: {
          title: '🔓 FocusLock Unlock Request',
          body:  `Your partner wants to modify a block rule. Review the request.`,
        },
        data: { requestId: context.params.requestId, screen: 'UnlockRequest' },
      });
    }

    functions.logger.info('Unlock request created, partner notified:', context.params.requestId);
  });

/**
 * onUpdate: When partner approves/rejects, apply the change after wait period.
 */
exports.onUnlockRequestUpdate = functions.firestore
  .document('unlock_requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    if (before.status === after.status) return; // No status change

    const { userId, ruleId, waitUntil, status } = after;

    // Notify the user of partner decision
    let notifTitle, notifBody;
    if (status === 'approved') {
      notifTitle = '✅ Unlock Approved';
      notifBody  = `Your partner approved. Unlock available at ${new Date(waitUntil.toDate()).toLocaleTimeString()}.`;
    } else if (status === 'rejected') {
      notifTitle = '❌ Unlock Rejected';
      notifBody  = after.partnerNote ?? 'Your partner rejected the unlock request. Stay strong!';
    } else {
      return;
    }

    await db.collection('notifications').add({
      userId,
      type:      'unlock_decision',
      title:     notifTitle,
      body:      notifBody,
      data:      { requestId: context.params.requestId, ruleId },
      read:      false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // If approved AND wait period has elapsed → unlock the rule
    if (status === 'approved' && waitUntil.toDate() <= new Date()) {
      await db.collection('block_rules').doc(ruleId).update({ isHardLocked: false });
      await change.after.ref.update({ status: 'completed' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;
    if (fcmToken) {
      await fcm.send({
        token: fcmToken,
        notification: { title: notifTitle, body: notifBody },
        data: { requestId: context.params.requestId },
      });
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED: DAILY STREAK EVALUATOR (runs at midnight UTC)
// ─────────────────────────────────────────────────────────────────────────────

exports.dailyStreakEvaluator = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const usersSnap = await db.collection('users').get();

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const analyticsDoc = await db
        .collection('analytics').doc(uid)
        .collection('daily').doc(yesterdayStr)
        .get();

      const streakRef = db.collection('streaks').doc(uid);
      const streakDoc = await streakRef.get();
      const streak    = streakDoc.data() ?? { currentStreak: 0, longestStreak: 0, milestones: [] };

      const hadViolations = analyticsDoc.exists && analyticsDoc.data().violationAttempts > 0;
      const wasActive     = analyticsDoc.exists;

      let { currentStreak, longestStreak, milestones } = streak;

      if (wasActive && !hadViolations) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;

        // Milestone check
        const milestoneDays = [7, 14, 30, 60, 90, 180, 365];
        if (milestoneDays.includes(currentStreak)) {
          milestones.push({ days: currentStreak, achievedAt: Timestamp.now() });
          await sendMilestoneNotification(uid, currentStreak);
        }
      } else if (!wasActive) {
        // Inactive day — don't break streak, just don't increment
      } else {
        currentStreak = 0; // Violation → reset streak
        await sendStreakBrokenNotification(uid, streak.currentStreak);
      }

      await streakRef.update({ currentStreak, longestStreak, lastActiveDate: yesterdayStr, milestones });
    }

    functions.logger.info('Streak evaluation complete for', usersSnap.size, 'users');
  });

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED: WEEKLY ANALYTICS ROLLUP (every Monday 00:05 UTC)
// ─────────────────────────────────────────────────────────────────────────────

exports.weeklyAnalyticsRollup = functions.pubsub
  .schedule('5 0 * * 1')
  .timeZone('UTC')
  .onRun(async () => {
    const usersSnap = await db.collection('users').get();
    const weekAgo   = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      let totalBlocked = 0, totalMinutes = 0;

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayDoc = await db.collection('analytics').doc(uid).collection('daily').doc(dateStr).get();
        if (dayDoc.exists) {
          totalBlocked += dayDoc.data().videosBlocked ?? 0;
          totalMinutes += dayDoc.data().minutesSaved  ?? 0;
        }
      }

      const weekStr = getWeekString(new Date());
      await db.collection('analytics').doc(uid).collection('weekly').doc(weekStr).set({
        week:              weekStr,
        totalVideosBlocked: totalBlocked,
        totalHoursSaved:   parseFloat((totalMinutes / 60).toFixed(1)),
        avgDailyAttempts:  0,
        insights:          generateInsights(totalBlocked, totalMinutes),
      });
    }
    functions.logger.info('Weekly analytics rollup complete');
  });

// ─────────────────────────────────────────────────────────────────────────────
// VIOLATION LOGGING (called by device clients via HTTPS callable)
// ─────────────────────────────────────────────────────────────────────────────

exports.logViolation = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const { platform, url, timestamp } = data;
  const uid     = context.auth.uid;
  const dateStr = new Date(timestamp ?? Date.now()).toISOString().split('T')[0];

  const analyticsRef = db.collection('analytics').doc(uid).collection('daily').doc(dateStr);

  await analyticsRef.set({
    date:                dateStr,
    [`violationsByPlatform.${platform}`]: FieldValue.increment(1),
    videosBlocked:       FieldValue.increment(1),
    minutesSaved:        FieldValue.increment(1.2),
    violationAttempts:   FieldValue.increment(1),
  }, { merge: true });

  return { ok: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function sendMilestoneNotification(uid, days) {
  await db.collection('notifications').add({
    userId:    uid,
    type:      'streak_milestone',
    title:     `🏆 ${days}-Day Streak!`,
    body:      `Incredible — you've maintained your focus for ${days} days straight. You're reclaiming your life.`,
    data:      { days },
    read:      false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function sendStreakBrokenNotification(uid, lostStreak) {
  await db.collection('notifications').add({
    userId:    uid,
    type:      'streak_milestone',
    title:     `💪 Streak Reset — But You're Still Here`,
    body:      `Your ${lostStreak}-day streak ended, but starting again is the move. Every expert was once a beginner.`,
    data:      { lostStreak },
    read:      false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function generateInsights(totalBlocked, totalMinutes) {
  const hours = (totalMinutes / 60).toFixed(1);
  return [
    `You avoided ${totalBlocked} short videos this week — that's ${hours} hours back in your day.`,
    totalBlocked > 100
      ? `You're in the top tier of focus. Keep it up.`
      : `Every block is a win. You're building real habits.`,
  ];
}

function getWeekString(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}
