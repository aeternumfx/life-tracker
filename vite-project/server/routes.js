// vite-project/server/routes.js
import express from 'express'
import * as projectApi from '../db/api/projects.js'
import * as eventApi from '../db/api/events.js'
import * as taskApi from '../db/api/tasks.js'

const router = express.Router()

// Projects
router.get('/projects', (req, res) => {
  res.json(projectApi.getProjects())
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

export default router