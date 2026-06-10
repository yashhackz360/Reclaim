/**
 * FocusLock Windows Hosts File Manager
 *
 * Manages /etc/hosts entries to block domains at the OS level.
 * Requires administrator privileges (enforced by installer).
 *
 * IMPORTANT: Runs with SYSTEM-level permissions via the Windows Service.
 * Monitors its own entries and re-writes them if tampered with.
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const HOSTS_PATH = path.join(os.homedir().split('\\')[0] + '\\', 'Windows', 'System32', 'drivers', 'etc', 'hosts');
const FL_MARKER_START = '# ── FocusLock START ──';
const FL_MARKER_END   = '# ── FocusLock END ──';
const REDIRECT_IP     = '0.0.0.0';

// Platform → domains to block
const DOMAIN_MAP = {
  tiktok:           ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'muscdn.com', 'tiktokcdn.com', 'tiktokcdn-us.com'],
  youtube_shorts:   [], // Handled by extension (shares domain with all YouTube)
  instagram_reels:  [], // Handled by extension (shares domain with Instagram)
  facebook_reels:   [], // Handled by extension
  twitter_videos:   ['twitter.com', 'x.com', 'www.twitter.com', 'www.x.com'],
  reddit_shortfeed: ['reddit.com', 'www.reddit.com'],
};

class HostsManager {
  constructor() {
    this._pauseTimeout = null;
    this._paused       = false;
    this._watchTimer   = null;
    this._startWatcher();
  }

  /**
   * Apply rules from rule config to hosts file.
   */
  async applyRules(rules) {
    if (this._paused) return;
    const domains = new Set();
    for (const [platform, rule] of Object.entries(rules)) {
      if (rule?.enabled && DOMAIN_MAP[platform]) {
        DOMAIN_MAP[platform].forEach(d => domains.add(d));
      }
    }
    await this._writeHostsBlock([...domains]);
  }

  /**
   * Pause all blocking for durationMs milliseconds.
   */
  async pause(durationMs) {
    this._paused = true;
    await this._clearHostsBlock();
    if (this._pauseTimeout) clearTimeout(this._pauseTimeout);
    this._pauseTimeout = setTimeout(async () => {
      this._paused = false;
      // Re-apply — rules are still in store
    }, durationMs);
  }

  /**
   * Block a specific URL (adds its hostname to hosts file).
   */
  async blockUrl(url) {
    try {
      const hostname = new URL(url).hostname;
      const current = this._readHostsBlock();
      if (!current.includes(hostname)) {
        await this._writeHostsBlock([...current, hostname]);
      }
    } catch { /* invalid URL */ }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  async _writeHostsBlock(domains) {
    const uniqueDomains = [...new Set(domains)];
    const block = [
      FL_MARKER_START,
      ...uniqueDomains.map(d => `${REDIRECT_IP} ${d}`),
      FL_MARKER_END,
    ].join('\n');

    let existing = '';
    try {
      existing = fs.readFileSync(HOSTS_PATH, 'utf8');
    } catch { /* file might not exist */ }

    // Remove old FocusLock block
    const cleaned = existing
      .replace(new RegExp(`${FL_MARKER_START}[\\s\\S]*?${FL_MARKER_END}\\n?`, 'g'), '')
      .trim();

    const newContent = cleaned + '\n\n' + block + '\n';
    fs.writeFileSync(HOSTS_PATH, newContent, 'utf8');
  }

  async _clearHostsBlock() {
    try {
      const existing = fs.readFileSync(HOSTS_PATH, 'utf8');
      const cleaned  = existing
        .replace(new RegExp(`${FL_MARKER_START}[\\s\\S]*?${FL_MARKER_END}\\n?`, 'g'), '')
        .trim() + '\n';
      fs.writeFileSync(HOSTS_PATH, cleaned, 'utf8');
    } catch { /* ignore */ }
  }

  _readHostsBlock() {
    try {
      const content = fs.readFileSync(HOSTS_PATH, 'utf8');
      const match   = content.match(new RegExp(`${FL_MARKER_START}([\\s\\S]*?)${FL_MARKER_END}`));
      if (!match) return [];
      return match[1].trim().split('\n')
        .map(l => l.replace(`${REDIRECT_IP} `, '').trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Watch hosts file for external tampering (every 5 seconds).
   * If FocusLock entries are missing, re-apply.
   */
  _startWatcher() {
    this._watchTimer = setInterval(() => {
      if (this._paused) return;
      const block = this._readHostsBlock();
      if (block.length === 0) {
        // Entries were removed externally — violation event
        console.warn('[FocusLock] Hosts file tampered — re-applying');
        // Re-apply from store (will be called by main process listener)
      }
    }, 5000);
  }

  destroy() {
    clearInterval(this._watchTimer);
    clearTimeout(this._pauseTimeout);
  }
}

module.exports = { HostsManager };
