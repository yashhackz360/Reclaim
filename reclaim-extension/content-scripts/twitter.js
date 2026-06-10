/**
 * FocusLock — Twitter/X Content Script
 * Hides video feed, For You algorithmic videos, trending videos.
 */
(function () {
  'use strict';

  const VIDEO_SELECTORS = [
    // Video tweets in feed
    'article:has(video)',
    // Twitter video player
    '[data-testid="videoPlayer"]',
    // Explore trending video section
    '[data-testid="trend"]:has(video)',
  ];

  async function init() {
    const rules = await getRules();
    if (!rules.twitter_videos?.enabled) return;
    const action = rules.twitter_videos.action ?? 'warn';
    applyBlocking(action);
    new MutationObserver(() => applyBlocking(action))
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  function applyBlocking(action) {
    VIDEO_SELECTORS.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (el.dataset.flDone) return;
          el.dataset.flDone = '1';
          if (action === 'block') {
            el.style.cssText = 'display:none!important';
          } else {
            muteAndCover(el);
          }
          reportBlock('twitter_videos');
        });
      } catch { /* ignore */ }
    });
  }

  function muteAndCover(el) {
    const video = el.querySelector('video');
    if (video) { video.muted = true; video.pause(); }
    const cover = document.createElement('div');
    cover.style.cssText = `
      position:absolute;inset:0;background:rgba(108,71,255,0.85);
      display:flex;align-items:center;justify-content:center;
      border-radius:8px;cursor:pointer;color:white;font-size:13px;font-weight:600;
      font-family:-apple-system,sans-serif;gap:8px;z-index:10;
    `;
    cover.innerHTML = '🔒 FocusLock: Video Hidden <small style="opacity:0.7">(click to reveal)</small>';
    cover.onclick = () => cover.remove();
    el.style.position = 'relative';
    el.appendChild(cover);
  }

  async function getRules() {
    return new Promise(r => chrome.runtime.sendMessage({ type: 'GET_RULES' }, r));
  }

  function reportBlock(p) {
    chrome.runtime.sendMessage({ type: 'BLOCK_EVENT', platform: p, url: location.href });
  }

  init().catch(console.error);
})();
