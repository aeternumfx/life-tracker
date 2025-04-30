import { v4 as uuidv4 } from 'uuid'

// Projects
export function getProjects() {
  return db.prepare(`
    SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY created_at DESC
  `).all()
}

export function addProject({ name, description }) {
  const id = uuidv4()
  db.prepare(`
    INSERT INTO projects (id, name, description)
    VALUES (?, ?, ?)
  `).run(id, name, description)
  return id
}

export function softDeleteProject(id) {
  db.prepare(`
    UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(id)
}