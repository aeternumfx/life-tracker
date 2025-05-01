import { createTables } from './schema.js'
import db from '../db.js'
import readline from 'readline'
import { v4 as uuidv4 } from 'uuid'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Purge and re-seed database? This will delete everything! (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    db.exec(`
      DROP TABLE IF EXISTS list_items;
      DROP TABLE IF EXISTS lists;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS events;
      DROP TABLE IF EXISTS projects;
    `)    

    console.log('🧹 Old tables dropped.')
    createTables()

    // Sample Project
    const projectId = uuidv4()
    db.prepare(`
      INSERT INTO projects (id, name, description)
      VALUES (?, ?, ?)
    `).run(projectId, 'Life Tracker MVP', 'Core modules and system setup')

    // Sample Event
    const eventId = uuidv4()
    db.prepare(`
      INSERT INTO events (id, project_id, title, description, date, time, is_all_day, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, projectId, 'Design Meeting', 'Planning the dashboard modules', '2025-05-01', '10:00', 0, 60)

    // Sample Tasks
    const task1Id = uuidv4()
    const task2Id = uuidv4()

    db.prepare(`
      INSERT INTO tasks (id, project_id, event_id, title, description, due_date, due_time, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(task1Id, projectId, eventId, 'Mock up calendar UI', 'Use Figma or Whimsical', '2025-04-30', '17:00', 0)

    db.prepare(`
      INSERT INTO tasks (id, project_id, title, description, due_date, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(task2Id, projectId, 'Finish layout system', 'Finalize grid snapping and save logic', '2025-04-28', 1)

    // Sample List
    const listId = uuidv4()
    db.prepare(`
      INSERT INTO lists (id, name, type)
      VALUES (?, ?, ?)
    `).run(listId, 'Buylist: Tech', 'dynamiclist')

    const listlessId = uuidv4()
db.prepare(`
  INSERT INTO lists (id, name, type)
  VALUES (?, ?, ?)
`).run(listlessId, 'Listless', 'dynamiclist')


    // Sample List Items
    const item1Id = uuidv4()
    const item2Id = uuidv4()

    db.prepare(`
      INSERT INTO list_items (id, list_id, text, priority, tags, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(item1Id, listId, 'New Monitor', 2, 'work,home', 0)

    db.prepare(`
      INSERT INTO list_items (id, list_id, text, priority, tags, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(item2Id, listId, 'HDMI Switch', 1, 'home', 1)

    console.log('✨ Sample data inserted.')
  } else {
    console.log('❌ Cancelled.')
  }

  rl.close()
})