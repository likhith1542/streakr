# 🔥 Streakr — Habit Streak Tracker

A beautiful, local-first habit tracker built with Tauri + React. No login. No cloud. All your data stays on your device.

---

## Features

- ✅ **Today's dashboard** — check off habits, see progress ring
- 🔥 **Streak tracking** — current streak, longest streak, at-risk warnings
- 📅 **History view** — GitHub-style heatmap + monthly calendar per habit
- 📊 **Stats view** — charts, completion rate, leaderboard
- ⚙️ **Settings** — light/dark/system theme, export/import JSON backup
- 💾 **Local storage** — data saved to your AppData folder, no account needed

---

## Prerequisites

Install these before starting:

### 1. Node.js (v18+)
Download from https://nodejs.org

### 2. Rust
```bash
# macOS / Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows: download rustup-init.exe from https://rustup.rs
```

After install, restart your terminal and verify:
```bash
rustc --version
cargo --version
```

### 3. System dependencies

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- WebView2 is pre-installed on Windows 10/11
- If missing: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

---

## Setup & Run

```bash
# 1. Clone / open the project folder
cd habit-tracker

# 2. Install JS dependencies
npm install

# 3. Run in development mode
npm run tauri dev
```

The app will open as a native window. Hot-reload is enabled.

---

## Build for Production

```bash
# Build native app (creates .exe on Windows, .app on Mac)
npm run tauri build
```

Output is in `src-tauri/target/release/bundle/`

---

## Project Structure

```
habit-tracker/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.tsx
│   │   ├── HabitCard.tsx
│   │   ├── AddHabitModal.tsx
│   │   ├── Heatmap.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── views/              # Page-level views
│   │   ├── Dashboard.tsx
│   │   ├── History.tsx
│   │   ├── Stats.tsx
│   │   └── Settings.tsx
│   ├── store/              # Zustand state + storage
│   │   ├── index.ts
│   │   └── storage.ts
│   ├── hooks/
│   │   └── useStreak.ts    # Streak calculation logic
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/              # Tauri/Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── capabilities/
│   │   └── default.json
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── index.html
```

---

## Data Storage

Data is stored at:
- **macOS:** `~/Library/Application Support/com.streakr.app/streakr_data.json`
- **Windows:** `C:\Users\<you>\AppData\Roaming\com.streakr.app\streakr_data.json`

You can export/import this via Settings → Data Management.

---

## Keyboard Shortcuts (planned for v1.1)

| Key | Action |
|-----|--------|
| `N` | New habit |
| `1–4` | Switch views |
| `Esc` | Close modal |
