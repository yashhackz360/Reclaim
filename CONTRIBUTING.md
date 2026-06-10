# Contributing to Reclaim

Hey! Thank you for wanting to help build Reclaim. 

I started this project as an engineering student because I realized how much of my life was being stolen by short-form content. If you're here, you probably feel the same way. 

We are fighting against platforms with thousands of engineers dedicated to keeping users hooked. The only way we win is by building together.

## How You Can Help

You don't need to be a senior architect to contribute to this cause. 

### 1. Fix a Broken Selector (The most common issue!)
Platforms like YouTube and TikTok constantly change their DOM to bypass blockers. If you notice a Shorts feed slipping through, find the new CSS selector and submit a PR to update the extension. This is the frontline of the project.

### 2. Squashing Bugs
Found a bug? 
- Check the [Issues](https://github.com/yashhackz360/Reclaim/issues) to see if someone else already reported it.
- If not, open an issue. Provide screenshots, console logs, and steps to reproduce.
- Better yet, open a PR with the fix!

### 3. Adding Features
If you have an idea that helps users reclaim their focus, let's hear it. Open a `Feature Request` issue first so we can discuss how it fits into the ecosystem before you spend hours coding it. We want to keep the tool ruthlessly focused on its core mission.

## The Stack
Reclaim is a monorepo. Jump into whatever layer you're most comfortable with:
- `reclaim-web/`: The marketing site (Next.js, React)
- `reclaim-extension/`: Browser extension (Manifest V3, Vanilla JS)
- `reclaim-android/`: Android app (Flutter + Kotlin)
- `reclaim-desktop/`: Windows Agent (Electron + Node)
- `reclaim-backend/`: The backend (Firebase)

## PR Guidelines
1. Fork the repo and branch off `main`.
2. Keep it simple and readable.
3. Test your code. Don't accidentally break the blocking engine!
4. Submit the PR and give us a bit of context on what you fixed.

Let's take our time back.
