// db/api/import.js
import db from '../db.js'
import fs from 'fs'
import path from 'path'

const layoutPath = path.resolve('data/layout.json')

export default async function importHandler(req, res) {
  try {
    const { db: data, layout, moduleSettings } = req.body
    if (!data) {
      return res.status(400).json({ error: 'No database data provided' })
    }

    db.pragma('foreign_keys = ON')

    const insert = (table, row) => {
      const keys = Object.keys(row)
      const values = keys.map(k => row[k])
      const placeholders = keys.map(() => '?').join(', ')
      const sql = `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
      const stmt = db.prepare(sql)
      stmt.run(...values)
    }

    const tables = [
      'tags', 'projects', 'tasks', 'events', 'lists', 'list_items', 'goals',
      'templates', 'tag_links', 'system_tags', 'system_tag_links',
      'entity_links', 'activity_log'
    ]

    const importData = db.transaction(() => {
      for (const table of tables) {
        if (!data[table]) continue
        for (const row of data[table]) {
          try {
            insert(table, row)
          } catch {
            // Ignore insert errors silently
          }
        }
      }
    })

    importData()

    // Save layout
    if (layout) {
      fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), 'utf-8')
    }

    // Save module settings
    if (moduleSettings && typeof moduleSettings === 'object') {
      const moduleBasePath = path.resolve('src/modules')
      for (const [modId, settings] of Object.entries(moduleSettings)) {
        const moduleSettingsPath = path.join(moduleBasePath, modId, 'settings.json')
        try {
          fs.writeFileSync(moduleSettingsPath, JSON.stringify(settings, null, 2), 'utf-8')
        } catch {
          // Silently skip if module directory or file path fails
        }
      }
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}