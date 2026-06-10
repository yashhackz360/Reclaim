/**
 * FocusLock Desktop Agent — Electron Main Process
 * System tray app that enforces content blocking at the OS level.
 */

const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell } = require('electron');
const path   = require('path');
const Store  = require('electron-store');

// ─── Store ────────────────────────────────────────────────────────────────────
const store = new Store({
  schema: {
    rules:          { type: 'object', default: {} },
    userId:         { type: 'string', default: '' },
    hardModeActive: { type: 'boolean', default: false },
    lastSync:       { type: 'number', default: 0 },
  }
});

// ─── State ────────────────────────────────────────────────────────────────────
let tray        = null;
let mainWindow  = null;
let syncInterval = null;
const { HostsManager }   = require('../service/hosts-manager');
const { BrowserMonitor } = require('../service/browser-monitor');
const { RuleEngine }     = require('./rule-engine');
const { SyncManager }    = require('./sync');

const hostsManager   = new HostsManager();
const browserMonitor = new BrowserMonitor();
const ruleEngine     = new RuleEngine(store);
const syncManager    = new SyncManager(store);

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });

app.whenReady().then(async () => {
  createTray();
  await hostsManager.applyRules(store.get('rules'));
  browserMonitor.start(onBrowserEvent);

  // Initial sync
  await syncManager.syncRules();
  // Periodic sync every 60s
  syncInterval = setInterval(() => syncManager.syncRules(), 60_000);
});

app.on('window-all-closed', (e) => {
  e.preventDefault(); // Keep tray running even when window closes
});

app.on('before-quit', async () => {
  clearInterval(syncInterval);
  browserMonitor.stop();
});

// ─── Tray ─────────────────────────────────────────────────────────────────────
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/tray-icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('FocusLock — Active');
  updateTrayMenu();
  tray.on('double-click', showDashboard);
}

function updateTrayMenu() {
  const rules  = store.get('rules', {});
  const active = Object.values(rules).filter((r) => r.enabled).length;
  const menu = Menu.buildFromTemplate([
    { label: `FocusLock — ${active} rules active`, enabled: false },
    { type: 'separator' },
    { label: '📊 Open Dashboard', click: showDashboard },
    { label: '⚙️  Settings',      click: showSettings  },
    { type: 'separator' },
    {
      label: 'Pause for 15 min',
      click: async () => {
        if (store.get('hardModeActive')) {
          tray.displayBalloon({ title: 'FocusLock', content: 'Hard Mode is active — cannot pause.' });
          return;
        }
        await hostsManager.pause(15 * 60 * 1000);
        tray.displayBalloon({ title: 'FocusLock', content: 'Paused for 15 minutes.' });
      }
    },
    { type: 'separator' },
    { label: '🔄 Sync Now', click: () => syncManager.syncRules() },
    { type: 'separator' },
    { label: 'Quit FocusLock', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

// ─── Dashboard Window ─────────────────────────────────────────────────────────
function showDashboard() {
  if (mainWindow) { mainWindow.focus(); return; }
  mainWindow = new BrowserWindow({
    width: 960, height: 680,
    minWidth: 780, minHeight: 500,
    title: 'FocusLock',
    backgroundColor: '#070713',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload:          path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function showSettings() {
  showDashboard();
  mainWindow?.webContents.send('navigate', 'settings');
}

// ─── Browser Event Handler ────────────────────────────────────────────────────
async function onBrowserEvent({ url, type }) {
  const shouldBlock = ruleEngine.shouldBlockUrl(url);
  if (shouldBlock) {
    // Redirect browser tab (via extension messaging or hosts file)
    await hostsManager.blockUrl(url);
    tray.displayBalloon({
      title:   'FocusLock blocked',
      content: `Blocked: ${shouldBlock.label}`,
      iconType: 'info',
    });
  }
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('get-rules',    ()      => store.get('rules', {}));
ipcMain.handle('get-stats',    ()      => store.get('stats', {}));
ipcMain.handle('update-rule',  (_, d)  => handleRuleUpdate(d));
ipcMain.handle('sync-now',     ()      => syncManager.syncRules());
ipcMain.handle('get-hard-mode',()      => store.get('hardModeActive', false));

async function handleRuleUpdate({ platform, patch }) {
  const rules = store.get('rules', {});
  rules[platform] = { ...rules[platform], ...patch };
  store.set('rules', rules);
  await hostsManager.applyRules(rules);
  updateTrayMenu();
  return { ok: true };
}
