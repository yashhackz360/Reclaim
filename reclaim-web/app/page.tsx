"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Icons (Calm & Open) ─────────────────────────────── */
function IconSunrise({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      {/* 3 rays */}
      <line x1="22" y1="32" x2="22" y2="16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="22" y1="32" x2="9"  y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="22" y1="32" x2="35" y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Arc */}
      <path d="M 6 32 A 16 16 0 0 1 38 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* Broken horizon */}
      <line x1="0"  y1="32" x2="13" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="31" y1="32" x2="44" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
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

  const links = ["Philosophy", "Protect", "Commit", "Contribute", "FAQ"];

  return (
    <nav className={scrolled || mobileOpen ? "scrolled" : ""}>
      <div className="nav-inner">
        <a href="/" className="nav-brand" aria-label="Reclaim Home">
          <span className="nav-brand-mark" aria-hidden="true">
            <IconSunrise size={18} />
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
            <a href="https://github.com/yashhackz360/Reclaim" className="btn btn-secondary" target="_blank" rel="noopener noreferrer" aria-label="View on GitHub">
              <IconGithub /> GitHub
            </a>
            <a href="#choose-freedom" className="btn btn-primary">Take Control</a>
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
          <a href="https://github.com/yashhackz360/Reclaim" className="btn btn-secondary" target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
            <IconGithub /> GitHub
          </a>
          <a href="#choose-freedom" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%' }}>
            Take Control
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
      <div className="wrap">
        <div className="hero-tag">
          <span className="dot" aria-hidden="true" style={{ background: "var(--accent-primary)" }} />
          A Movement for Digital Autonomy
        </div>
        <h1>
          Your attention<br />
          belongs to you.
        </h1>
        <p className="hero-sub">
          Every hour reclaimed is an hour lived intentionally. Protect your focus from 
          platforms engineered to maximize endless consumption.
        </p>
        <div className="hero-actions">
          <a href="#choose-freedom" className="btn btn-primary btn-lg">
            Choose Freedom
          </a>
          <a href="#philosophy" className="btn btn-secondary btn-lg">
            Read the Manifesto <IconArrow />
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
    { name: "YouTube",   what: "Shorts feed replaced with calm" },
    { name: "Instagram", what: "Reels tab protected" },
    { name: "TikTok",    what: "Endless scrolling bypassed" },
    { name: "Facebook",  what: "Reels section recovered" },
    { name: "X",         what: "Video feed cleared" },
    { name: "Reddit",    what: "Short video feed silenced" },
  ];
  return (
    <section className="section" id="protect">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Protect</span>
          <h2>A sanctuary across every platform</h2>
          <p>Reclaim actively removes the engagement hooks and dopamine loops across the web, leaving only what you intentionally seek.</p>
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
      title: "Establish boundaries",
      body: "Decide what platforms deserve your energy. Protect your devices by installing the open-source filters.",
    },
    {
      n: "02",
      title: "Invite accountability",
      body: "Choose someone who supports your growth. They help you stay grounded when impulse tries to take over.",
    },
    {
      n: "03",
      title: "Protect your mornings",
      body: "Schedule deep intent windows. For example, choose to keep your phone free of short-form content before 12 PM.",
    },
    {
      n: "04",
      title: "Observe your growth",
      body: "Watch your reclaimed hours accumulate. Translate that time into reading, creating, or simply resting without guilt.",
    },
  ];
  return (
    <section className="section" id="philosophy">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Philosophy</span>
          <h2>The path to reclaiming your time</h2>
          <p>It is not about restriction. It is about creating deliberate space so you can choose what to do with your life.</p>
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
    { label: "Deep Intent",       title: "Commitment contracts",           body: "Make a promise to yourself for 30, 60, or 90 days. Changing boundaries requires reflection and a 24-hour cooldown." },
    { label: "Growth",            title: "Recovery analytics",             body: "Focus on what you gained. See your recovered hours translate into reading time, focused work, or healthy rest." },
    { label: "Sanctuary",         title: "Focus sessions",                 body: "Protect your environment during defined windows. Create dedicated periods for deep work without the noise." },
    { label: "Community",         title: "Accountability partner",         body: "Invite a friend to hold you to your goals. They review your boundary changes, ensuring you act with intention." },
  ];
  return (
    <section className="section" id="commit">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Commit</span>
          <h2>Designed to foster intentionality</h2>
          <p>Every feature is built to pause the impulse and remind you of the choices you made when your mind was clear.</p>
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
    ["Protects focus on Android",    "Partial", "No",      "Yes",     "No",          "Yes"],
    ["Protects focus on Windows",    "Yes",     "No",      "No",      "Yes",         "Yes"],
    ["System-level calmness",        "No",      "No",      "No",      "No",          "Yes"],
    ["Shared accountability",        "No",      "No",      "No",      "No",          "Yes"],
    ["Deep Intent commitment",       "Partial", "Yes",     "No",      "Partial",     "Yes"],
    ["Measures time recovered",      "No",      "Partial", "Partial", "No",          "Yes"],
    ["Cross-device harmony",         "Yes",     "No",      "No",      "No",          "Yes"],
    ["Free & open to everyone",      "No",      "No",      "No",      "Partial",     "Yes"],
  ];
  const cols = ["Capability", "Freedom", "Opal", "One Sec", "Cold Turkey", "Reclaim"];

  function Cell({ val, isLast }: { val: string; isLast: boolean }) {
    if (isLast) return <td className="fl">{val}</td>;
    if (val === "Yes")     return <td className="yes"><IconCheck /></td>;
    if (val === "No")      return <td className="no"></td>;
    if (val === "Partial") return <td className="no"></td>;
    return <td>{val}</td>;
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Landscape</span>
          <h2>Why this movement matters</h2>
          <p>We believe protecting your attention shouldn't require a monthly subscription. It should be a fundamental right.</p>
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
      body: "Help us build a calmer web. Every platform needs stewards to maintain the filters.",
      link: "https://github.com/yashhackz360/Reclaim"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r=".5" fill="currentColor" />
        </svg>
      ),
      title: "Report Intrusions",
      body: "If a platform updates its interface to bypass our protection, let the community know.",
      link: "https://github.com/yashhackz360/Reclaim/issues"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      title: "Share Knowledge",
      body: "Write guides, improve setup instructions, and share your recovery journey.",
      link: "https://github.com/yashhackz360/Reclaim"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: "Support the Cause",
      body: "Star the repository to increase visibility so others can discover this sanctuary.",
      link: "https://github.com/yashhackz360/Reclaim"
    },
  ];
  return (
    <section className="section" id="contribute">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Open Source</span>
          <h2>Built by humans, for humans</h2>
          <p>
            Algorithmic feeds are maintained by thousands of engineers optimizing for your attention. 
            The only way we protect our time is by building the counter-movement together.
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
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    {
      q: "Am I giving up control of my devices?",
      a: "Absolutely not. Reclaim is built on the philosophy that you are the ultimate owner of your devices. We simply introduce deliberate friction—like a 24-hour waiting period or partner approval—so that your intentional choices can override your momentary impulses.",
    },
    {
      q: "How does the browser extension protect my focus?",
      a: "The extension peacefully removes Shorts, Reels, and engaging video sections as the page loads. It removes the visual noise so you can use the platform for its utility without getting pulled into the infinite scroll.",
    },
    {
      q: "Is my recovery data private?",
      a: "Yes. Your progress, recovered hours, and settings are stored privately in your database document. They are only shared with the accountability partner you explicitly invite. We have no interest in your data; we are interested in your freedom.",
    },
  ];
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="sh reveal" ref={useReveal()}>
          <span className="sh-tag">Clarity</span>
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
function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function Download() {
  const r = useReveal();
  // Chrome Extension (ZIP) + Windows Desktop EXE + Android APK shipped in v0.3
  const releaseBase = "https://github.com/yashhackz360/Reclaim/releases/download/v0.2.6-alpha";
  const cards = [
    {
      platform: "Chrome / Edge",
      tech: "Manifest V3 · Vanilla JS",
      source: "https://github.com/yashhackz360/Reclaim/tree/main/reclaim-extension",
      downloadUrl: `${releaseBase}/reclaim-extension.zip`,
      downloadLabel: "Download ZIP",
      comingSoon: false,
      instructions: "Unzip → chrome://extensions → Load unpacked → select the folder",
    },
    {
      platform: "Windows",
      tech: "Electron · Node.js",
      source: "https://github.com/yashhackz360/Reclaim/tree/main/reclaim-desktop",
      downloadUrl: `${releaseBase}/reclaim-desktop.zip`,
      downloadLabel: "Download EXE",
      comingSoon: false,
      instructions: "Run setup as Administrator to enable system-level blocking",
    },
    {
      platform: "Android",
      tech: "Kotlin · Jetpack Compose",
      source: "https://github.com/yashhackz360/Reclaim/tree/main/reclaim-android",
      downloadUrl: `${releaseBase}/reclaim-android.apk`,
      downloadLabel: "Download APK",
      comingSoon: false,
      instructions: "Enable FocusLock in Accessibility Settings after install to activate short-form video blocking",
    },
  ];

  return (
    <section className="section" id="choose-freedom">
      <div className="wrap">
        <div className="cta-banner reveal" ref={r}>
          <span className="sh-tag">Begin</span>
          <h2>Choose your time</h2>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto var(--space-4)" }}>
            Open-source tools across your devices. No account, no tracking — just focus.
          </p>
          <div className="download-grid">
            {cards.map(c => (
              <div className={`dl-card${c.comingSoon ? " dl-card-soon" : ""}`} key={c.platform}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h3 className="dl-platform" style={{ margin: 0 }}>{c.platform}</h3>
                  {c.comingSoon && (
                    <span style={{
                      marginLeft: "auto", fontSize: "10px", fontWeight: 600,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      background: "var(--amber-l, #FEF3C7)", color: "var(--amber, #D97706)",
                      padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(217,119,6,0.2)"
                    }}>v0.3</span>
                  )}
                </div>
                <p className="dl-tech">{c.tech}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: 1.5 }}>
                  {c.instructions}
                </p>
                <div className="dl-actions">
                  {c.comingSoon ? (
                    <span className="dl-btn-label dl-btn-primary" style={{ opacity: 0.4, cursor: "not-allowed", pointerEvents: "none" }}>
                      Coming soon
                    </span>
                  ) : (
                    <a
                      href={c.downloadUrl!}
                      className="dl-btn-label dl-btn-primary"
                      download
                    >
                      <IconDownload /> {c.downloadLabel}
                    </a>
                  )}
                  <a
                    href={c.source}
                    className="dl-btn-label dl-btn-secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconCode /> View Source
                  </a>
                </div>
              </div>
            ))}
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
                <IconSunrise size={18} />
              </span>
              Reclaim
            </a>
            <p className="footer-desc">
              Technology should serve you. Never the other way around. Free, open source, and built by the community.
            </p>
          </div>
          {[
            { title: "Movement",  links: ["Philosophy", "Protect", "Commit", "Begin"] },
            { title: "Project",  links: ["GitHub", "Manifesto", "Contributing", "Roadmap"] },
            { title: "Legal",    links: ["Privacy", "Terms", "MIT License", "Security"] },
          ].map(col => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(l => (
                  <li key={l}>
                    <a href={l === "GitHub" ? "https://github.com/yashhackz360/Reclaim" : "#"} target={l === "GitHub" ? "_blank" : undefined} rel={l === "GitHub" ? "noopener noreferrer" : undefined}>
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
