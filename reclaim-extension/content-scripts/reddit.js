/**
 * FocusLock — Reddit Content Script
 * Hides Reddit short video feeds, trending/popular videos.
 */
(function () {
  'use strict';

  const SHORT_SELECTORS = [
    // Video posts in feed
    'shreddit-post[post-type="video"]',
    'div[data-testid="post-container"]:has(video)',
    // Reddit video player
    '[data-click-id="media"]:has(video)',
    // Popular/trending video sections
    '[data-testid="recommended-video-section"]',
  ];

  async function init() {
    const rules = await getRules();
    if (!rules.reddit_shortfeed?.enabled) return;
    applyBlocking();
    new MutationObserver(applyBlocking)
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  function applyBlocking() {
    SHORT_SELECTORS.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (el.dataset.flHidden) return;
          el.dataset.flHidden = '1';
          el.style.cssText = 'display:none!important';
          reportBlock('reddit_shortfeed');
        });
      } catch { /* ignore */ }
    });
  }

  async function getRules() {
    return new Promise(r => chrome.runtime.sendMessage({ type: 'GET_RULES' }, r));
  }

  function reportBlock(p) {
    chrome.runtime.sendMessage({ type: 'BLOCK_EVENT', platform: p, url: location.href });
  }

  init().catch(console.error);
})();
