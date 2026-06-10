# Reclaim

> **Your attention belongs to you. Free and open source.**

Reclaim is a community-built distraction-elimination platform that blocks YouTube Shorts, Instagram Reels, TikTok, and short-form content across every device — permanently.

**Tagline:** Take back what matters. Your attention belongs to you.

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

---

## What Reclaim Blocks

| Platform  | Blocked surface               |
|-----------|-------------------------------|
| YouTube   | Shorts feed and Shorts player |
| Instagram | Reels tab and Reels player    |
| TikTok    | Entire domain                 |
| Facebook  | Reels section                 |
| X         | Video feed                    |
| Reddit    | Short video feed               |

## Repository Structure

```
reclaim/
├── focuslock-web/        # Marketing website (Next.js)
├── focuslock-extension/  # Browser extension — Chrome, Edge, Firefox (MV3)
├── focuslock-android/    # Android app (Flutter + Kotlin enforcement engine)
├── focuslock-desktop/    # Windows Desktop Agent (Electron + Windows Service)
└── focuslock-backend/    # Firebase backend (Cloud Functions, Firestore)
```

## Quick Start

### Browser Extension
```bash
# No build step required
# Load focuslock-extension/ as an unpacked extension in Chrome or Edge dev mode
```

### Website (local dev)
```bash
cd focuslock-web
npm install
npm run dev
# → http://localhost:3000
```

### Android App
```bash
cd focuslock-android
flutter pub get
flutter run
```

### Windows Agent
```bash
cd focuslock-desktop
npm install
npm run dev
```

### Backend (Firebase Emulators)
```bash
cd focuslock-backend/functions
npm install
firebase emulators:start
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). All contributors welcome — code, docs, issues, translations.

The most valuable contributions are often the simplest ones: a YouTube DOM update that broke the Shorts selector, a new TikTok subdomain, a clearer sentence in the README.

## Philosophy

Short-form content addiction is not a personal failure. It is the intended output of billions of dollars in engineering optimized for your time and attention.

The tools to fight back should be free, transparent, and owned by the people who need them — not by another subscription business.

Reclaim is a cause. Not a company.

## License

MIT — see [LICENSE](./LICENSE).
