# PulseChat — Modern Personal Messaging Platform

> Private, high-fidelity personal messaging designed specifically for you and your inner circle. **Zero phone numbers required.**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ayangayen000-code/pulsechat)

PulseChat operates on **Unique User IDs** (e.g., `@ayan_4821`), eliminating the need for SMS verification or phone number disclosure. It runs seamlessly across mobile phones, tablets, and desktop computers with a responsive PWA architecture.

---

## ✨ Features Breakdown

### 1. Identity & Privacy (No Phone Numbers)
- **Unique User ID Handle**: Every account receives a distinct identifier (e.g. `@ayan_4821`).
- **Personal QR Code**: Quick-scan and share your profile QR code with friends.
- **Friend Management**:
  - Search by User ID or username
  - Send, Accept, Reject, or Cancel friend requests
  - Friends list with real-time online status and direct chat action
  - Block and Unblock privacy controls

### 2. 1-to-1 & Group Messaging
- **Real-time Delivery**: Instant Socket.io messaging with sent, delivered, and read checkmarks.
- **Group Chats**:
  - Multi-admin support (Owner, Admin, Member roles)
  - Customizable group avatar and description
  - Mention members with `@username`
  - Pinned announcement banners
  - Member management (add, remove, promote, leave)
- **Message Actions**:
  - Reply with quotation preview
  - Multi-emoji reactions (❤️ 😂 🔥 👍 😭 🎉 😍 👎) with live counts
  - Copy message content
  - Edit sent messages with `(edited)` indicator
  - Delete for everyone

### 3. Rich Media & Voice Notes
- **Voice Notes with Live Waveform**:
  - Live microphone recording with interactive waveform visualizer and timer
  - In-chat voice note player with scrubbable waveform and playback speed selector (`1.0x`, `1.5x`, `2.0x`)
- **Photos & Images**:
  - Multi-image selection with thumbnail preview before sending
  - Responsive multi-image media grid inside bubbles
  - Full-screen lightbox viewer with zoom and direct download
- **Videos**:
  - Built-in video player with play/pause, scrub bar, mute/volume, and fullscreen
  - Videos never auto-play with sound for a respectful experience
- **Documents & Files**:
  - Native file cards for PDF, DOCX, XLSX, ZIP, TXT, CSV, etc., with file icons, sizes, and instant download
- **Custom Sticker Engine**:
  - Sticker pack browser (Pre-loaded with *Cat Vibes*, *Dev Life*)
  - **Custom Sticker Pack Creator**: Upload transparent PNG/WEBP images to create custom packs for your friends

### 4. Notifications & Sounds
- In-app Notification Center for direct messages, mentions, friend requests, and group invites.
- Web Audio API synthesized notification chimes for incoming and outgoing messages (crisp, pleasant, zero external audio asset dependencies).
- Desktop browser push notifications support via standard Notification API.

### 5. Themes & Customization
- **Theme Modes**: Dark Mode, Light Mode, and System Theme with persistent preferences.
- **6 Curated Accent Colors**: Sapphire Indigo, Electric Violet, Cyber Cyan, Emerald Green, Solar Amber, Vibrant Rose.
- **Chat Preferences**: Enter to send vs. Shift+Enter for newline.
- **Storage Breakdown**: Real-time disk usage analytics categorized by media type.

---

## 🚀 Getting Started

### Access the Live Application
The app is currently running live in your environment:
- **Web App (Vite Dev Server)**: [http://localhost:3000](http://localhost:3000)
- **Full-Stack Server & Production SPA**: [http://localhost:5000](http://localhost:5000)

### Instant One-Click Demo Accounts
On the Welcome Screen, you can click any of the pre-configured demo accounts to sign in immediately:
1. **Ayan Gayen** (`@ayan_4821` / `password123`)
2. **Sarah Jenkins** (`@sarah_sky` / `password123`)
3. **Marcus Vance** (`@marcus_dev` / `password123`)
4. **Elena Rostova** (`@elena_art` / `password123`)
5. **Alex Rivera** (`@alex_gaming` / `password123`)

Or click **"Get Started"** to create a brand new account with your own unique User ID!

---

## 🛠️ Architecture & Tech Stack

```
PulseChat
├── client/                     # Vite + React 18 + Tailwind CSS
│   ├── public/manifest.webmanifest
│   ├── src/
│   │   ├── components/         # Modular layout, chat, media, stickers, profile, settings
│   │   ├── context/            # AuthContext, ChatContext, ThemeContext, ToastContext
│   │   ├── services/           # api.js, socket.js, sound.js
│   │   └── App.jsx
├── server/                     # Express + Socket.io + SQLite (sql.js)
│   ├── src/
│   │   ├── db/                 # database.js, seed.js (WAL-backed embedded SQLite)
│   │   ├── middleware/         # auth.js (JWT), upload.js (Multer)
│   │   ├── routes/             # auth, users, friends, chats, groups, messages, stickers, upload, notifications, settings
│   │   ├── socket/             # socketHandler.js (presence, rooms, typing, receipts)
│   │   └── index.js            # Express app + static hosting + API
│   ├── data/chat.db            # Persistent SQLite database
│   ├── uploads/                # Persistent media volume (images, audio, videos, docs, stickers)
│   └── test-e2e.js             # Automated end-to-end verification suite
```
