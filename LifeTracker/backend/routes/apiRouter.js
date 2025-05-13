// backend/routes/apiRouter.js

import fs from 'fs'
import path from 'path'
import express from 'express'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

import * as projectApi from '../db/api/projects.js'
import * as eventApi from '../db/api/events.js'
import * as taskApi from '../db/api/tasks.js'
import * as listApi from '../db/api/lists.js'
import * as tags from '../db/api/tags.js'
import * as goals from '../db/api/goals.js'
import * as moduleSettings from '../db/api/module_settings.js'
import * as listItems from '../db/api/list_items.js'
import db from '../db/db.js'
import { getStats } from '../db/api/stats.js'
import { generateExportData } from '../db/api/export.js'
import * as phaseApi from '../db/api/phases.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.resolve(__dirname, '../../data')
const layoutPath = path.join(dataDir, 'layout.json')
const settingsPath = path.join(dataDir, 'moduleSettings.json')

const router = express.Router()

router.post('/reset', (req, res) => {
  try {
    db.exec('PRAGMA foreign_keys = OFF')

    const tables = [
      'list_contents',        // ✅ must come before lists, list_items, tasks
      'list_items',
      'tasks',
      'events',
      'phases',
      'lists',
      'projects',
      'goals',
      'tag_links',
      'tags',
      'system_tag_links',
      'system_tags',
      'entity_links',
      'activity_log'
    ]

    for (const table of tables) {
      db.prepare(`DELETE FROM ${table}`).run()
    }

    db.exec('PRAGMA foreign_keys = ON')

    // Ensure data directory exists
    fs.mkdirSync(dataDir, { recursive: true })

    // Reset files
    fs.writeFileSync(layoutPath, '[]')
    fs.writeFileSync(settingsPath, '{}')

    res.json({ success: true })
  } catch (err) {
    console.error('❌ Reset failed:', err)
    res.status(500).json({ error: 'Failed to reset database' })
  }
})


// Project routes
router.get('/projects', (req, res) => {
  try {
    res.json(projectApi.getProjects())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load projects' })
  }
})

router.post('/projects', (req, res) => {
  const id = projectApi.addProject(req.body)
  res.json({ success: true, id })
})

router.delete('/projects/:id', (req, res) => {
  projectApi.softDeleteProject(req.params.id)
  res.json({ success: true })
})

// Events
router.get('/events', (req, res) => res.json(eventApi.getEvents()))

router.post('/events', (req, res) => {
  const id = eventApi.addEvent(req.body)
  res.json({ success: true, id })
})

router.delete('/events/:id', (req, res) => {
  eventApi.softDeleteEvent(req.params.id)
  res.json({ success: true })
})

router.put('/events/:id', (req, res) => {
  try {
    eventApi.updateEvent(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Tasks
router.get('/tasks', (req, res) => res.json(taskApi.getTasks()))
router.get('/tasks/project/:projectId', (req, res) => res.json(taskApi.getTasksByProject(req.params.projectId)))
router.get('/tasks/event/:eventId', (req, res) => res.json(taskApi.getTasksByEvent(req.params.eventId)))

router.post('/tasks', (req, res) => {
  const {
    title,
    description = '',
    due_date = null,
    due_time = null,
    completed = false,
    event_id = null,
    project_id = null,
    list_id = null
  } = req.body

  if (!title || title.trim() === '') {
    console.warn('[POST /tasks] Rejected empty title')
    return res.status(400).json({ error: 'Task title is required' })
  }

  try {
    const id = taskApi.addTask({
      title: title.trim(),
      description,
      due_date,
      due_time,
      completed,
      event_id,
      project_id,
      list_id
    })
    res.json({ success: true, id })
  } catch (err) {
    console.error('[POST /tasks] Failed to add task:', err)
    res.status(500).json({ error: 'Failed to add task' })
  }
})

router.get('/list-contents/:listId', (req, res) => {
  const contents = db.prepare(`
    SELECT * FROM list_contents WHERE list_id = ?
  `).all(req.params.listId)
  res.json(contents)
})

// Standalone route for all list items (optional global view)
router.get('/list-items', (req, res) => {
  try {
    res.json(listItems.getAllListItems())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load list items' })
  }
})

router.patch('/tasks/:id', (req, res) => {
  taskApi.updateTaskStatus(req.params.id, req.body.completed)
  res.json({ success: true })
})

router.delete('/tasks/:id', (req, res) => {
  taskApi.softDeleteTask(req.params.id)
  res.json({ success: true })
})

// Phase-linked items
router.get('/phases/:id/links', (req, res) => {
  try {
    const items = phaseApi.getItemsForPhase(req.params.id)
    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load phase-linked items' })
  }
})

// Phases
router.get('/phases/:projectId', (req, res) => {
  try {
    const phases = phaseApi.getPhasesForProject(req.params.projectId)
    res.json(phases)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch phases' })
  }
})

router.post('/phases', (req, res) => {
  try {
    const { project_id, title, order_index = 0 } = req.body
    const newPhase = phaseApi.createPhase(project_id, title, order_index)
    res.json(newPhase)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create phase' })
  }
})

router.delete('/phases/:id', (req, res) => {
  try {
    phaseApi.deletePhase(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete phase' })
  }
})

router.post('/phases/reorder', (req, res) => {
  try {
    const updates = req.body.map(({ id, order_index }) => ({ id, order_index }))
    phaseApi.updatePhasePositions(updates)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to reorder phases' })
  }
})

router.post('/phase-links', (req, res) => {
  try {
    const { phase_id, target_type, target_id } = req.body
    phaseApi.linkItemToPhase(phase_id, target_type, target_id)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to link item to phase' })
  }
})

router.delete('/phase-links', (req, res) => {
  try {
    const { phase_id, target_type, target_id } = req.body
    phaseApi.unlinkItemFromPhase(phase_id, target_type, target_id)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to unlink item from phase' })
  }
})

// Lists and list items
router.get('/lists', (req, res) => {
  try {
    res.json(listApi.getListsWithItemsAndTags())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load lists' })
  }
})

router.post('/lists', (req, res) => {
  const id = listApi.addList(req.body)
  res.json({ success: true, id })
})

router.post('/lists/:id/rename', (req, res) => {
  listApi.renameList(req.params.id, req.body.name)
  res.json({ success: true })
})

router.delete('/lists/:id', (req, res) => {
  listApi.softDeleteList(req.params.id)
  res.json({ success: true })
})

router.get('/lists/:list_id/items', (req, res) => {
  res.json(listApi.getListItems(req.params.list_id))
})

router.post('/lists/:list_id/items', (req, res) => {
  const id = listApi.addListItem({ ...req.body, list_id: req.params.list_id })
  res.json({ success: true, id })
})

router.patch('/lists/items/:id/status', (req, res) => {
  listApi.updateItemStatus(req.params.id, req.body.completed)
  res.json({ success: true })
})

router.patch('/lists/items/:id/order', (req, res) => {
  listApi.updateItemOrder(req.params.id, req.body.sort_order)
  res.json({ success: true })
})

router.delete('/lists/items/:id', (req, res) => {
  listApi.softDeleteItem(req.params.id)
  res.json({ success: true })
})

// Tags
router.get('/tags', (req, res) => {
  try {
    res.json(tags.getAllTags())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load tags' })
  }
})

router.get('/tags/:label/entities', (req, res) => {
  try {
    const data = tags.getEntitiesByTag(req.params.label)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch tagged entities' })
  }
})

// Goals
router.get('/goals', (req, res) => {
  try {
    res.json(goals.getAllGoals())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load goals' })
  }
})

router.post('/goals', (req, res) => {
  try {
    const goal = goals.createGoal(req.body)
    res.json(goal)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create goal' })
  }
})

router.put('/goals/:id', (req, res) => {
  try {
    const goal = goals.updateGoal({ ...req.body, id: req.params.id })
    res.json(goal)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update goal' })
  }
})

router.delete('/goals/:id', (req, res) => {
  try {
    goals.deleteGoal(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete goal' })
  }
})

// Stats
router.get('/stats', (req, res) => {
  try {
    const stats = getStats()
    res.json(stats)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Export
router.get('/export', (req, res) => {
  try {
    const data = generateExportData()
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'))
    const version = packageJson.version || '0.0.0'
    const today = new Date().toISOString().split('T')[0]
    const filename = `lifetrackerdata_export_${today}_v${version}.json`

    res.attachment(filename)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Export failed' })
  }
})

// Generate Dummy Data
router.post('/generate-dummy', (req, res) => {
  exec('npm run seed', { cwd: process.cwd() }, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: stderr || 'Seed script failed' })
    }
    res.json({ success: true, output: stdout })
  })
})

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

try {
    const importHandler = (await import('../db/api/import.js')).default
    router.post('/import', express.json({ limit: '10mb' }), importHandler)
    console.log('✅ Import route mounted')
  } catch (err) {
    console.error('❌ Failed to load import handler:', err)
  }  

export default router