// backend/db/api/events.js
import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'

// Utility: get tag IDs for a given entity
function getTagsForEntity(entityType, entityId) {
  return db.prepare(`
    SELECT tag_id FROM tag_links
    WHERE entity_type = ? AND entity_id = ? AND deleted_at IS NULL
  `).all(entityType, entityId).map(row => row.tag_id)
}

// 🔍 Get all events with tag info
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

// ➕ Add event with tag links
export function addEvent(event) {
  const id = event.id || uuidv4()

  db.prepare(`
    INSERT INTO events (
      id, title, description, date, time,
      duration_minutes, lead_minutes, lag_minutes,
      is_all_day, recurrence_rule, created_at, updated_at
    )
    VALUES (
      @id, @title, @description, @date, @time,
      @duration_minutes, @lead_minutes, @lag_minutes,
      @is_all_day, @recurrence_rule, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `).run({
    id,
    title: event.title,
    description: event.description || '',
    date: event.date,
    time: event.time || null,
    duration_minutes: event.duration_minutes || null,
    lead_minutes: event.lead_minutes || null,
    lag_minutes: event.lag_minutes || null,
    is_all_day: event.is_all_day ? 1 : 0,
    recurrence_rule: event.recurrence_rule || null
  })

  // Tag linking
  for (const tag of event.tags || []) {
    db.prepare(`
      INSERT INTO tag_links (tag_id, entity_type, entity_id, created_at)
      VALUES (?, 'event', ?, CURRENT_TIMESTAMP)
    `).run(tag, id)
  }

  return id
}

// 🗑 Soft delete event
export function softDeleteEvent(id) {
  db.prepare(`
    UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(id)
}

// 🔁 Update event details
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

  // Optionally: update tag links here if needed (clear and re-insert)
}