import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const settingsPath = path.resolve(__dirname, 'settings.json')

export default function createDonationRouter() {
  const router = express.Router()

  router.get('/settings', async (req, res) => {
    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      res.json(JSON.parse(data))
    } catch (err) {
      res.status(404).json({ error: 'Settings file not found' })
    }
  })

  return router
}