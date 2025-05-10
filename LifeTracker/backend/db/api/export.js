import fs from 'fs'
import path from 'path'
import db from '../db.js'

export function generateExportData() {
  const tables = [
    'projects', 'events', 'tasks', 'lists', 'list_items',
    'tags', 'tag_links', 'templates', 'goals', 'entity_links',
    'system_tags', 'system_tag_links', 'activity_log'
  ]

  const dump = {}
  for (const table of tables) {
    dump[table] = db.prepare(`SELECT * FROM ${table}`).all()
  }

  // Load layout
  let layout = []
  try {
    const layoutPath = path.resolve('data/layout.json')
    layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'))
  } catch (err) {
    console.warn('⚠️ Could not load layout.json:', err.message)
  }

  // Load installed modules
  const modulesPath = path.resolve('custom/user-modules')
  const installedModules = fs.readdirSync(modulesPath).filter(name => {
    const entry = path.join(modulesPath, name, 'index.js')
    return fs.existsSync(entry)
  })

  const moduleSettings = {}
  for (const name of installedModules) {
    const settingsPath = path.resolve(`custom/user-modules/${name}/settings.json`)
    if (fs.existsSync(settingsPath)) {
      try {
        moduleSettings[name] = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
      } catch (err) {
        console.warn(`⚠️ Failed to parse settings for ${name}:`, err.message)
      }
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    version: '0.1.0', // ideally read from package.json
    layout,
    installedModules,
    moduleSettings,
    db: dump
  }
}