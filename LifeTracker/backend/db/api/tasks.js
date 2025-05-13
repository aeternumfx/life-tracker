// Tasks
import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'

export function getTasks() {
    return db.prepare(`
      SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY due_date
    `).all()
  }
  
  export function getTasksByProject(project_id) {
    return db.prepare(`
      SELECT * FROM tasks WHERE project_id = ? AND deleted_at IS NULL ORDER BY due_date
    `).all(project_id)
  }
  
  export function getTasksByEvent(event_id) {
    return db.prepare(`
      SELECT * FROM tasks WHERE event_id = ? AND deleted_at IS NULL ORDER BY due_date
    `).all(event_id)
  }
  
export function addTask({ title, description = '', due_date = null, due_time = null, completed = false, event_id = null, project_id = null, list_id = null }) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('Task must have a non-empty text/title')
  }

  const id = uuidv4()

  db.prepare(`
    INSERT INTO tasks (id, title, description, due_date, due_time, completed, event_id, project_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title.trim(), description, due_date, due_time, completed ? 1 : 0, event_id, project_id)

  if (list_id) {
    db.prepare(`
      INSERT INTO list_contents (id, list_id, entity_type, entity_id)
      VALUES (?, ?, 'task', ?)
    `).run(uuidv4(), list_id, id)
  }

  return id
}

export function getTasksByList(list_id) {
  return db.prepare(`
    SELECT t.*
    FROM list_contents lc
    JOIN tasks t ON lc.entity_id = t.id
    WHERE lc.list_id = ? AND lc.entity_type = 'task' AND t.deleted_at IS NULL
    ORDER BY lc.sort_order ASC
  `).all(list_id)
}
  
  export function updateTaskStatus(id, completed) {
    db.prepare(`
      UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(completed ? 1 : 0, id)
  }
  
  export function softDeleteTask(id) {
    db.prepare(`
      UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id)
  }  