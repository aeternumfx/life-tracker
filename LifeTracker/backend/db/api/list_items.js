import db from '../db.js'

export function getAllListItems() {
  return db.prepare('SELECT * FROM list_items WHERE deleted_at IS NULL').all()
}