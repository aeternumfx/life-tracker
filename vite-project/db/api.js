import db from './db.js'

export function getEvents() {
  return db.prepare('SELECT * FROM events ORDER BY date').all()
}

export function addEvent({ title, date, is_all_day }) {
  return db.prepare(`
    INSERT INTO events (title, date, is_all_day)
    VALUES (?, ?, ?)
  `).run(title, date, is_all_day ? 1 : 0)
}

export function getLists() {
  return db.prepare('SELECT * FROM lists').all()
}

export function addList({ name, type }) {
  return db.prepare('INSERT INTO lists (name, type) VALUES (?, ?)').run(name, type)
}