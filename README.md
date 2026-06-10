# Reclaim

> **Your attention belongs to you. Not to an algorithm.**

I built Reclaim as an engineering student who got tired of losing hours of my life to the infinite scroll. Short-form content addiction (Shorts, Reels, TikTok) isn't a personal failure—it's the intended output of billions of dollars in engineering optimized to hijack your dopamine and keep you swiping.

Reclaim is a community-built, open-source distraction elimination platform. It blocks short-form content across every device. Permanently.

This isn't a startup. It's not a subscription service. It's a cause for human wellbeing. 

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

---

## What Reclaim Blocks

The goal is to aggressively filter out the noise without breaking the useful parts of the internet.

| Platform  | Blocked surface               |
|-----------|-------------------------------|
| YouTube   | Shorts feed and Shorts player |
| Instagram | Reels tab and Reels player    |
| TikTok    | Entire domain                 |
| Facebook  | Reels section                 |
| X         | Video feed                    |
| Reddit    | Short video feed               |

## Repository Structure

We enforce focus across every major platform. Dive into whatever stack you know best:

```text
reclaim/
├── reclaim-web/        # Marketing website (Next.js)
├── reclaim-extension/  # Browser extension — Chrome, Edge, Firefox (MV3)
├── reclaim-android/    # Android app (Flutter + Kotlin enforcement engine)
├── reclaim-desktop/    # Windows Desktop Agent (Electron + Windows Service)
└── reclaim-backend/    # Firebase backend (Cloud Functions, Firestore)
```

## Quick Start

### Browser Extension
```bash
# No build step required
# Load reclaim-extension/ as an unpacked extension in Chrome or Edge dev mode
```

### Website (local dev)
```bash
cd reclaim-web
npm install
npm run dev
# → http://localhost:3000
```

### Android App
```bash
cd reclaim-android
flutter pub get
flutter run
```

### Windows Agent
```bash
cd reclaim-desktop
npm install
npm run dev
```

### Backend (Firebase Emulators)
```bash
cd reclaim-backend/functions
npm install
firebase emulators:start
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). 

We are fighting against platforms with thousands of engineers dedicated to keeping users hooked. The only way we win is by building together. The most valuable contributions are often the simplest ones: fixing a YouTube DOM update that broke the Shorts selector, mapping a new TikTok subdomain, or improving documentation.

## Philosophy

The tools to fight algorithmic addiction should be free, transparent, and owned by the people who need them. Let's take our time back.

## License

MIT — see [LICENSE](./LICENSE).
