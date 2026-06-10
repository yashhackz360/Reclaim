/**
 * FocusLock — Instagram Content Script
 * Hides Reels tab, Reels section in Explore, and Reels in feed.
 */
(function () {
  'use strict';

  const REELS_SELECTORS = [
    // Bottom nav Reels tab
    'a[href="/reels/"]',
    'a[href*="/reels"]',
    // Reels in Explore grid
    'article:has(video)',
    // Reels button in top nav (mobile web)
    '[aria-label="Reels"]',
    // Suggested Reels in feed
    'div[role="dialog"]:has(video)',
  ];

  let rules = {};

  async function init() {
    rules = await getRules();
    if (!rules.instagram_reels?.enabled) return;
    applyBlocking();
    startObserver();
  }

  function applyBlocking() {
    REELS_SELECTORS.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (el.dataset.flHidden) return;
          el.dataset.flHidden = '1';
          el.style.cssText = 'display:none!important';
          reportBlock('instagram_reels');
        });
      } catch {/* ignore invalid selector */ }
    });

    // Block direct /reels/ navigation
    if (window.location.pathname.startsWith('/reels')) {
      injectFullPageBlock('Instagram Reels');
    }
  }

  function injectFullPageBlock(label) {
    if (document.getElementById('fl-block-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'fl-block-overlay';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:linear-gradient(135deg,#0d0d1a,#1a1030);
      display:flex;align-items:center;justify-content:center;
      z-index:2147483647;font-family:-apple-system,sans-serif;color:white;
    `;
    overlay.innerHTML = `
      <div style="text-align:center;max-width:400px;padding:40px;
        background:rgba(255,255,255,0.05);border:1px solid rgba(108,71,255,0.3);
        border-radius:24px;">
        <div style="font-size:56px;margin-bottom:20px;">🔒</div>
        <h2 style="font-size:24px;font-weight:700;margin-bottom:12px;
          background:linear-gradient(135deg,#a78bfa,#6c47ff);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;">
          ${label} Blocked
        </h2>
        <p style="color:rgba(255,255,255,0.6);margin-bottom:24px;line-height:1.6;">
          FocusLock is helping you break the doom-scroll cycle.
        </p>
        <button onclick="history.back()" style="
          padding:12px 28px;background:linear-gradient(135deg,#6c47ff,#a855f7);
          border:none;border-radius:50px;color:white;font-size:15px;
          font-weight:600;cursor:pointer;">
          ← Go Back
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function startObserver() {
    new MutationObserver(applyBlocking)
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  async function getRules() {
    return new Promise(r => chrome.runtime.sendMessage({ type: 'GET_RULES' }, r));
  }

  function reportBlock(platform) {
    chrome.runtime.sendMessage({ type: 'BLOCK_EVENT', platform, url: location.href });
  }

  init().catch(console.error);
})();
