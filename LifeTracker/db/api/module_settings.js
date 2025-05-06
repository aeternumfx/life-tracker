// File: db/api/moduleSettings.js
import fs from 'fs'
import path from 'path'

export function getAllModuleSettings() {
  const settingsDir = path.resolve('src/modules')
  const modules = fs.readdirSync(settingsDir).filter(f => fs.existsSync(path.join(settingsDir, f, 'settings.json')))

  const result = {}

  for (const mod of modules) {
    const filePath = path.join(settingsDir, mod, 'settings.json')
    try {
      const contents = fs.readFileSync(filePath, 'utf-8')
      result[mod] = JSON.parse(contents)
    } catch (err) {
      console.error(`❌ Failed to read settings for ${mod}:`, err.message)
    }
  }

  return result
}