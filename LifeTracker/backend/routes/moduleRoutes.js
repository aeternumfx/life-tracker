// backend/routes/moduleRoutes.js
import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../../')
const modulesDir = path.resolve(projectRoot, 'custom/user-modules')

console.log('[DEBUG] modulesDir:', modulesDir)

if (!fs.existsSync(modulesDir)) {
  console.warn(`⚠️ modulesDir not found: ${modulesDir}`)
} else {
  for (const folder of fs.readdirSync(modulesDir)) {
    // Skip non-directory entries or files like .DS_Store
    const fullPath = path.join(modulesDir, folder)
    if (!fs.statSync(fullPath).isDirectory()) {
      console.warn(`⛔ Skipping non-directory: "${folder}"`)
      continue
    }

    // Skip folders with invalid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(folder)) {
      console.warn(`⛔ Skipping invalid folder name: "${folder}"`)
      continue
    }

    const apiPath = path.join(fullPath, 'api.js')

    if (fs.existsSync(apiPath)) {
      try {
        const mod = await import(apiPath)
        console.log(`📦 Attempting to load module: ${folder}`)

        if (mod?.default && typeof mod.default === 'function') {
          router.use(`/${folder}`, mod.default())
          console.log(`✅ Mounted module route: /api/modules/${folder}`)
        } else {
          console.warn(`⚠️ No valid export for module: "${folder}"`)
        }
      } catch (err) {
        console.error(`❌ Failed to load module "${folder}":`, err)
      }
    } else {
      console.warn(`⚠️ No api.js found in: "${folder}"`)
    }
  }
}

export default router