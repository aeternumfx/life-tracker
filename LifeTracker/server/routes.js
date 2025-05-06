// vite-project/server/routes.js
import fs from 'fs'
import path from 'path'
import express from 'express'
import * as projectApi from '../db/api/projects.js'
import * as eventApi from '../db/api/events.js'
import * as taskApi from '../db/api/tasks.js'
import * as listApi from '../db/api/lists.js'
import * as tags from '../db/api/tags.js'
import * as goals from '../db/api/goals.js'
import * as moduleSettings from '../db/api/module_settings.js'
import * as listItems from '../db/api/list_items.js'
import db from '../db/db.js'

const router = express.Router()

router.get('/projects', (req, res) => {
  try {
    // console.log('📥 /projects hit')
    const projects = projectApi.getProjects()
    res.json(projects)
  } catch (err) {
    console.error('❌ Error in /projects route:', err)
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
router.get('/events', (req, res) => {
  res.json(eventApi.getEvents())
})

router.post('/events', (req, res) => {
  const id = eventApi.addEvent(req.body)
  res.json({ success: true, id })
})

router.delete('/events/:id', (req, res) => {
  eventApi.softDeleteEvent(req.params.id)
  res.json({ success: true })
})

// Tasks
router.get('/tasks', (req, res) => {
  res.json(taskApi.getTasks())
})

router.get('/tasks/project/:projectId', (req, res) => {
  res.json(taskApi.getTasksByProject(req.params.projectId))
})

router.get('/tasks/event/:eventId', (req, res) => {
  res.json(taskApi.getTasksByEvent(req.params.eventId))
})

router.post('/tasks', (req, res) => {
  const id = taskApi.addTask(req.body)
  res.json({ success: true, id })
})

router.patch('/tasks/:id', (req, res) => {
  taskApi.updateTaskStatus(req.params.id, req.body.completed)
  res.json({ success: true })
})

router.delete('/tasks/:id', (req, res) => {
  taskApi.softDeleteTask(req.params.id)
  res.json({ success: true })
})

router.get('/lists', (req, res) => {
  try {
    res.json(listApi.getListsWithItemsAndTags())
  } catch (err) {
    console.error('❌ Error in /lists:', err)
    res.status(500).json({ error: 'Failed to load lists with items and tags' })
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

// List Items
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

router.get('/tags', (req, res) => {
  try {
    res.json(tags.getAllTags())
  } catch (err) {
    console.error('Error in /api/tags:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/tags/:label/entities', (req, res) => {
  try {
    const data = tags.getEntitiesByTag(req.params.label)
    res.json(data)
  } catch (err) {
    console.error('❌ Error in /tags/:label/entities:', err)
    res.status(500).json({ error: 'Failed to fetch tagged entities' })
  }
})

// Goals
router.get('/goals', (req, res) => {
  try {
    res.json(goals.getAllGoals())
  } catch (err) {
    console.error('❌ Error in /goals:', err)
    res.status(500).json({ error: 'Failed to load goals' })
  }
})

router.post('/goals', (req, res) => {
  try {
    const goal = goals.createGoal(req.body)
    res.json(goal)
  } catch (err) {
    console.error('❌ Error creating goal:', err)
    res.status(500).json({ error: 'Failed to create goal' })
  }
})

router.put('/goals/:id', (req, res) => {
  try {
    const goal = goals.updateGoal({ ...req.body, id: req.params.id })
    res.json(goal)
  } catch (err) {
    console.error('❌ Error updating goal:', err)
    res.status(500).json({ error: 'Failed to update goal' })
  }
})

router.delete('/goals/:id', (req, res) => {
  try {
    goals.deleteGoal(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('❌ Error deleting goal:', err)
    res.status(500).json({ error: 'Failed to delete goal' })
  }
})

// GET: Load settings
router.get('/modules/:id/settings', (req, res) => {
  const moduleId = req.params.id
  const settingsPath = path.resolve(process.cwd(), 'src', 'modules', moduleId, 'settings.json')

  if (!fs.existsSync(settingsPath)) {
    return res.status(404).send('Settings file not found')
  }

  try {
    const contents = fs.readFileSync(settingsPath, 'utf-8')
    const json = JSON.parse(contents)
    res.json(json)
  } catch (err) {
    console.error(`❌ Failed to load settings.json for module '${moduleId}':`, err)
    res.status(500).json({ error: 'Failed to parse settings file' })
  }
})

// POST: Save settings
router.post('/modules/:id/settings', (req, res) => {
  const moduleId = req.params.id
  const settingsPath = path.resolve(process.cwd(), 'src', 'modules', moduleId, 'settings.json')

  try {
    const data = JSON.stringify(req.body, null, 2)
    fs.writeFileSync(settingsPath, data, 'utf-8')
    res.json({ success: true })
  } catch (err) {
    console.error(`❌ Failed to save settings.json for module '${moduleId}':`, err)
    res.status(500).json({ error: 'Failed to save settings' })
  }
})


router.post('/import', express.json({ limit: '10mb' }), (req, res) => {
  const data = req.body
  console.log('🔁 Received import request')
  console.log('📦 Body:', JSON.stringify(req.body, null, 2))

  try {
    // You can write dedicated "replaceAll..." functions for each table if needed
    // For now, drop + recreate the db manually before using this endpoint
    fs.writeFileSync('data/layout.json', JSON.stringify(data.layout, null, 2))

    // Save module settings if available
    if (Array.isArray(data.moduleSettings)) {
      data.moduleSettings.forEach(s => moduleSettings.saveSetting(s.moduleId, s.settings))
    }

    // You'd need to import entities like projects, tasks, etc. using upsert logic

    res.json({ success: true })
  } catch (err) {
    console.error('❌ Import failed:', err)
    res.status(500).json({ error: 'Failed to import data' })
  }
})

router.post('/reset', (req, res) => {
  try {
    const tables = ['list_items', 'lists', 'tasks', 'events', 'projects', 'goals', 'tag_links', 'tags']
    for (const table of tables) {
      db.prepare(`DELETE FROM ${table}`).run()
    }
    fs.writeFileSync('data/layout.json', '{}')
    res.json({ success: true })
  } catch (err) {
    console.error('❌ Reset failed:', err)
    res.status(500).json({ error: 'Failed to reset database' })
  }
})

import { getStats } from '../db/api/stats.js'

router.get('/stats', (req, res) => {
  try {
    const stats = getStats()
    res.json(stats)
  } catch (err) {
    console.error('❌ Error in /stats:', err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

import { generateExportData } from '../db/api/export.js'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

router.get('/export', (req, res) => {
  try {
    const data = generateExportData()

    // Read and parse version from package.json manually
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'))
    const version = packageJson.version || '0.0.0'

    const today = new Date().toISOString().split('T')[0]
    const filename = `lifetrackerdata_export_${today}_v${version}.json`

    res.attachment(filename)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('❌ Failed to export data:', err)
    res.status(500).json({ error: 'Export failed' })
  }
})

import { exec } from 'child_process'

router.post('/generate-dummy', (req, res) => {
  const seedCommand = 'npm run seed'

  exec(seedCommand, { cwd: process.cwd() }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Seed script error:', err)
      return res.status(500).json({ error: stderr || 'Seed script failed' })
    }

    res.json({ success: true, output: stdout })
  })
})



// console.log('✅ routes.js loaded')


export default router