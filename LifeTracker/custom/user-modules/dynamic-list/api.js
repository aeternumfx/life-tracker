// src/modules/dynamic-list/api.js
import express from 'express'
import * as listApi from '../../../backend/db/api/lists.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const settingsPath = path.resolve(__dirname, 'settings.json')

export default function createDynamicListRouter() {
  const router = express.Router()

  // 🔄 Load settings
  router.get('/settings', async (req, res) => {
    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      res.json(JSON.parse(data))
    } catch (err) {
      console.error('❌ Failed to load settings:', err)
      res.status(500).json({ error: 'Failed to load settings' })
    }
  })

  // 💾 Save settings
  router.post('/settings', async (req, res) => {
    try {
      await fs.writeFile(settingsPath, JSON.stringify(req.body, null, 2))
      res.json({ success: true })
    } catch (err) {
      console.error('❌ Failed to save settings:', err)
      res.status(500).json({ error: 'Failed to save settings' })
    }
  })

  // 📋 Get all lists
  router.get('/lists', (req, res) => {
    try {
      res.json(listApi.getLists())
    } catch (err) {
      console.error('❌ Failed to get lists:', err)
      res.status(500).json({ error: 'Failed to get lists' })
    }
  })

  // ➕ Create new list
  router.post('/lists', (req, res) => {
    try {
      const id = listApi.addList(req.body)
      res.json({ success: true, id })
    } catch (err) {
      console.error('❌ Failed to add list:', err)
      res.status(500).json({ error: 'Failed to add list' })
    }
  })

  // 📦 Get items for a list
  router.get('/lists/:id/items', (req, res) => {
    try {
      res.json(listApi.getListItems(req.params.id))
    } catch (err) {
      console.error('❌ Failed to get items for list:', err)
      res.status(500).json({ error: 'Failed to get items' })
    }
  })

  // ➕ Add item to a list (core fix)
  router.post('/lists/:id/items', async (req, res) => {
    try {
      const payload = { ...req.body, list_id: req.params.id }
      console.log('📝 Adding item:', payload)

      const id = listApi.addListItem(payload)
      res.json({ success: true, id })
    } catch (err) {
      console.error('❌ Failed to add item:', err)
      res.status(500).json({ error: 'Failed to add item', detail: err.message })
    }
  })

  // ✅ Update item status
  router.patch('/items/:id/status', (req, res) => {
    try {
      listApi.updateItemStatus(req.params.id, req.body.completed)
      res.json({ success: true })
    } catch (err) {
      console.error('❌ Failed to update item status:', err)
      res.status(500).json({ error: 'Failed to update status' })
    }
  })

  // 🗑 Delete item
  router.delete('/items/:id', (req, res) => {
    try {
      listApi.softDeleteItem(req.params.id)
      res.json({ success: true })
    } catch (err) {
      console.error('❌ Failed to delete item:', err)
      res.status(500).json({ error: 'Failed to delete item' })
    }
  })

  return router
}