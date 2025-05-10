// initDb.js
import { createTables } from '../db/schema.js'
import db from '../db/db.js'

function runInit() {
  try {
    createTables()
    console.log('✅ Tables created successfully.')
  } catch (err) {
    console.error('❌ Failed to create tables:', err.message)
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  runInit()
}