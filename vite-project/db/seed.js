import { createTables } from './schema.js'
import db from './db.js'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Purge and re-seed database? This will delete everything! (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    db.exec(`
      DROP TABLE IF EXISTS events;
      DROP TABLE IF EXISTS lists;
      DROP TABLE IF EXISTS list_items;
    `)

    console.log('🧹 Old tables dropped.')
    createTables()

    db.prepare(`
      INSERT INTO events (title, date, is_all_day)
      VALUES (?, ?, ?)
    `).run('Doctor Appointment', '2025-04-25', 1)

    db.prepare(`
      INSERT INTO lists (name, type)
      VALUES (?, ?)
    `).run('To Buy', 'long_term')

    db.prepare(`
      INSERT INTO list_items (list_id, name, target_price)
      VALUES (?, ?, ?)
    `).run(1, 'New Monitor', 300.00)

    console.log('✨ Sample data inserted.')
  } else {
    console.log('❌ Cancelled.')
  }

  rl.close()
})