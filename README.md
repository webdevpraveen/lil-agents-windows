<div align="center">

# 🤖🌸✨ Lil Agents Win

**Tiny AI companions that live above your Windows taskbar.**

Sunny, Anku & Somu walk around your desktop, react to your mouse,  
fight with each other, and chat with you — powered by **Groq AI (100% free).**

![Windows](https://img.shields.io/badge/Windows-10%2F11-blue?logo=windows)
![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron)
![Groq](https://img.shields.io/badge/AI-Groq%20%28Free%29-F55036)
![License](https://img.shields.io/badge/License-MIT-green)

*Inspired by [lil-agents](https://github.com/ryanstephen/lil-agents) for macOS by Ryan Stephen*

</div>

---

## 👥 Meet the Crew

| Character | Personality | Color |
|-----------|-------------|-------|
| 🤖 **Sunny** | Energetic, bold, uses *bhai/yaar*, solution-focused | Amber |
| 🌸 **Anku** | Warm, bubbly, creative, supportive, uses *na/yaar* | Rose |
| ✨ **Somu** | Calm, wise, precise, serene, ghost/spirit design | Purple |

All three **share memory** — if you tell Sunny about a project, Anku and Somu will know about it too.

---

## ✨ Features

- **3 animated pixel-art characters** walking above your Windows taskbar
- **9 unique emotions** per character — Happy 😊, Angry 😠, Sad 😢, Excited 🎉, Sleepy 😴, Love 💕, Scared 😱, Smug 😏, Confused 🤔 — each with different facial expressions, glow effects, and animations
- **Mouse reactions** — characters notice, react to, and flee from your cursor
- **Character interactions** — 4 interaction types (Fight 💥, Friendly 👋, Playful ⚡, Praveen talk 💕) between all 3 pairs
- **Particle effects** — hearts 💕, sparks ⚡, impact bursts 💥, sweat drops 💦
- **Compact mini chat** — click a character to pause them and open a small popup chat
- **Expand to full chat** — one click to open a larger resizable chat window
- **Shared memory** — all 3 companions share conversation history, so they're all aware of what you've discussed
- **Powered by Groq AI** — blazing fast, completely free (llama-3.1-8b-instant)
- **Secure** — API key stored locally in Electron's userData, never transmitted anywhere else

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** → [nodejs.org](https://nodejs.org) (download LTS)
- **Free Groq API key** → [console.groq.com/keys](https://console.groq.com/keys) (30 seconds, no credit card)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/webdevpraveen/lil-agents-win.git
cd lil-agents-win

# 2. Install dependencies (only needs to run once)
npm install

# 3. Start
npm start
```

**Windows users:** You can also just double-click `start.bat` — it handles everything automatically.

### First Run

On first launch, click any character → enter your Groq API key → start chatting!

Or: **right-click the system tray icon** → **Settings** → paste your key.

---

## 🔑 Getting a Free Groq API Key

1. Go to **[console.groq.com/keys](https://console.groq.com/keys)**
2. Sign up for free (Google/GitHub login works)
3. Click **"Create API Key"**
4. Copy the key (starts with `gsk_`)
5. Paste it in the app

That's it — no credit card, no billing, generous rate limits.

---

## 💬 How to Use

| Action | Result |
|--------|--------|
| **Click a character** | They stop walking + mini chat opens |
| **⤢ button in chat** | Expand to full resizable chat window |
| **Move mouse near them** | They react differently by personality |
| **Move mouse fast** | Everyone gets scared and runs away 😱 |
| **Poke a character** | Sunny: ⚡ excited · Anku: 💕 hearts · Somu: ✨ sparkle |
| **Wait** | They interact with each other automatically |
| **Tray icon → Settings** | Update your API key |
| **Tray icon → Quit** | Exit the app |

---

## 🏗️ Project Structure

```
lil-agents-win/
├── main.js           # Electron main process — windows, IPC, Groq API
├── overlay.html      # Transparent overlay — characters, animations, mouse reactions
├── mini-chat.html    # Compact chat popup (310×420px)
├── chat.html         # Full expanded chat window (420×620px)
├── settings.html     # API key settings window
├── preload.js        # IPC bridge for overlay window
├── preload-chat.js   # IPC bridge for chat windows
├── store.js          # Simple JSON config storage
├── package.json
├── start.bat         # Windows one-click launcher
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Tech |
|-------|------|
| Desktop shell | [Electron 28](https://electronjs.org) |
| AI | [Groq API](https://groq.com) — `llama-3.1-8b-instant` |
| Graphics | HTML5 Canvas — custom pixel art renderer |
| Storage | Local JSON via Electron `userData` |
| UI | Vanilla HTML/CSS/JS — zero frontend frameworks |

---

## 🎭 Emotion System

Each character has **9 emotions**, each with:
- Unique pixel-art facial expression
- Emotion-specific glow colour and CSS animation
- Coloured thought bubble variant
- Personality-specific dialogue pool
- Walking speed modifier

| Emotion | Glow | Speed |
|---------|------|-------|
| Happy | 🟡 Gold | 1.1× |
| Angry | 🔴 Red + shake | 1.45× |
| Sad | 🔵 Blue | 0.55× |
| Excited | 🟢 Mint + bounce | 1.85× |
| Sleepy | 🟣 Purple | 0.32× |
| Love | 🩷 Pink + pulse | 1.0× |
| Scared | 🟡 Yellow + shake | 0.4× |
| Smug | 💜 Indigo | 1.05× |
| Confused | 🟡 Warm | 0.9× |

---

## 🐛 Known Limitations

- **Windows only** (uses Windows taskbar positioning logic)
- Requires internet connection for AI chat (Groq API calls)
- No packaged `.exe` yet — runs from source via `npm start`
- Characters may briefly go behind fullscreen windows

---

## 🛣️ Roadmap / Ideas

- [ ] Packaged `.exe` installer via electron-builder
- [ ] Custom character names
- [ ] More emotions (nervous, proud, sleepy++)
- [ ] Persistent memory across app restarts
- [ ] Character sound effects
- [ ] Custom Groq model selection

---

## 🙏 Credits

- Inspired by **[lil-agents](https://github.com/ryanstephen/lil-agents)** for macOS by [Ryan Stephen](https://github.com/ryanstephen)
- AI powered by **[Groq](https://groq.com)**
- Built with **[Electron](https://electronjs.org)**

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/webdevpraveen">Praveen Singh</a>
</div>
