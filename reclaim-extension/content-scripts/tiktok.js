/**
 * FocusLock — TikTok Content Script
 * Full page block — injects on document_start to prevent any content rendering.
 */
(function () {
  'use strict';

  async function init() {
    const rules = await getRules();
    if (!rules.tiktok?.enabled) return;

    // Block before DOM renders
    blockPage();
  }

  function blockPage() {
    // Freeze the document immediately
    document.documentElement.style.visibility = 'hidden';

    window.addEventListener('DOMContentLoaded', () => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        background:linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 100%);
        display:flex;align-items:center;justify-content:center;
        z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      `;
      overlay.innerHTML = `
        <div style="
          text-align:center;max-width:460px;padding:48px 40px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(108,71,255,0.35);
          border-radius:28px;backdrop-filter:blur(24px);
        ">
          <div style="
            width:80px;height:80px;margin:0 auto 28px;
            background:linear-gradient(135deg,#6c47ff20,#a855f720);
            border:2px solid rgba(108,71,255,0.4);
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            font-size:36px;
          ">🔒</div>
          <h1 style="
            font-size:26px;font-weight:800;margin-bottom:16px;letter-spacing:-0.5px;
            background:linear-gradient(135deg,#c4b5fd,#818cf8);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          ">TikTok Blocked</h1>
          <p style="color:rgba(255,255,255,0.55);line-height:1.7;margin-bottom:8px;font-size:15px;">
            FocusLock is protecting your focus and helping you reclaim control over your attention.
          </p>
          <p style="color:rgba(255,255,255,0.35);font-size:13px;margin-bottom:32px;">
            You've blocked TikTok because you know it's costing you more than you realize.
          </p>
          <div style="
            background:rgba(108,71,255,0.12);border:1px solid rgba(108,71,255,0.25);
            border-radius:14px;padding:16px;margin-bottom:28px;
          " id="fl-tiktok-stat">
            <span style="color:#a78bfa;font-size:14px;">Loading your progress...</span>
          </div>
          <button onclick="history.back()" style="
            width:100%;padding:14px;
            background:linear-gradient(135deg,#6c47ff,#a855f7);
            border:none;border-radius:14px;color:white;
            font-size:16px;font-weight:700;cursor:pointer;
            box-shadow:0 8px 32px rgba(108,71,255,0.4);
          ">← Return to Focus</button>
          <p style="margin-top:16px;font-size:12px;color:rgba(255,255,255,0.25);">
            Powered by FocusLock · Your accountability system
          </p>
        </div>
      `;
      document.body.style.margin = '0';
      document.body.appendChild(overlay);
      document.documentElement.style.visibility = 'visible';

      // Load stats
      chrome.storage.local.get('focuslock_stats', (data) => {
        const stats = data.focuslock_stats ?? {};
        const today = new Date().toISOString().split('T')[0];
        const s = stats[today] ?? { blocks: {}, minutesSaved: 0 };
        const totalToday = Object.values(s.blocks).reduce((a, b) => a + b, 0);
        const saved = Math.round(s.minutesSaved);
        const el = document.getElementById('fl-tiktok-stat');
        if (el) el.innerHTML = `
          <span style="color:#a78bfa;font-size:14px;font-weight:600;">
            Today: ${totalToday} videos blocked · ${saved} min saved
          </span>`;
      });
    });

    chrome.runtime.sendMessage({ type: 'BLOCK_EVENT', platform: 'tiktok', url: location.href });
  }

  async function getRules() {
    return new Promise(r => chrome.runtime.sendMessage({ type: 'GET_RULES' }, r));
  }

  init().catch(console.error);
})();
