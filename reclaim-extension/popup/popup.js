/**
 * FocusLock Popup Script
 * Loads rules + stats, renders toggles, handles user interactions.
 */

const PLATFORMS = [
  { key: 'youtube_shorts',   icon: '▶️',  label: 'YouTube Shorts'    },
  { key: 'instagram_reels',  icon: '📸',  label: 'Instagram Reels'   },
  { key: 'facebook_reels',   icon: '👥',  label: 'Facebook Reels'    },
  { key: 'tiktok',           icon: '🎵',  label: 'TikTok'            },
  { key: 'twitter_videos',   icon: '🐦',  label: 'X / Twitter Videos'},
  { key: 'reddit_shortfeed', icon: '👽',  label: 'Reddit Videos'     },
];

async function sendMsg(msg) {
  return new Promise(r => chrome.runtime.sendMessage(msg, r));
}

async function init() {
  const [rules, stats] = await Promise.all([
    sendMsg({ type: 'GET_RULES' }),
    sendMsg({ type: 'GET_STATS' }),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const todayStats = stats?.[today] ?? { blocks: {}, minutesSaved: 0 };
  const totalBlocked = Object.values(todayStats.blocks).reduce((a, b) => a + b, 0);
  const minutesSaved = Math.round(todayStats.minutesSaved);

  // Render stats
  document.getElementById('statBlocked').textContent  = totalBlocked;
  document.getElementById('statMinutes').textContent  = minutesSaved;
  document.getElementById('statStreak').textContent   = '–'; // loaded from storage

  // Load streak
  chrome.storage.local.get('focuslock_streak', (data) => {
    const streak = data.focuslock_streak ?? 0;
    document.getElementById('statStreak').textContent = streak;
    if (streak > 0) {
      document.getElementById('streakBar').style.display = 'flex';
      document.getElementById('streakCount').textContent = `${streak} day streak`;
    }
  });

  // Render toggles
  const list = document.getElementById('toggleList');
  list.innerHTML = '';
  PLATFORMS.forEach(({ key, icon, label }) => {
    const rule = rules?.[key] ?? { enabled: false };
    const count = todayStats.blocks[key] ?? 0;
    const row = document.createElement('div');
    row.className = 'toggle-row';
    row.innerHTML = `
      <span class="platform-icon">${icon}</span>
      <span class="platform-name">${label}</span>
      ${count > 0 ? `<span class="platform-count">${count} blocked</span>` : ''}
      <label class="switch" title="Toggle ${label}">
        <input type="checkbox" id="toggle-${key}" ${rule.enabled ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    `;
    row.querySelector('input').addEventListener('change', async (e) => {
      await sendMsg({ type: 'UPDATE_RULE', platform: key, patch: { enabled: e.target.checked } });
    });
    list.appendChild(row);
  });

  // Settings button
  document.getElementById('btnSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // Pause button
  document.getElementById('btnPause').addEventListener('click', async () => {
    const badge = document.getElementById('statusBadge');
    badge.textContent = 'Paused';
    badge.classList.add('paused');
    document.getElementById('btnPause').disabled = true;
    document.getElementById('btnPause').textContent = 'Paused (15min)';

    // Disable all rules temporarily
    for (const { key } of PLATFORMS) {
      await sendMsg({ type: 'UPDATE_RULE', platform: key, patch: { enabled: false } });
    }

    // Re-enable after 15 minutes
    setTimeout(async () => {
      const r = await sendMsg({ type: 'GET_RULES' });
      for (const { key } of PLATFORMS) {
        await sendMsg({ type: 'UPDATE_RULE', platform: key, patch: { enabled: true } });
      }
    }, 15 * 60 * 1000);

    setTimeout(() => window.close(), 1000);
  });
}

init().catch(console.error);
