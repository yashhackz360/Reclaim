/**
 * FocusLock — YouTube Content Script
 * Hides YouTube Shorts shelf, Shorts tab, and Shorts video player.
 * Uses MutationObserver to handle YouTube's SPA navigation.
 */

(function () {
  'use strict';

  // ─── Selectors ────────────────────────────────────────────────────────────
  const SHORTS_SELECTORS = [
    // Shorts shelf on homepage
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-reel-shelf-renderer',
    // Shorts item in left nav
    'ytd-guide-entry-renderer a[href="/shorts"]',
    'ytd-mini-guide-entry-renderer a[href="/shorts"]',
    // Individual Shorts thumbnails in search results
    'ytd-video-renderer:has(a[href*="/shorts/"])',
    'ytd-compact-video-renderer:has(a[href*="/shorts/"])',
    'ytd-grid-video-renderer:has(a[href*="/shorts/"])',
    // Shorts chip in search filters
    'yt-chip-cloud-chip-renderer:has([title="Shorts"])',
    // Shorts section heading
    '#content:has([aria-label="Shorts"])',
  ];

  const REELS_SELECTORS_YT = []; // YouTube only hosts Shorts

  let rules = { youtube_shorts: { enabled: true, action: 'block' } };
  let isActive = true;
  let violationCount = 0;

  // ─── Init ─────────────────────────────────────────────────────────────────
  async function init() {
    rules = await getRules();
    if (!rules.youtube_shorts?.enabled) return;
    applyBlocking();
    startObserver();
    listenForMessages();

    // Handle Shorts player page — redirect away
    if (isOnShortsPage()) {
      handleShortsPage();
    }
  }

  // ─── Core Blocking ────────────────────────────────────────────────────────
  function applyBlocking() {
    if (!isActive || !rules.youtube_shorts?.enabled) return;

    SHORTS_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.dataset.flHidden) return;
        el.dataset.flHidden = '1';

        if (rules.youtube_shorts.action === 'block') {
          el.style.cssText = 'display:none!important';
        } else {
          // 'warn' mode: add overlay
          wrapWithWarning(el, 'YouTube Shorts');
        }
        reportBlock('youtube_shorts');
      });
    });
  }

  // ─── Shorts Page Handler ──────────────────────────────────────────────────
  function isOnShortsPage() {
    return window.location.pathname.startsWith('/shorts');
  }

  function handleShortsPage() {
    if (rules.youtube_shorts.action === 'block') {
      // Inject full-page block overlay
      document.documentElement.innerHTML = buildBlockPage(
        'YouTube Shorts',
        'youtube_shorts',
        window.location.href
      );
    }
  }

  // ─── Warning Overlay ──────────────────────────────────────────────────────
  function wrapWithWarning(el, label) {
    if (el.dataset.flWarned) return;
    el.dataset.flWarned = '1';
    const wrapper = document.createElement('div');
    wrapper.className = 'fl-warn-wrapper';
    wrapper.style.cssText = 'position:relative;border:2px solid #6c47ff;border-radius:8px;overflow:hidden;';
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:absolute;top:0;left:0;width:100%;height:100%;
      background:rgba(108,71,255,0.92);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      z-index:9999;color:white;font-family:-apple-system,sans-serif;
      cursor:pointer;gap:8px;
    `;
    overlay.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      <span style="font-size:13px;font-weight:600;">FocusLock: ${label} Blocked</span>
      <button style="
        margin-top:4px;padding:4px 12px;background:rgba(255,255,255,0.2);
        border:1px solid rgba(255,255,255,0.4);border-radius:20px;
        color:white;font-size:11px;cursor:pointer;
      ">View anyway</button>
    `;
    overlay.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.remove();
    });
    el.parentNode?.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    wrapper.appendChild(overlay);
  }

  // ─── Block Page HTML ──────────────────────────────────────────────────────
  function buildBlockPage(label, platform, url) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blocked by FocusLock</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#0d0d1a 0%,#1a1030 100%);
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:white;
    }
    .card{
      text-align:center;max-width:440px;padding:48px 40px;
      background:rgba(255,255,255,0.05);border:1px solid rgba(108,71,255,0.3);
      border-radius:24px;backdrop-filter:blur(20px);
    }
    .lock-icon{font-size:64px;margin-bottom:24px;}
    h1{font-size:28px;font-weight:700;margin-bottom:12px;
       background:linear-gradient(135deg,#a78bfa,#6c47ff);
       -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    p{color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:28px;}
    .stat{
      background:rgba(108,71,255,0.15);border:1px solid rgba(108,71,255,0.3);
      border-radius:12px;padding:16px 20px;margin-bottom:24px;font-size:14px;color:#a78bfa;
    }
    .btn{
      display:inline-block;padding:12px 28px;
      background:linear-gradient(135deg,#6c47ff,#a855f7);
      border-radius:50px;color:white;font-weight:600;font-size:15px;
      text-decoration:none;border:none;cursor:pointer;
    }
    .back{margin-top:16px;font-size:13px;color:rgba(255,255,255,0.4);}
    .back a{color:#a78bfa;text-decoration:none;}
  </style>
</head>
<body>
  <div class="card">
    <div class="lock-icon">🔒</div>
    <h1>Blocked by FocusLock</h1>
    <p>${label} is blocked to help you reclaim your focus and build lasting habits.</p>
    <div class="stat" id="stat">Loading your stats...</div>
    <button class="btn" onclick="history.back()">← Go Back</button>
    <p class="back">Need access? <a href="#">Request unlock</a></p>
  </div>
  <script>
    chrome.storage.local.get('focuslock_stats', (data) => {
      const stats = data.focuslock_stats ?? {};
      const today = new Date().toISOString().split('T')[0];
      const todayStats = stats[today] ?? { blocks: {}, minutesSaved: 0 };
      const total = Object.values(todayStats.blocks).reduce((a,b)=>a+b,0);
      const saved = Math.round(todayStats.minutesSaved);
      document.getElementById('stat').textContent =
        'Today: ' + total + ' videos blocked · ' + saved + ' minutes saved';
    });
  <\/script>
</body>
</html>`;
  }

  // ─── MutationObserver (SPA navigation) ───────────────────────────────────
  function startObserver() {
    const observer = new MutationObserver(() => {
      applyBlocking();
      if (isOnShortsPage()) handleShortsPage();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ─── Message Listener ─────────────────────────────────────────────────────
  function listenForMessages() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'RULES_UPDATED') {
        getRules().then(r => { rules = r; applyBlocking(); });
      }
      if (msg.type === 'SESSION_STARTED') {
        isActive = true;
        applyBlocking();
      }
    });
  }

  // ─── Communication ────────────────────────────────────────────────────────
  async function getRules() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_RULES' }, resolve);
    });
  }

  function reportBlock(platform) {
    violationCount++;
    chrome.runtime.sendMessage({
      type: 'BLOCK_EVENT',
      platform,
      url: window.location.href,
    });
  }

  // ─── Run ──────────────────────────────────────────────────────────────────
  init().catch(console.error);
})();
