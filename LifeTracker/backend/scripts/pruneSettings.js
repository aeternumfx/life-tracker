// backend/scripts/pruneSettings.js
import fs from 'fs'
import path from 'path'

const modulesDir = path.resolve('custom/user-modules')
const settingsPath = path.resolve('data/moduleSettings.json')

// 1. Read existing settings
let existing = {}
try {
  existing = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
} catch {
  console.warn('⚠️ No moduleSettings.json found or invalid')
}

// 2. Load actual module IDs from directory
const validModules = fs
  .readdirSync(modulesDir)
  .filter(f => fs.existsSync(path.join(modulesDir, f, 'index.js')))

// 3. Keep only keys that match module ID (e.g., 'task-panel')
const cleaned = {}
for (const key of Object.keys(existing)) {
  const baseId = key.split('-')[0]
  if (validModules.includes(baseId)) {
    cleaned[key] = existing[key]
  } else {
    console.warn(`🧹 Removing invalid module setting: ${key}`)
  }
}

// 4. Save cleaned file
fs.writeFileSync(settingsPath, JSON.stringify(cleaned, null, 2))
console.log('✅ Cleaned moduleSettings.json')