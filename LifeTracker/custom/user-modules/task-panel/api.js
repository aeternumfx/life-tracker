// src/modules/TaskPanel/api.js
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const settingsPath = path.resolve(__dirname, 'settings.json')

export default function createTaskPanelRouter() {
  const router = express.Router()

  router.get('/settings', async (req, res) => {
    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      res.json(JSON.parse(data))
    } catch (err) {
      console.error('[task-panel] Failed to load settings:', err)
      res.status(500).json({ error: 'Failed to load settings' })
    }
  })

  router.post('/settings', async (req, res) => {
    try {
      await fs.writeFile(settingsPath, JSON.stringify(req.body, null, 2))
      res.json({ success: true })
    } catch (err) {
      console.error('❌ Failed to save settings:', err)
      res.status(500).json({ error: 'Failed to save settings' })
    }
  })

  return router
}