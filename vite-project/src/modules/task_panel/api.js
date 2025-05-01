// src/modules/TaskPanel/api.js
import express from 'express'
import fs from 'fs/promises'
import path from 'path'

const router = express.Router()
const settingsPath = path.resolve('./src/modules/TaskPanel/settings.json')

export default function createTaskPanelRouter() {
    const router = express.Router()
    const settingsPath = path.resolve('./src/modules/TaskPanel/settings.json')
  
    router.get('/settings', async (req, res) => {
      try {
        const data = await fs.readFile(settingsPath, 'utf-8')
        res.json(JSON.parse(data))
      } catch {
        res.status(500).json({ error: 'Failed to load settings' })
      }
    })
  
    router.post('/settings', async (req, res) => {
        try {
          //console.log('🔧 Received settings update:', req.body)  // ✅ Add this line
          await fs.writeFile(settingsPath, JSON.stringify(req.body, null, 2))
          res.json({ success: true })
        } catch (err) {
          console.error('❌ Failed to save settings:', err)
          res.status(500).json({ error: 'Failed to save settings' })
        }
      })
  
    return router
  }