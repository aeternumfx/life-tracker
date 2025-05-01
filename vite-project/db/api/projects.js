import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'


// Projects
export function getProjects() {
  console.log('📦 getProjects() called')
  try {
    const rows = db.prepare(`
      SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY created_at DESC
    `).all()
    console.log('✅ Projects fetched:', rows.length)
    return rows
  } catch (err) {
    console.error('❌ DB error in getProjects:', err)
    throw err
  }
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

export async function fetchProjects() {
  const res = await fetch('/api/projects')
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}