import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import config from './config.js'
import apiRouter from './routes/apiRouter.js'

dotenv.config()

const app = express()
const port = config.PORT

app.use(cors())
app.use(express.json())

// 📦 Mount unified API router
app.use('/api', apiRouter)
console.log('[DEBUG] ✅ API router mounted at /api')
import moduleRoutes from './routes/moduleRoutes.js'


app.use('/api/modules', moduleRoutes)

console.log('[DEBUG] CWD:', process.cwd())
console.log('[DEBUG] __filename:', import.meta.url)

// 🔧 Path setup for layout
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const layoutFilePath = path.resolve(__dirname, 'data/layout.json')
const defaultLayoutPath = path.resolve(__dirname, 'data/default-layout.json')

// 🧩 Load layout
app.get('/api/load-layout', async (req, res) => {
  try {
    const data = await fs.readFile(layoutFilePath, 'utf-8')
    res.json(JSON.parse(data))
  } catch {
    res.json([])
  }
})

// 💾 Save layout
app.post('/api/save-layout', async (req, res) => {
  try {
    await fs.writeFile(layoutFilePath, JSON.stringify(req.body, null, 2))
    res.json({ success: true })
  } catch (err) {
    console.error('Error saving layout:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// 🧱 Load default layout
app.get('/api/default-layout', async (req, res) => {
  try {
    const data = await fs.readFile(defaultLayoutPath, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    res.status(500).json({ error: 'Failed to load default layout' })
  }
})

// ✅ Start server
app.listen(port, () => {
  console.log(`🧠 Life Tracker backend listening at http://localhost:${port}`)
})
