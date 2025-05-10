import fs from 'fs'
import path from 'path'
import * as listApi from './lists.js'
import * as taskApi from './tasks.js'
import * as eventApi from './events.js'
import * as projectApi from './projects.js'
import * as goals from './goals.js'
import config from '../../config.js' // ✅ adjust based on file location

export function getStats() {
  let dbSize = '0.00'
  try {
    dbSize = (fs.statSync(config.DB_PATH).size / 1_000_000).toFixed(2)
  } catch (err) {
    console.warn('⚠️ Could not get DB size:', err.message)
  }

  return {
    lists: listApi.getLists().length,
    tasks: taskApi.getTasks().length,
    events: eventApi.getEvents().length,
    projects: projectApi.getProjects().length,
    goals: goals.getAllGoals().length,
    dbSize
  }
}