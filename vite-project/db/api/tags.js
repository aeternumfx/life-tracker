import db from '../db.js'

export function getAllTags() {
  return db.prepare('SELECT * FROM tags WHERE deleted_at IS NULL').all()
}

/**
 * Get all tags linked to a specific entity
 * @param {string} entityType - e.g. 'task', 'event', 'list_item'
 * @param {string} entityId
 * @returns {Array} tag rows
 */
export function getTagsForEntity(entityType, entityId) {
  const stmt = db.prepare(`
    SELECT t.*
    FROM tag_links tl
    JOIN tags t ON t.id = tl.tag_id
    WHERE tl.entity_type = ? AND tl.entity_id = ? AND t.deleted_at IS NULL
  `)
  return stmt.all(entityType, entityId)
}

/**
 * Get all entity IDs (and their types) associated with a given tag label
 * @param {string} tagLabel
 * @returns {Array} [{ entity_type, entity_id }]
 */
export function getEntitiesByTag(label) {
    const tag = db.prepare(`SELECT id FROM tags WHERE label = ? AND deleted_at IS NULL`).get(label)
    if (!tag) return {}
  
    const links = db.prepare(`
      SELECT entity_type, entity_id FROM tag_links
      WHERE tag_id = ? AND deleted_at IS NULL
    `).all(tag.id)
  
    // Group entity_ids by type
    const grouped = {}
    for (const { entity_type, entity_id } of links) {
      if (!grouped[entity_type]) grouped[entity_type] = []
      grouped[entity_type].push(entity_id)
    }
  
    // Fetch full data for each type
    const results = {}
  
    if (grouped.task?.length) {
      results.tasks = db.prepare(`
        SELECT * FROM tasks
        WHERE id IN (${grouped.task.map(() => '?').join(',')})
          AND deleted_at IS NULL
      `).all(...grouped.task)
    }
  
    if (grouped.event?.length) {
      results.events = db.prepare(`
        SELECT * FROM events
        WHERE id IN (${grouped.event.map(() => '?').join(',')})
          AND deleted_at IS NULL
      `).all(...grouped.event)
    }
  
    if (grouped.project?.length) {
      results.projects = db.prepare(`
        SELECT * FROM projects
        WHERE id IN (${grouped.project.map(() => '?').join(',')})
          AND deleted_at IS NULL
      `).all(...grouped.project)
    }
  
    if (grouped.list?.length) {
      results.lists = db.prepare(`
        SELECT * FROM lists
        WHERE id IN (${grouped.list.map(() => '?').join(',')})
          AND deleted_at IS NULL
      `).all(...grouped.list)
    }
  
    if (grouped.list_item?.length) {
      results.list_items = db.prepare(`
        SELECT * FROM list_items
        WHERE id IN (${grouped.list_item.map(() => '?').join(',')})
          AND deleted_at IS NULL
      `).all(...grouped.list_item)
    }
  
    return results
  }
  