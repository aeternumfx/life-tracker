import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'life-tracker.db')
const db = new Database(dbPath)

db.pragma('foreign_keys = ON')

export default db