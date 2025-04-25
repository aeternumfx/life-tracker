# 🧠 Life Tracker

**Life Tracker** is a modular, customizable dashboard app for managing tasks, events, and productivity tools — all in one place. Built with Vue 3 and Vite, it provides a drag-and-drop grid system where users can arrange and configure standalone modules like a calendar, task panel, streak tracker, and more.

## 🚀 Features

- 📅 Central calendar with event management
- ✅ Task panel with automatic filtering for upcoming tasks
- 🔥 Streak tracker with customizable emoji and counter
- ⚙️ Modular architecture: Add, remove, and configure modules independently
- 🧱 Fully draggable and resizable dashboard layout
- 💾 Layout and event data persistence via backend (Express API)
- 🔌 Supports importing/exporting user-created modules

## 🛠️ Tech Stack

- **Frontend:** Vue 3 + Vite + FullCalendar
- **Backend:** Node.js + Express
- **Layout:** vue-grid-layout
- **Build Tooling:** Vite, ESM modules
- **Styling:** Tailwind CSS

## 📦 Running Locally

```bash
# Frontend
cd vite-project
npm install
npm run dev

# Backend (in another terminal)
cd server
npm install
node index.js
