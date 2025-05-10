// db/api/tag_links.js
import db from '../db.js'

export function getTagsForEntity(type, id) {
  return db.prepare('SELECT tag_id FROM tag_links WHERE entity_type = ? AND entity_id = ?')
    .all(type, id)
    .map(row => row.tag_id)
}
