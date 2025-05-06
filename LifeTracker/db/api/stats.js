import fs from 'fs'
import path from 'path'
import * as listApi from './lists.js'
import * as taskApi from './tasks.js'
import * as eventApi from './events.js'
import * as projectApi from './projects.js'
import * as goals from './goals.js'

export function getStats() {
    const dbPath = path.resolve('db', 'life-tracker.db')
  
    return {
      lists: listApi.getLists().length,
      tasks: taskApi.getTasks().length,
      events: eventApi.getEvents().length,
      projects: projectApi.getProjects().length,
      goals: goals.getAllGoals().length,
      dbSize: (fs.statSync(dbPath).size / 1_000_000).toFixed(2)
    }
  }
  