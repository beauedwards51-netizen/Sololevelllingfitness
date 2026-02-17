# 🎮 Solo Leveling Fitness - Next.js Web App

A fully-featured fitness tracking PWA built with Next.js 14, TypeScript, and React.

## 🚀 Quick Deploy to Vercel (1-Click)

### Option 1: Deploy from GitHub
1. Upload this folder to a new GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy" (Vercel auto-detects Next.js)
6. Done! Your app is live at `yourapp.vercel.app`

### Option 2: Deploy from Local (Using Vercel CLI)
```bash
npm install -g vercel
cd solo-leveling-nextjs
vercel
```

Follow the prompts and your app will be deployed!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Run production server locally
npm start
```

---

## 📱 Features

- ⚔️ **Daily & Side Quests** - Track fitness goals with progress logging
- 📊 **XP & Ranking System** - Level up from E to SSS rank
- 💪 **5 Stats** - STR, AGI, VIT, INT, END that grow with quests
- 🍽️ **Nutrition Tracker** - Log calories, protein, carbs, fat, water
- 📝 **Quick-Add Foods** - Pre-loaded common foods for fast logging
- 🎯 **Custom Goals** - Edit macro targets inline
- 🔥 **Streak Counter** - Track daily quest consistency
- 💾 **Auto-Save** - All progress saved to localStorage
- 📱 **PWA Ready** - Add to home screen, works offline
- 🎨 **Dark Theme** - Solo Leveling inspired design

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Inline CSS (no dependencies)
- **State:** React Hooks (useState, useEffect, useCallback)
- **Storage:** localStorage
- **Deployment:** Vercel (optimized static export)

---

## 📂 Project Structure

```
solo-leveling-nextjs/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main app component
│   └── globals.css         # Global styles
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── icon-192.png        # App icon (192x192)
│   └── icon-512.png        # App icon (512x512)
├── package.json            # Dependencies
├── next.config.js          # Next.js config (static export)
└── README.md               # This file
```

---

## 🌐 Deployment Platforms

This app works on:
- ✅ Vercel (recommended - auto-deploy from GitHub)
- ✅ Netlify
- ✅ GitHub Pages
- ✅ Cloudflare Pages
- ✅ Any static hosting

---

## 📱 Add to Home Screen

**iPhone (Safari):**
1. Open the deployed URL
2. Tap Share button (⬆️)
3. Tap "Add to Home Screen"

**Android (Chrome):**
1. Open the deployed URL
2. Tap menu (⋮)
3. Tap "Add to Home Screen"

---

## 🎯 Quick Start Guide

1. **Clone or download** this repository
2. **Upload to GitHub** (create new repo, upload all files)
3. **Go to Vercel.com** and sign up with GitHub
4. **Import your repository**
5. **Click Deploy**
6. **Open the URL** on your phone and add to home screen

That's it! Start grinding those quests! 💪⚔️
