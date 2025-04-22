import express from 'express'
import cors from 'cors'
import { getEvents, addEvent, getLists, addList } from '../db/api.js'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// 📆 Get all events
app.get('/events', (req, res) => {
  const events = getEvents()
  res.json(events)
})

// ➕ Add an event
app.post('/events', (req, res) => {
  const { title, date, is_all_day } = req.body
  const result = addEvent({ title, date, is_all_day })
  res.json({ success: true, id: result.lastInsertRowid })
})

// 📋 Get all lists
app.get('/lists', (req, res) => {
  const lists = getLists()
  res.json(lists)
})

// ➕ Add a list
app.post('/lists', (req, res) => {
  const { name, type } = req.body
  const result = addList({ name, type })
  res.json({ success: true, id: result.lastInsertRowid })
})

app.listen(port, () => {
  console.log(`🧠 Life Tracker backend listening at http://localhost:${port}`)
})