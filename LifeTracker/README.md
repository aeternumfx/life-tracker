# Life Tracker (Pre-release v0.1.0)

Life Tracker is a modular, customizable productivity dashboard built with **Vue 3**, **Express**, and **SQLite**. It supports task, event, and list management, all from a drag-and-drop interface.

## 🚀 Features

- ✅ Modular layout (via vue-grid-layout)
- 🗓 Unified Calendar with day/week/month views
- 📋 Dynamic Lists with tag filtering and priorities
- 💡 Project, Task, Event & Goal management
- 🎨 Theme Manager for CSS-variable-based color schemes
- 🔄 Export / Import with conflict resolution
- 🗃 Soft deletion support for all entities
- 📊 Built-in stats dashboard

## 🧩 Structure

```
bundle/
├── backend/            # Express server and SQLite DB
├── frontend/           # Vite-built frontend
├── custom/             # Editable user modules and themes
├── README.md
└── package.json
```

## ⚙️ Setup

### Option A: Run From Release ZIP
```bash
cd backend
npm install
node server.js
```
Then open the `frontend/index.html` in a browser or serve it with a static server.

### Option B: Run From Source
```bash
npm install
npm run dev
```

## 🧪 Pre-release Notes

This is an **early alpha** version. You **can**:
- Build modules and themes in `custom/`
- Export your data and re-import it
- Extend module logic with minimal wiring

But you **shouldn't yet** expect:
- Full schema migrations between versions
- Role-based permissions or accounts
- Offline-first support (planned)

## 🛠 Developer Info

Built with:
- Vue 3 + Vite
- Pinia
- TailwindCSS
- Express
- better-sqlite3

## 📄 License

MIT (TBC)

## 📣 Feedback & Contributions

Open an issue or pull request on GitHub!