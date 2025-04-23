// server/setup.js
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const dbPath = path.resolve('./server/data/lifetracker.db')

// Wipe existing DB
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('🧨 Old database deleted.')
}

// Recreate DB
const db = new Database(dbPath)
console.log('🧱 New database created.')

db.exec(`
  CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    is_all_day INTEGER DEFAULT 1
  );

  CREATE TABLE list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'longterm' or 'grocery'
    name TEXT NOT NULL,
    checked INTEGER DEFAULT 0
  );
`)

console.log('✅ Tables created.')

const insertEvent = db.prepare(`INSERT INTO events (title, date, is_all_day) VALUES (?, ?, ?)`)

insertEvent.run('Sample Meeting', '2025-04-25', 1)
insertEvent.run('Grocery Run', '2025-04-26', 1)

console.log('📅 Sample events inserted.')

const insertItem = db.prepare(`INSERT INTO list_items (type, name, checked) VALUES (?, ?, ?)`)

insertItem.run('longterm', 'New PC Components', 0)
insertItem.run('grocery', 'Milk', 0)
insertItem.run('grocery', 'Eggs', 1)

console.log('📝 Sample list items inserted.')
console.log('🚀 Setup complete.')