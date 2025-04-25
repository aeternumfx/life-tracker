import express from 'express'
import cors from 'cors'
import { getEvents, addEvent, getLists, addList } from '../db/api.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { deleteEvent } from '../db/api.js'

const app = express()
const port = 3001

// Middleware first
app.use(cors())
app.use(express.json())

// Path setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const layoutFilePath = path.join(__dirname, '../data/layout.json')

// 📤 Load layout
app.get('/api/load-layout', async (req, res) => {
  try {
    const data = await fs.readFile(layoutFilePath, 'utf-8')
    res.json(JSON.parse(data))
  } catch {
    res.json([]) // Fallback to default layout
  }
})

// 💾 Save layout
app.post('/api/save-layout', async (req, res) => {
  try {
    const layoutFilePath = path.join(__dirname, '../data/layout.json')
    await fs.writeFile(layoutFilePath, JSON.stringify(req.body, null, 2))
    res.json({ success: true })
  } catch (err) {
    console.error('Error saving layout:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// 📆 Get all events
app.get('/api/events', (req, res) => {
  const events = getEvents()
  res.json(events)
})

// ➕ Add an event
app.post('/api/events', (req, res) => {
  const { title, date, is_all_day } = req.body
  const result = addEvent({ title, date, is_all_day })
  res.json({ success: true, id: result.lastInsertRowid })
})

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params
  try {
    const result = deleteEvent(id)
    res.json({ success: result.changes > 0 })
  } catch (err) {
    console.error('Error deleting event:', err)
    res.status(500).json({ success: false })
  }
})

const defaultLayoutPath = path.join(__dirname, '../data/defaultlayout.json')

app.get('/api/default-layout', async (req, res) => {
  try {
    const data = await fs.readFile(defaultLayoutPath, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    res.status(500).json({ error: 'Failed to load default layout' })
  }
})

// 📋 Get all lists
app.get('/api/lists', (req, res) => {
  const lists = getLists()
  res.json(lists)
})

// ➕ Add a list
app.post('/api/lists', (req, res) => {
  const { name, type } = req.body
  const result = addList({ name, type })
  res.json({ success: true, id: result.lastInsertRowid })
})

app.listen(port, () => {
  console.log(`🧠 Life Tracker backend listening at http://localhost:${port}`)
})