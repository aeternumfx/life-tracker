import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'

// Utility: get tag IDs for a given entity
function getTagsForEntity(entityType, entityId) {
  return db.prepare(`
    SELECT tag_id FROM tag_links
    WHERE entity_type = ? AND entity_id = ? AND deleted_at IS NULL
  `).all(entityType, entityId).map(row => row.tag_id)
}

export function getEvents() {
  const events = db.prepare(`
    SELECT * FROM events WHERE deleted_at IS NULL ORDER BY date
  `).all()

  const tagStmt = db.prepare(`
    SELECT tag_id FROM tag_links
    WHERE entity_type = 'event' AND entity_id = ?
      AND deleted_at IS NULL
  `)

  for (const event of events) {
    event.tags = tagStmt.all(event.id).map(row => row.tag_id)
  }

  return events
}

  
  export function softDeleteEvent(id) {
    db.prepare(`
      UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id)
  }

  export function updateEvent(id, data) {
    db.prepare(`
      UPDATE events
      SET
        title = @title,
        description = @description,
        date = @date,
        time = @time,
        duration_minutes = @duration_minutes,
        lead_minutes = @lead_minutes,
        lag_minutes = @lag_minutes,
        is_all_day = @is_all_day,
        recurrence_rule = @recurrence_rule,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({
      id,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      duration_minutes: data.duration_minutes,
      lead_minutes: data.lead_minutes || null,
      lag_minutes: data.lag_minutes || null,
      is_all_day: data.is_all_day ? 1 : 0,
      recurrence_rule: data.recurrence_rule || null
    })
  }
  