// Tasks
import db from '../db.js'

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
  
  export function addTask({ title, description, due_date, due_time, completed, event_id, project_id }) {
    const id = uuidv4()
    db.prepare(`
      INSERT INTO tasks (id, title, description, due_date, due_time, completed, event_id, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description, due_date, due_time, completed ? 1 : 0, event_id, project_id)
    return id
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