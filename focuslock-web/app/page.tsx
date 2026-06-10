"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Icons (inline SVG, minimal & sharp) ─────────────────────────────── */
function IconLock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="8" rx="2" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8h9M8 3.5 12.5 8 8 12.5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3.5 3.5L13 4" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 7h8" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* ─── Scroll-reveal hook ────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}


/* ─── Nav ───────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["How it works", "Features", "Platforms", "Contribute", "FAQ"];

  return (
    <nav className={scrolled || mobileOpen ? "scrolled" : ""}>
      <div className="nav-inner">
        <a href="/" className="nav-brand" aria-label="Reclaim Home">
          <span className="nav-brand-mark" aria-hidden="true">
            <IconLock size={14} />
          </span>
          Reclaim
        </a>
        
        <div className="nav-desktop-menu">
          <ul className="nav-links">
            {links.map(l => (
              <li key={l}>
                <a href={`#${l.toLowerCase().replace(/ /g, "-")}`}>{l}</a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <a href="https://github.com/reclaim-app/reclaim" className="btn btn-secondary" target="_blank" rel="noopener noreferrer" aria-label="View on GitHub">
              <IconGithub /> GitHub
            </a>
            <a href="#download" className="btn btn-primary">Get Started</a>
          </div>
        </div>

        <button 
          className="nav-mobile-btn" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      <div className={`nav-mobile-panel ${mobileOpen ? 'open' : ''}`}>
        <ul>
          {links.map(l => (
            <li key={l}>
              <a href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMobileOpen(false)}>
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <a href="https://github.com/reclaim-app/reclaim" className="btn btn-secondary" target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
            <IconGithub /> GitHub
          </a>
          <a href="#download" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%' }}>
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" />
      <div className="hero-inner">
        <div className="hero-tag">
          <span className="dot" aria-hidden="true" />
          Free &amp; Open Source · MIT License
        </div>
        <h1>
          Take back<br />
          <span style={{ color: "var(--accent-light)" }}>what matters.</span>
        </h1>
        <p className="hero-sub">
          Your attention belongs to you. Reclaim blocks YouTube Shorts, Instagram Reels,
          TikTok and all short-form content across every device — permanently.
        </p>
        <div className="hero-actions">
          <a href="https://github.com/reclaim-app/reclaim" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
            <IconGithub /> View on GitHub
          </a>
          <a href="#how-it-works" className="btn btn-secondary btn-lg">
            How it works <IconArrow />
          </a>
        </div>
      </div>
    </section>
  );
}


/* ─── Platforms ─────────────────────────────────────────────────────────── */
function Platforms() {
  const r = useReveal();
  const items = [
    { name: "YouTube",   what: "Shorts feed & player" },
    { name: "Instagram", what: "Reels tab & player" },
    { name: "TikTok",    what: "Entire domain" },
    { name: "Facebook",  what: "Reels section" },
    { name: "X",         what: "Video feed" },
    { name: "Reddit",    what: "Short video feed" },
  ];
  return (
    <section className="section" id="platforms">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Platforms</span>
          <h2>Blocked everywhere it matters</h2>
          <p>Reclaim targets every surface where short-form content hijacks your attention.</p>
        </div>
        <div className="grid-container platforms-grid reveal" ref={r}>
          {items.map(p => (
            <div className="card platform-item" key={p.name}>
              <div className="platform-dot" aria-hidden="true" />
              <h3 className="platform-name">{p.name}</h3>
              <p className="platform-what">{p.what}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it Works ──────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Install on your devices",
      body: "Download the Android app, install the browser extension, and run the Windows agent. All three sync automatically to your account.",
    },
    {
      n: "02",
      title: "Configure your blocks",
      body: "Choose which platforms to block, set daily time limits, and schedule focus windows — for example, no Shorts from 9 AM to 6 PM on weekdays.",
    },
    {
      n: "03",
      title: "Add an accountability partner",
      body: "Invite someone you trust. They receive unlock requests and see your progress. This is what makes restrictions actually hold.",
    },
    {
      n: "04",
      title: "Enable Hard Mode",
      body: "Commit to 30, 60, or 90 days. Unlocking requires partner approval, a recovery password, and a 24-hour waiting period. Deliberately difficult.",
    },
    {
      n: "05",
      title: "Watch the data",
      body: "Track videos blocked, hours recovered, and daily streaks. The analytics are confronting — and motivating.",
    },
  ];
  return (
    <section className="section" id="how-it-works">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">How it works</span>
          <h2>Straightforward. Effective.</h2>
          <p>Five steps to permanently changing your relationship with short-form content.</p>
        </div>
        <div className="steps reveal" ref={useReveal()}>
          {steps.map(s => (
            <div className="step" key={s.n}>
              <div className="step-num" aria-hidden="true">{s.n}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ──────────────────────────────────────────────────────────── */
function Features() {
  const features = [
    { label: "Enforcement",       title: "System-level blocking",          body: "Accessibility service and local VPN filtering on Android. Hosts-file management on Windows. Content is blocked before it loads." },
    { label: "Accountability",    title: "Partner approval system",        body: "Unlock requests require your partner's response. They cannot be bypassed unilaterally. The wait period is enforced server-side." },
    { label: "Analytics",         title: "Recovery dashboard",             body: "Videos blocked, hours recovered, and streak data — updated in real time across all your devices." },
    { label: "Hard Mode",         title: "Commitment contracts",           body: "Set a 30, 60, or 90-day lock. Modifying rules requires partner approval, your recovery password, and a 24-hour cooldown." },
    { label: "Focus Sessions",    title: "Scheduled blocking",             body: "Block everything during defined windows. Work, study, and deep-focus modes with custom start and end times." },
    { label: "Sync",              title: "Real-time cross-device sync",    body: "Rules, sessions, streaks, and analytics stay consistent across Android, Windows, and the browser extension via Firebase Realtime." },
  ];
  return (
    <section className="section" id="features">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Features</span>
          <h2>Designed to be difficult to bypass</h2>
          <p>Every competitor can be disabled in seconds. Reclaim is built around the psychology of impulsive behavior.</p>
        </div>
        <div className="grid-container features-grid reveal" ref={useReveal()}>
          {features.map(f => (
            <div className="card card-hoverable feature" key={f.label}>
              <span className="feature-label">{f.label}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Comparison ────────────────────────────────────────────────────────── */
function Comparison() {
  const rows: [string, string, string, string, string, string][] = [
    ["Android enforcement",         "Partial", "No",      "Yes",     "No",          "Yes"],
    ["Windows desktop agent",       "Yes",     "No",      "No",      "Yes",         "Yes"],
    ["VPN-level filtering",         "No",      "No",      "No",      "No",          "Yes"],
    ["Accountability partner",      "No",      "No",      "No",      "No",          "Yes"],
    ["Hard Mode / commitment lock", "Partial", "Yes",     "No",      "Partial",     "Yes"],
    ["Recovery analytics",          "No",      "Partial", "Partial", "No",          "Yes"],
    ["Cross-device real-time sync", "Yes",     "No",      "No",      "No",          "Yes"],
    ["Free & open source",          "No",      "No",      "No",      "Partial",     "Yes"],
  ];
  const cols = ["Feature", "Freedom", "Opal", "One Sec", "Cold Turkey", "Reclaim"];

  function Cell({ val, isLast }: { val: string; isLast: boolean }) {
    if (isLast) return <td className="fl">{val}</td>;
    if (val === "Yes")     return <td className="yes"><IconCheck /></td>;
    if (val === "No")      return <td className="no"><IconX /></td>;
    if (val === "Partial") return <td className="no"><IconMinus /></td>;
    return <td>{val}</td>;
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Comparison</span>
          <h2>How Reclaim stacks up</h2>
          <p>No competitor combines Android enforcement, a desktop agent, and accountability systems in a single free tool.</p>
        </div>
        <div className="reveal table-wrapper" ref={useReveal()}>
          <table className="comp-table">
            <thead>
              <tr>
                {cols.map((c, i) => (
                  <th key={c} className={i === cols.length - 1 ? "fl" : ""} scope="col">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row[0]}>
                  <td style={{ color: "var(--text-secondary)", textAlign: "left" }} scope="row">{row[0]}</td>
                  {row.slice(1).map((v, i) => (
                    <Cell key={i} val={v} isLast={i === row.length - 2} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ─── Contribute ────────────────────────────────────────────────────────── */
function Contribute() {
  const ways = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 12 14 8 18" /><polyline points="8 6 12 2 16 6" />
          <path d="M4 2H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2" /><line x1="12" y1="2" x2="12" y2="14" />
        </svg>
      ),
      title: "Write Code",
      body: "Fix bugs, build features, improve performance. Every platform needs contributors.",
      link: "https://github.com/reclaim-app/reclaim"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r=".5" fill="currentColor" />
        </svg>
      ),
      title: "Report Issues",
      body: "Found a broken selector or a site update that bypasses blocking? Open an issue.",
      link: "https://github.com/reclaim-app/reclaim/issues"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      title: "Improve Docs",
      body: "Write guides, improve setup instructions, translate to other languages.",
      link: "https://github.com/reclaim-app/reclaim"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: "Star the Repo",
      body: "Starring on GitHub increases visibility and helps more people discover Reclaim.",
      link: "https://github.com/reclaim-app/reclaim"
    },
  ];
  return (
    <section className="section" id="contribute">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Open Source</span>
          <h2>Built by the community, for the community</h2>
          <p>
            Short-form content addiction is a public health issue manufactured by billion-dollar companies.
            The tools to fight back should be free, transparent, and community-owned.
          </p>
        </div>
        <div className="grid-container contribute-grid reveal" ref={useReveal()}>
          {ways.map(w => (
            <a href={w.link} className="card card-hoverable" key={w.title} target="_blank" rel="noopener noreferrer">
              <div className="cc-icon">{w.icon}</div>
              <h3>{w.title}</h3>
              <p>{w.body}</p>
            </a>
          ))}
        </div>
        <div className="code-block reveal" ref={useReveal()}>
          <div className="code-bar">
            <span className="code-dot" /><span className="code-dot" /><span className="code-dot" />
          </div>
          <div className="code-body">
            <div className="c-dim"># Clone and contribute</div>
            <div>
              <span className="c-cmd">git</span>{" "}
              <span className="c-str">clone</span>{" "}
              <span className="c-path">https://github.com/reclaim-app/reclaim</span>
            </div>
            <div>
              <span className="c-cmd">cd</span>{" "}
              <span className="c-path">reclaim/focuslock-extension</span>
            </div>
            <div className="c-dim"># Load as unpacked extension — no build step</div>
            <div>
              <span className="c-cmd">cd</span>{" "}
              <span className="c-path">../focuslock-web</span>{" "}
              <span className="c-dim">&amp;&amp;</span>{" "}
              <span className="c-cmd">npm</span>{" "}
              <span className="c-str">run dev</span>
            </div>
            <div><span className="c-cursor" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    {
      q: "Can I completely bypass Reclaim?",
      a: "As the device owner you always have ultimate control — Reclaim does not claim otherwise. What it does is create deliberate friction: 24-hour waiting periods, accountability partner approval, a recovery password, and cooldown delays. The goal is making impulsive bypasses psychologically costly enough that you choose not to.",
    },
    {
      q: "How does the browser extension block content?",
      a: "The extension uses MutationObserver to detect and remove Shorts, Reels, and video sections as platforms load them dynamically. For TikTok, it intercepts the page before any content renders. Selectors are updated whenever platforms change their DOM structure — you can contribute updates directly on GitHub.",
    },
    {
      q: "Will the Android app drain my battery?",
      a: "The local VPN layer uses DNS-only interception, not full packet inspection, which is extremely lightweight. The Accessibility Service only activates on window focus changes. In testing, Reclaim adds under 2% to daily battery usage.",
    },
    {
      q: "What happens if my partner does not respond to an unlock request?",
      a: "Unlock requests expire after 72 hours with no response and are treated as rejected. You can send one request per 24 hours per rule. This prevents both abandonment and abuse.",
    },
    {
      q: "Is my data private?",
      a: "Analytics and violation data are stored in your personal Firestore document, accessible only to you and partners you explicitly invite. Reclaim does not sell data. The local VPN processes all traffic on-device — nothing is transmitted to our servers.",
    },
    {
      q: "Can I contribute if I am not a developer?",
      a: "Yes. The most valuable contributions are often issue reports: a YouTube update that broke the Shorts selector, a new TikTok subdomain that bypasses the VPN filter. You can also improve documentation, write guides, or help translate the app.",
    },
  ];
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">FAQ</span>
          <h2>Common questions</h2>
        </div>
        <div className="faq reveal" ref={useReveal()}>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className="faq-item" key={i}>
                <button 
                  className="faq-btn" 
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-btn-${i}`}
                >
                  {item.q}
                  <span className="faq-icon" aria-hidden="true">+</span>
                </button>
                <div 
                  className="faq-body" 
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                >
                  <div className="faq-body-inner">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Download ──────────────────────────────────────────────────────────── */
function Download() {
  const r = useReveal();
  const cards = [
    { platform: "Android",           tech: "Flutter · Kotlin",     label: "Download APK",    soon: false, href: "https://github.com/reclaim-app/reclaim/releases" },
    { platform: "Chrome / Edge",      tech: "Manifest V3",          label: "Add to Browser",  soon: false, href: "https://github.com/reclaim-app/reclaim/releases" },
    { platform: "Windows",            tech: "Electron · Node",      label: "Download .exe",   soon: false, href: "https://github.com/reclaim-app/reclaim/releases" },
    { platform: "Firefox",            tech: "Manifest V3",          label: "Coming Soon",     soon: true,  href: "#" },
  ];
  return (
    <section className="section" id="download">
      <div className="wrap">
        <div className="cta-banner reveal" ref={r}>
          <span className="sh-tag">Download</span>
          <h2>Install on every device</h2>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto var(--space-4)" }}>
            No account required to get started. Install, configure, and block in under five minutes.
          </p>
          <div className="grid-container download-grid">
            {cards.map(c => {
              const Tag = c.soon ? "div" : "a";
              return (
                <Tag 
                  href={c.soon ? undefined : c.href} 
                  className={`dl-card${c.soon ? " soon" : ""}`} 
                  key={c.platform}
                  {...(c.soon ? { 'aria-disabled': true } : {})}
                >
                  <h3 className="dl-platform">{c.platform}</h3>
                  <p className="dl-tech">{c.tech}</p>
                  <span className="dl-btn-label">{c.label}</span>
                </Tag>
              );
            })}
          </div>
          <div className="hero-actions">
            <a href="https://github.com/reclaim-app/reclaim" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
              <IconGithub /> Star on GitHub
            </a>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">Read the Docs</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div>
            <a href="#top" className="footer-brand" aria-label="Reclaim Home">
              <span className="footer-brand-mark" aria-hidden="true">
                <IconLock size={14} />
              </span>
              Reclaim
            </a>
            <p className="footer-desc">
              Your attention belongs to you. Free, open source, and built by the community.
            </p>
          </div>
          {[
            { title: "Product",  links: ["How it works", "Features", "Platforms", "Download"] },
            { title: "Project",  links: ["GitHub", "Changelog", "Contributing", "Roadmap"] },
            { title: "Legal",    links: ["Privacy", "Terms", "MIT License", "Security"] },
          ].map(col => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(l => (
                  <li key={l}>
                    <a href={l === "GitHub" ? "https://github.com/reclaim-app/reclaim" : "#"} target={l === "GitHub" ? "_blank" : undefined} rel={l === "GitHub" ? "noopener noreferrer" : undefined}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Reclaim. Released under the MIT License.</p>
          <span className="footer-mit" aria-label="Open Source License">Open Source</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Platforms />
        <HowItWorks />
        <Features />
        <Comparison />
        <Contribute />
        <FAQ />
        <Download />
      </main>
      <Footer />
    </>
  );
}
