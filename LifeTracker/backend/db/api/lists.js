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

// LIST ITEMS
export function getListItems(list_id) {
  return db.prepare(`
    SELECT * FROM list_items
    WHERE list_id = ? AND deleted_at IS NULL
    ORDER BY sort_order ASC, created_at ASC
  `).all(list_id)
}

export function addListItem({ list_id, text, priority = 0, tags = '' }) {
  const id = uuidv4()
  db.prepare(`
    INSERT INTO list_items (id, list_id, text, priority, tags)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, list_id, text, priority, tags)
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

export function updateItemOrder(id, sort_order) {
  db.prepare(`
    UPDATE list_items SET sort_order = ? WHERE id = ?
  `).run(sort_order, id)
}

export function getListsWithItemsAndTags() {
  const lists = db.prepare(`
    SELECT * FROM lists WHERE deleted_at IS NULL ORDER BY created_at DESC
  `).all()

  const itemsStmt = db.prepare(`
    SELECT * FROM list_items WHERE list_id = ? AND deleted_at IS NULL ORDER BY sort_order ASC, created_at ASC
  `)

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
    const items = itemsStmt.all(list.id)
    for (const item of items) {
      const tagRows = itemTagLinksStmt.all(item.id)
      item.tags = tagRows.map(row => row.label)
    }

    const listTagRows = tagLinksStmt.all(list.id)
    list.tags = listTagRows.map(row => row.label)

    list.items = items
  }

  return lists
}