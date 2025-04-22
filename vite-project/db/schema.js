import db from './db.js'

export function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      is_all_day BOOLEAN DEFAULT 1,
      list_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS list_items (
      id INTEGER PRIMARY KEY,
      list_id INTEGER,
      name TEXT NOT NULL,
      notes TEXT,
      quantity INTEGER,
      target_price REAL,
      is_done BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  console.log('✅ Tables created.')
}