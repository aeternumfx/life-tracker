import db from '../db.js'

export function getAllSystemTagLinks() {
  return db.prepare('SELECT * FROM system_tag_links').all()
}