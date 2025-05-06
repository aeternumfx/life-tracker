// File: vite-project/db/api/goals.js
import db from '../db.js'

export function getAllGoals() {
  return db.prepare(`
    SELECT * FROM goals
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `).all()
}

export function createGoal(goal) {
  const stmt = db.prepare(`
    INSERT INTO goals (title, description, status, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `)
  const info = stmt.run(goal.title, goal.description || '', goal.status || 'active')
  return getGoalById(info.lastInsertRowid)
}

export function getGoalById(id) {
    return db.prepare(`
      SELECT * FROM goals
      WHERE id = ? AND deleted_at IS NULL
    `).get(id)
  }

export function updateGoal(goal) {
  db.prepare(`
    UPDATE goals
    SET title = ?, description = ?, status = ?, updated_at = datetime('now')
    WHERE id = ? AND deleted = 0
  `).run(goal.title, goal.description || '', goal.status || 'active', goal.id)
  return getGoalById(goal.id)
}

export function deleteGoal(id) {
  db.prepare(`UPDATE goals SET deleted = 1, updated_at = datetime('now') WHERE id = ?`).run(id)
}