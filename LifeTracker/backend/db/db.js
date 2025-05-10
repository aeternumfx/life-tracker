// server/db.js
import Database from 'better-sqlite3'
import config from '../config.js'
import path from 'path'

console.log('[DB] Using database at:', config.DB_PATH)
console.log('[DEBUG] Resolved DB path:', path.resolve(config.DB_PATH))

const db = new Database(config.DB_PATH)
db.pragma('foreign_keys = ON')

export default db