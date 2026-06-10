/**
 * Reclaim Desktop — Electron Main Process
 * Self-contained tray app for blocking short-form content on Windows.
 */

const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, dialog } = require('electron');
const path  = require('path');
const fs    = require('fs');
const os    = require('os');

// ─── Persistent Storage (simple JSON) ─────────────────────────────────────────
const STORE_PATH = path.join(app.getPath('userData'), 'reclaim-settings.json');
function loadStore() {
  try { return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')); } catch { return defaultStore(); }
}
function saveStore(data) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}
function defaultStore() {
  return {
    rules: {
      tiktok:          { enabled: true,  label: 'TikTok' },
      twitter_videos:  { enabled: false, label: 'X / Twitter' },
      reddit_shortfeed:{ enabled: false, label: 'Reddit' },
    },
    hardMode: false,
    pausedUntil: 0,
    stats: { blockedToday: 0, minutesSaved: 0, streak: 0 },
  };
}

let store = loadStore();

// ─── Hosts File Manager ───────────────────────────────────────────────────────
const HOSTS_PATH    = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
const MARKER_START  = '# ── Reclaim START ──';
const MARKER_END    = '# ── Reclaim END ──';
const REDIRECT_IP   = '0.0.0.0';

const DOMAIN_MAP = {
  tiktok:           ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'tiktokcdn.com'],
  twitter_videos:   ['twitter.com', 'x.com', 'www.twitter.com', 'www.x.com'],
  reddit_shortfeed: ['reddit.com', 'www.reddit.com'],
};

function applyHosts() {
  if (Date.now() < store.pausedUntil) return;
  const domains = [];
  for (const [key, rule] of Object.entries(store.rules)) {
    if (rule.enabled && DOMAIN_MAP[key]) domains.push(...DOMAIN_MAP[key]);
  }
  writeHostsBlock(domains);
}

function writeHostsBlock(domains) {
  try {
    let existing = '';
    try { existing = fs.readFileSync(HOSTS_PATH, 'utf8'); } catch {}
    const cleaned = existing
      .replace(new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}\\n?`, 'g'), '')
      .trim();
    if (domains.length === 0) {
      fs.writeFileSync(HOSTS_PATH, cleaned + '\n', 'utf8');
      return;
    }
    const block = [MARKER_START, ...domains.map(d => `${REDIRECT_IP} ${d}`), MARKER_END].join('\n');
    fs.writeFileSync(HOSTS_PATH, cleaned + '\n\n' + block + '\n', 'utf8');
  } catch (e) {
    // Silently fail if no admin rights — will show warning in tray
    console.warn('[Reclaim] Could not write hosts file:', e.message);
  }
}

function clearHosts() {
  writeHostsBlock([]);
}

// ─── App State ────────────────────────────────────────────────────────────────
let tray       = null;
let mainWindow = null;

app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });

app.whenReady().then(() => {
  createTray();
  applyHosts();
});

app.on('window-all-closed', (e) => e.preventDefault());
app.on('before-quit', clearHosts);

// ─── Tray ─────────────────────────────────────────────────────────────────────
function createTray() {
  // Use a simple programmatic icon (no file dependency)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Reclaim — Active');
  updateTrayMenu();
  tray.on('double-click', showDashboard);
}

function updateTrayMenu() {
  const rules  = store.rules;
  const active = Object.values(rules).filter(r => r.enabled).length;
  const paused = Date.now() < store.pausedUntil;

  const platformItems = Object.entries(rules).map(([key, rule]) => ({
    label: `${rule.enabled ? '✓' : '○'}  ${rule.label}`,
    click: () => {
      if (store.hardMode) { tray.displayBalloon({ title: 'Reclaim', content: 'Hard Mode is active — cannot change rules.' }); return; }
      store.rules[key].enabled = !rule.enabled;
      saveStore(store);
      applyHosts();
      updateTrayMenu();
    },
  }));

  const menu = Menu.buildFromTemplate([
    { label: `Reclaim — ${paused ? 'Paused' : active + ' platforms blocked'}`, enabled: false },
    { type: 'separator' },
    { label: '📊 Open Dashboard', click: showDashboard },
    { type: 'separator' },
    { label: '🛡️  Blocked Platforms', enabled: false },
    ...platformItems,
    { type: 'separator' },
    {
      label: paused ? '▶ Resume Now' : '⏸  Pause for 15 min',
      click: () => {
        if (store.hardMode && !paused) {
          tray.displayBalloon({ title: 'Reclaim', content: 'Hard Mode is active — cannot pause.' });
          return;
        }
        if (paused) {
          store.pausedUntil = 0;
          applyHosts();
        } else {
          store.pausedUntil = Date.now() + 15 * 60 * 1000;
          clearHosts();
          setTimeout(() => { store.pausedUntil = 0; applyHosts(); updateTrayMenu(); }, 15 * 60 * 1000);
        }
        saveStore(store);
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    { label: 'Quit Reclaim', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
  tray.setTitle(paused ? '⏸' : '🛡');
}

// ─── Dashboard Window ─────────────────────────────────────────────────────────
function showDashboard() {
  if (mainWindow) { mainWindow.focus(); return; }
  mainWindow = new BrowserWindow({
    width: 780, height: 560,
    minWidth: 640, minHeight: 480,
    title: 'Reclaim',
    backgroundColor: '#FCFBF9',
    webPreferences: {
      preload:          path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── IPC ──────────────────────────────────────────────────────────────────────
ipcMain.handle('get-store', ()      => store);
ipcMain.handle('toggle-rule', (_, key) => {
  if (store.rules[key]) {
    store.rules[key].enabled = !store.rules[key].enabled;
    saveStore(store);
    applyHosts();
    updateTrayMenu();
  }
  return store;
});
ipcMain.handle('get-hosts-status', () => {
  try { const h = fs.readFileSync(HOSTS_PATH, 'utf8'); return h.includes(MARKER_START) ? 'active' : 'inactive'; }
  catch { return 'no-admin'; }
});
