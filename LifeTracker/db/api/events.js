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