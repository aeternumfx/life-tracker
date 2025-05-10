import db from '../db.js'

export function getAllTemplates() {
  return db.prepare('SELECT * FROM templates WHERE deleted_at IS NULL').all()
}