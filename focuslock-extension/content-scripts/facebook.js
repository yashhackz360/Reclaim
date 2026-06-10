/**
 * FocusLock — Facebook Content Script
 * Hides Facebook Reels sections and Watch tab.
 */
(function () {
  'use strict';

  const REELS_SELECTORS = [
    // Reels section in left nav
    'a[href*="/reel/"]',
    '[aria-label="Reels"]',
    // Reels shelf in feed
    'div[data-pagelet*="FeedUnit"]:has(video)',
    // Watch tab
    'a[href="/watch/"]',
    // Reels in stories
    '[data-testid="reels_tray"]',
  ];

  async function init() {
    const rules = await getRules();
    if (!rules.facebook_reels?.enabled) return;
    applyBlocking();
    new MutationObserver(applyBlocking)
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  function applyBlocking() {
    REELS_SELECTORS.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (el.dataset.flHidden) return;
          el.dataset.flHidden = '1';
          el.style.cssText = 'display:none!important';
          reportBlock('facebook_reels');
        });
      } catch { /* ignore */ }
    });

    if (/facebook\.com\/reel/.test(location.href)) {
      injectBlock('Facebook Reels');
    }
  }

  function injectBlock(label) {
    if (document.getElementById('fl-fb-block')) return;
    const el = Object.assign(document.createElement('div'), { id: 'fl-fb-block' });
    el.style.cssText = `
      position:fixed;inset:0;background:linear-gradient(135deg,#0d0d1a,#1a1030);
      display:flex;align-items:center;justify-content:center;
      z-index:2147483647;font-family:-apple-system,sans-serif;color:white;
    `;
    el.innerHTML = `<div style="text-align:center;padding:40px;">
      <div style="font-size:52px;margin-bottom:20px;">🔒</div>
      <h2 style="font-size:22px;background:linear-gradient(135deg,#a78bfa,#6c47ff);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;">${label} Blocked</h2>
      <p style="color:rgba(255,255,255,0.6);margin:16px 0 24px;">FocusLock is keeping you on track.</p>
      <button onclick="history.back()" style="padding:12px 28px;background:linear-gradient(135deg,#6c47ff,#a855f7);
        border:none;border-radius:50px;color:white;font-weight:600;cursor:pointer;">← Go Back</button>
    </div>`;
    document.body?.appendChild(el);
  }

  async function getRules() {
    return new Promise(r => chrome.runtime.sendMessage({ type: 'GET_RULES' }, r));
  }

  function reportBlock(p) {
    chrome.runtime.sendMessage({ type: 'BLOCK_EVENT', platform: p, url: location.href });
  }

  init().catch(console.error);
})();
