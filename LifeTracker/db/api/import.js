import db from '../db.js'

router.post('/api/import', async (req, res) => {
    try {
      const data = req.body.db
      if (!data) return res.status(400).json({ error: 'No database data provided' })
  
      const insert = (table, row) => {
        const keys = Object.keys(row)
        const values = keys.map(k => row[k])
        const placeholders = keys.map(() => '?').join(', ')
        const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`)
        stmt.run(...values)
      }
  
      const tables = [
        'tags',
        'projects',
        'tasks',
        'events',
        'lists',
        'list_items',
        'goals',
        'templates',
        'tag_links'
      ]
  
      db.transaction(() => {
        for (const table of tables) {
          if (data[table]) {
            for (const row of data[table]) {
              insert(table, row)
            }
          }
        }
      })()
  
      res.json({ success: true })
    } catch (err) {
      console.error('❌ Import failed:', err)
      res.status(500).json({ error: err.message })
    }
  })  