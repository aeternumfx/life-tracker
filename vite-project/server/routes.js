// vite-project/server/routes.js
import fs from 'fs'
import path from 'path'
import express from 'express'
import * as projectApi from '../db/api/projects.js'
import * as eventApi from '../db/api/events.js'
import * as taskApi from '../db/api/tasks.js'
import * as listApi from '../db/api/lists.js'

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
  res.json(listApi.getLists())
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

router.get('/modules/:id/settings', (req, res) => {
  const moduleId = req.params.id
  const settingsPath = path.resolve(`src/modules/${moduleId}/settings.json`)

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

// console.log('✅ routes.js loaded')


export default router