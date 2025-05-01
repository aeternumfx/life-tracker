import express from 'express'
import * as listApi from '../../../db/api/lists.js'
import fs from 'fs/promises'
import path from 'path'

export default function createDynamicListRouter() {
  const router = express.Router()
  const settingsPath = path.resolve('./src/modules/DynamicList/settings.json')

  // 🔄 Load settings
  router.get('/settings', async (req, res) => {
    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      res.json(JSON.parse(data))
    } catch (err) {
      res.status(500).json({ error: 'Failed to load settings' })
    }
  })

  // 💾 Save settings
  router.post('/settings', async (req, res) => {
    try {
      await fs.writeFile(settingsPath, JSON.stringify(req.body, null, 2))
      res.json({ success: true })
    } catch (err) {
      res.status(500).json({ error: 'Failed to save settings' })
    }
  })

  // Lists & items routes...
  router.get('/lists', (req, res) => {
    res.json(listApi.getLists())
  })

  router.post('/lists', (req, res) => {
    const id = listApi.addList(req.body)
    res.json({ success: true, id })
  })

  router.get('/lists/:id/items', (req, res) => {
    res.json(listApi.getListItems(req.params.id))
  })

  router.post('/lists/:id/items', (req, res) => {
    const id = listApi.addListItem({ ...req.body, list_id: req.params.id })
    res.json({ success: true, id })
  })

  router.patch('/items/:id/status', (req, res) => {
    listApi.updateItemStatus(req.params.id, req.body.completed)
    res.json({ success: true })
  })

  router.delete('/items/:id', (req, res) => {
    listApi.softDeleteItem(req.params.id)
    res.json({ success: true })
  })

  return router
}