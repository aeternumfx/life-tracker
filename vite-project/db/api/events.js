import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'

// Events
export function getEvents() {
    return db.prepare(`
      SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date
    `).all()
  }
  
  export function addEvent({ project_id, title, description, date, time, is_all_day, duration_minutes }) {
    const id = uuidv4()
    db.prepare(`
      INSERT INTO events (id, project_id, title, description, date, time, is_all_day, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, project_id, title, description, date, time, is_all_day ? 1 : 0, duration_minutes)
    return id
  }
  
  export function softDeleteEvent(id) {
    db.prepare(`
      UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id)
  }  