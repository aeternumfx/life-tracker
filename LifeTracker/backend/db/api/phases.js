// backend/db/api/phases.js

import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'

export function createPhase(project_id, title, order_index = 0) {
  const id = uuidv4()
  db.prepare(`
    INSERT INTO phases (id, project_id, title, order_index)
    VALUES (?, ?, ?, ?)
  `).run(id, project_id, title, order_index)
  return { id, project_id, title, order_index }
}

export function getPhasesForProject(project_id) {
  return db.prepare(`
    SELECT * FROM phases
    WHERE project_id = ? AND deleted_at IS NULL
    ORDER BY order_index ASC
  `).all(project_id)
}

// Soft delete a phase
export function deletePhase(id) {
  db.prepare(`
    UPDATE phases SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(id)
}

// Reorder phases (batch update)
export function updatePhasePositions(phaseUpdates) {
  const stmt = db.prepare(`
    UPDATE phases SET order_index = ? WHERE id = ?
  `)
  const tx = db.transaction((updates) => {
    for (const { id, order_index } of updates) {
  stmt.run(order_index, id)
}
  })
  tx(phaseUpdates)
}

// Link item to a phase
export function linkItemToPhase(phase_id, target_type, target_id) {
  const stmt = db.prepare(`
    INSERT INTO phase_links (phase_id, target_type, target_id)
    VALUES (?, ?, ?)
  `)
  stmt.run(phase_id, target_type, target_id)
}

// Remove item from a phase
export function unlinkItemFromPhase(phase_id, target_type, target_id) {
  db.prepare(`
    DELETE FROM phase_links
    WHERE phase_id = ? AND target_type = ? AND target_id = ?
  `).run(phase_id, target_type, target_id)
}

// Correctly fetch all items linked to a specific phase
export function getItemsForPhase(phase_id) {
  return db.prepare(`
    SELECT * FROM phase_links
    WHERE phase_id = ?
  `).all(phase_id)
}