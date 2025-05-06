import db from '../db.js'

export function getAllSystemTags() {
  return db.prepare('SELECT * FROM system_tags WHERE deleted_at IS NULL').all()
}