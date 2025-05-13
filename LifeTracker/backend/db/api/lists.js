import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'

// LISTS
export function getLists() {
  return db.prepare(`
    SELECT * FROM lists WHERE deleted_at IS NULL ORDER BY created_at DESC
  `).all()
}

export function getList(id) {
  return db.prepare(`
    SELECT * FROM lists WHERE id = ? AND deleted_at IS NULL
  `).get(id)
}

export function addList({ name, project_id = null, type = 'general' }) {
  const id = uuidv4()
  db.prepare(`
    INSERT INTO lists (id, name, project_id, type)
    VALUES (?, ?, ?, ?)
  `).run(id, name, project_id, type)
  return id
}

export function renameList(id, name) {
  db.prepare(`
    UPDATE lists SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(name, id)
}

export function softDeleteList(id) {
  db.prepare(`
    UPDATE lists SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(id)
}

export function getListItems(list_id) {
  const contentLinks = db.prepare(`
    SELECT * FROM list_contents
    WHERE list_id = ? AND deleted_at IS NULL
    ORDER BY sort_order ASC, created_at ASC
  `).all(list_id)

  const items = []

  const itemStmt = db.prepare(`SELECT * FROM list_items WHERE id = ? AND deleted_at IS NULL`)
  const taskStmt = db.prepare(`SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL`)

  for (const link of contentLinks) {
    if (link.entity_type === 'item') {
      const item = itemStmt.get(link.entity_id)
      if (item) {
        item.type = 'item'
        item.sort_order = link.sort_order
        items.push(item)
      }
    } else if (link.entity_type === 'task') {
      const task = taskStmt.get(link.entity_id)
      if (task) {
        task.type = 'task'
        task.sort_order = link.sort_order
        items.push(task)
      }
    }
  }

  return items
}


export function addListItem({ list_id, text, priority = 0, tags = '' }) {
  const id = uuidv4()

  db.prepare(`
    INSERT INTO list_items (id, text, priority, tags)
    VALUES (?, ?, ?, ?)
  `).run(id, text, priority, tags)

  db.prepare(`
    INSERT INTO list_contents (id, list_id, entity_type, entity_id, sort_order)
    VALUES (?, ?, 'item', ?, ?)
  `).run(uuidv4(), list_id, id, 9999) // default sort order to bottom

  return id
}

export function updateItemStatus(id, completed) {
  db.prepare(`
    UPDATE list_items SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(completed ? 1 : 0, id)
}

export function softDeleteItem(id) {
  db.prepare(`
    UPDATE list_items SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(id)
}

export function updateItemOrder(entity_id, sort_order) {
  db.prepare(`
    UPDATE list_contents
    SET sort_order = ?
    WHERE entity_id = ? AND deleted_at IS NULL
  `).run(sort_order, entity_id)
}

export function linkTaskToList({ list_id, task_id, sort_order = 9999 }) {
  db.prepare(`
    INSERT INTO list_contents (id, list_id, entity_type, entity_id, sort_order)
    VALUES (?, ?, 'task', ?, ?)
  `).run(uuidv4(), list_id, task_id, sort_order)
}

export function getListsWithItemsAndTags() {
  const lists = db.prepare(`
    SELECT * FROM lists WHERE deleted_at IS NULL ORDER BY created_at DESC
  `).all()

  const contentsStmt = db.prepare(`
    SELECT * FROM list_contents
    WHERE list_id = ? AND deleted_at IS NULL
    ORDER BY sort_order ASC, created_at ASC
  `)

  const itemStmt = db.prepare(`SELECT * FROM list_items WHERE id = ? AND deleted_at IS NULL`)
  const taskStmt = db.prepare(`SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL`)

  const tagLinksStmt = db.prepare(`
    SELECT tag_links.entity_id, tags.label
    FROM tag_links
    JOIN tags ON tag_links.tag_id = tags.id
    WHERE tag_links.entity_type = 'list' AND tag_links.entity_id = ?
  `)

  const itemTagLinksStmt = db.prepare(`
    SELECT tag_links.entity_id, tags.label
    FROM tag_links
    JOIN tags ON tag_links.tag_id = tags.id
    WHERE tag_links.entity_type = 'list_item' AND tag_links.entity_id = ?
  `)

  for (const list of lists) {
    const contents = contentsStmt.all(list.id)
    const combinedItems = []

    for (const link of contents) {
      if (link.entity_type === 'item') {
        const item = itemStmt.get(link.entity_id)
        if (item) {
          const tagRows = itemTagLinksStmt.all(item.id)
          item.tags = tagRows.map(row => row.label)
          item.type = 'item'
          item.sort_order = link.sort_order
          combinedItems.push(item)
        }
      } else if (link.entity_type === 'task') {
        const task = taskStmt.get(link.entity_id)
        if (task) {
          task.tags = [] // Optionally fetch tag links if needed
          task.type = 'task'
          task.sort_order = link.sort_order
          combinedItems.push(task)
        }
      }
    }

    const listTagRows = tagLinksStmt.all(list.id)
    list.tags = listTagRows.map(row => row.label)

    list.items = combinedItems
  }

  return lists
}