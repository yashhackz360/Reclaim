/**
 * FocusLock Background Service Worker
 * Manages rules, syncs with Firebase, coordinates content scripts.
 */

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY_RULES   = 'focuslock_rules';
const STORAGE_KEY_USER    = 'focuslock_user';
const STORAGE_KEY_STATS   = 'focuslock_stats';
const STORAGE_KEY_SESSION = 'focuslock_session';
const ALARM_SYNC          = 'focuslock_sync';
const ALARM_STATS_FLUSH   = 'focuslock_stats_flush';

// ─── Default Rules ────────────────────────────────────────────────────────────
const DEFAULT_RULES = {
  youtube_shorts:    { enabled: true,  action: 'block',  dailyLimitMin: null },
  instagram_reels:   { enabled: true,  action: 'block',  dailyLimitMin: null },
  facebook_reels:    { enabled: true,  action: 'block',  dailyLimitMin: null },
  tiktok:            { enabled: true,  action: 'block',  dailyLimitMin: null },
  twitter_videos:    { enabled: false, action: 'warn',   dailyLimitMin: 30   },
  reddit_shortfeed:  { enabled: false, action: 'warn',   dailyLimitMin: null },
};

// ─── Initialization ───────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      [STORAGE_KEY_RULES]: DEFAULT_RULES,
      [STORAGE_KEY_STATS]: initStats(),
    });
    chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html?welcome=1') });
  }

  // Set up periodic sync alarm (every 5 min)
  await chrome.alarms.create(ALARM_SYNC, { periodInMinutes: 5 });
  // Flush stats to storage every minute
  await chrome.alarms.create(ALARM_STATS_FLUSH, { periodInMinutes: 1 });
});

// ─── Alarm Handlers ───────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_SYNC) {
    await syncRulesFromServer();
  }
  if (alarm.name === ALARM_STATS_FLUSH) {
    await flushStats();
  }
});

// ─── Message Handlers (from content scripts & popup) ─────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'GET_RULES':
        sendResponse(await getRules());
        break;

      case 'BLOCK_EVENT':
        await recordBlock(message.platform, message.url);
        sendResponse({ ok: true });
        break;

      case 'GET_STATS':
        sendResponse(await getStats());
        break;

      case 'UPDATE_RULE':
        await updateRule(message.platform, message.patch);
        sendResponse({ ok: true });
        // Notify all active tabs to re-apply rules
        await notifyAllTabs({ type: 'RULES_UPDATED' });
        break;

      case 'START_SESSION':
        await startFocusSession(message.session);
        sendResponse({ ok: true });
        break;

      case 'END_SESSION':
        await endFocusSession();
        sendResponse({ ok: true });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  })();
  return true; // Keep message channel open for async
});

// ─── Tab Event Handling ───────────────────────────────────────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  const rules = await getRules();
  const blocked = shouldBlockUrl(tab.url, rules);
  if (blocked) {
    // Redirect to block page for hard-blocked domains
    if (blocked.action === 'block' && isFullDomainBlock(tab.url, blocked.platform)) {
      await chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`blocked/blocked.html?platform=${blocked.platform}&url=${encodeURIComponent(tab.url)}`)
      });
    }
  }
});

// ─── Rule Engine ─────────────────────────────────────────────────────────────
function shouldBlockUrl(url, rules) {
  const patterns = {
    youtube_shorts:   /youtube\.com\/shorts/,
    tiktok:           /tiktok\.com/,
    instagram_reels:  /instagram\.com\/(reels|reel)/,
    facebook_reels:   /facebook\.com\/reel/,
    twitter_videos:   /(twitter|x)\.com/,
    reddit_shortfeed: /reddit\.com/,
  };
  for (const [platform, regex] of Object.entries(patterns)) {
    if (regex.test(url) && rules[platform]?.enabled) {
      return { platform, action: rules[platform].action };
    }
  }
  return null;
}

function isFullDomainBlock(url, platform) {
  return platform === 'tiktok'; // TikTok = full domain block
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────
async function getRules() {
  const data = await chrome.storage.local.get(STORAGE_KEY_RULES);
  return data[STORAGE_KEY_RULES] ?? DEFAULT_RULES;
}

async function updateRule(platform, patch) {
  const rules = await getRules();
  rules[platform] = { ...rules[platform], ...patch };
  await chrome.storage.local.set({ [STORAGE_KEY_RULES]: rules });
}

function initStats() {
  const today = todayStr();
  return {
    [today]: {
      blocks: { youtube_shorts: 0, instagram_reels: 0, facebook_reels: 0, tiktok: 0, twitter_videos: 0, reddit_shortfeed: 0 },
      minutesSaved: 0,
    }
  };
}

async function getStats() {
  const data = await chrome.storage.local.get(STORAGE_KEY_STATS);
  return data[STORAGE_KEY_STATS] ?? initStats();
}

async function recordBlock(platform, url) {
  const stats = await getStats();
  const today = todayStr();
  if (!stats[today]) stats[today] = { blocks: {}, minutesSaved: 0 };
  if (!stats[today].blocks[platform]) stats[today].blocks[platform] = 0;
  stats[today].blocks[platform]++;
  // Estimate time saved: avg short video = 1.2 min
  stats[today].minutesSaved += 1.2;
  await chrome.storage.local.set({ [STORAGE_KEY_STATS]: stats });
}

async function flushStats() {
  // Prune stats older than 90 days
  const stats = await getStats();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  for (const dateKey of Object.keys(stats)) {
    if (new Date(dateKey) < cutoff) delete stats[dateKey];
  }
  await chrome.storage.local.set({ [STORAGE_KEY_STATS]: stats });
}

// ─── Focus Session Management ─────────────────────────────────────────────────
async function startFocusSession(session) {
  await chrome.storage.local.set({ [STORAGE_KEY_SESSION]: { ...session, startedAt: Date.now() } });
  // During session, enforce stricter rules
  const rules = await getRules();
  const sessionRules = { ...rules };
  (session.blockTargets ?? []).forEach(platform => {
    if (sessionRules[platform]) sessionRules[platform].enabled = true;
  });
  await chrome.storage.local.set({ [STORAGE_KEY_RULES]: sessionRules });
  await notifyAllTabs({ type: 'SESSION_STARTED', session });
}

async function endFocusSession() {
  await chrome.storage.local.remove(STORAGE_KEY_SESSION);
  await notifyAllTabs({ type: 'SESSION_ENDED' });
}

// ─── Firebase Sync (stub — requires Firebase SDK integration) ─────────────────
async function syncRulesFromServer() {
  const user = await chrome.storage.local.get(STORAGE_KEY_USER);
  if (!user[STORAGE_KEY_USER]?.uid) return; // Not logged in
  // In production: fetch rules from Firestore REST API
  // await fetch(`https://firestore.googleapis.com/v1/projects/focuslock-prod/...`)
  console.log('[FocusLock] Sync tick — user:', user[STORAGE_KEY_USER]?.uid);
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

async function notifyAllTabs(message) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch {
      // Tab may not have content script; ignore
    }
  }
}
