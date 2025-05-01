// server/moduleRoutes.js
import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const modulesDir = path.join(__dirname, '../src/modules')

// Dynamically mount each module's api.js (if present)
for (const folder of fs.readdirSync(modulesDir)) {
  const apiPath = path.join(modulesDir, folder, 'api.js')
  if (fs.existsSync(apiPath)) {
    try {
      const mod = await import(apiPath)
      console.log(`📦 Attempting to load module: ${folder}`) // ✅ Add this

      if (mod?.default && typeof mod.default === 'function') {
        router.use(`/${folder}`, mod.default())
        console.log(`✅ Mounted module route: /api/modules/${folder}`)
      } else {
        console.warn(`⚠️ No valid export for /${folder}`)
      }
    } catch (err) {
      console.error(`❌ Failed to load /${folder}:`, err)
    }
  } else {
    console.warn(`⚠️ No api.js found for /${folder}`)
  }
}

export default router