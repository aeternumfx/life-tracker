// Updated seed.js with support for list_contents linkage and project phases
import { createTables } from '../db/schema.js'
import db from '../db/db.js'
import { v4 as uuidv4 } from 'uuid'

export async function runSeed({ confirm = false } = {}) {
  if (!confirm && process.stdin.isTTY) {
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('Purge and re-seed database? This will delete everything! (y/N): ', (answer) => {
      rl.close()
      if (answer.toLowerCase() === 'y') {
        runSeed({ confirm: true })
      } else {
        console.log('❌ Cancelled.')
      }
    })
    return
  }

  try {
    db.exec(`
      DROP TABLE IF EXISTS activity_log;
      DROP TABLE IF EXISTS templates;
      DROP TABLE IF EXISTS entity_links;
      DROP TABLE IF EXISTS tag_links;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS system_tag_links;
      DROP TABLE IF EXISTS system_tags;
      DROP TABLE IF EXISTS list_contents;
      DROP TABLE IF EXISTS list_items;
      DROP TABLE IF EXISTS lists;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS events;
      DROP TABLE IF EXISTS phase_links;
      DROP TABLE IF EXISTS phases;
      DROP TABLE IF EXISTS projects;
    `)
    console.log('🧹 Old tables dropped.')
  } catch (err) {
    console.error('❌ Failed to drop old tables:', err.message)
    return
  }

  createTables()
  const now = new Date().toISOString()
  const tagMap = new Map()
  const tagLinks = []
  const listContents = []
  const phaseLinks = []

  function safeInsert(label, fn) {
    try {
      fn()
      console.log(`✅ Populated table: ${label}`)
    } catch (err) {
      console.error(`❌ Failed to populate table: ${label}`)
      console.error(err.message)
    }
  }

  function linkTag(label, entityType, entityId) {
    const tagId = tagMap.get(label)
    if (tagId) {
      tagLinks.push({ tag_id: tagId, entity_type: entityType, entity_id: entityId, created_at: now })
    }
  }

  const project1Id = uuidv4()
  const project2Id = uuidv4()
  const list1Id = uuidv4(), list2Id = uuidv4(), list3Id = uuidv4()

  safeInsert('tags', () => {
    const tags = [
      ['home', '🏠', '#a3e635'], ['work', '💼', '#60a5fa'],
      ['music', '🎸', '#f472b6'], ['dev', '💻', '#facc15'], ['urgent', '⏰', '#f87171']
    ]
    for (const [label, emoji, color] of tags) {
      const id = uuidv4()
      tagMap.set(label, id)
      db.prepare(`INSERT INTO tags (id, label, emoji_icon, color, use_theme_color, is_system, locked, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, label, emoji, color, 0, 0, 0, now)
    }
  })

  safeInsert('projects', () => {
    db.prepare(`INSERT INTO projects (id, name, description, created_at) VALUES (?, ?, ?, ?)`).run(project1Id, 'Life Tracker MVP', 'Core setup', now)
    db.prepare(`INSERT INTO projects (id, name, description, created_at) VALUES (?, ?, ?, ?)`).run(project2Id, 'Music Production', 'Finish EP', now)
    linkTag('dev', 'project', project1Id)
    linkTag('music', 'project', project2Id)
  })

  const listItemIds = []
  safeInsert('lists', () => {
    db.prepare(`INSERT INTO lists (id, name, type, created_at) VALUES (?, ?, ?, ?)`).run(list1Id, 'Studio Gear Checklist', 'dynamiclist', now)
    db.prepare(`INSERT INTO lists (id, name, type, created_at) VALUES (?, ?, ?, ?)`).run(list2Id, 'Buylist: Home Office', 'dynamiclist', now)
    db.prepare(`INSERT INTO lists (id, name, type, created_at) VALUES (?, ?, ?, ?)`).run(list3Id, 'Launch Checklist', 'task', now)
    linkTag('music', 'list', list1Id)
    linkTag('home', 'list', list2Id)
    linkTag('dev', 'list', list3Id)

    const items = [
      ['Guitar Cables', list1Id, ['music']],
      ['Monitor Arm', list2Id, ['home', 'dev']]
    ]
    for (const [text, listId, tags] of items) {
      const id = uuidv4()
      db.prepare(`INSERT INTO list_items (id, text, priority, completed, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`).run(id, text, 1, 0, 0, now)
      tags.forEach(t => linkTag(t, 'list_item', id))
      listContents.push({ id: uuidv4(), list_id: listId, item_type: 'list_item', item_id: id, sort_order: 0 })
      console.log('[DEBUG] Inserted list item', id)
      listItemIds.push(id)
    }
  })

  const taskIds = []
  safeInsert('tasks', () => {
  const tasks = [
    ['Mock up dashboard UI', 'Use Figma', project1Id, '2025-05-05', '17:00'],
    ['Practice scales', 'Alternate picking', project2Id, '2025-05-06', '09:00']
  ]
  for (const [title, desc, pid, due, time] of tasks) {
    const id = uuidv4()
    db.prepare(`INSERT INTO tasks (id, title, description, due_date, due_time, completed, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)`
).run(id, title, desc, due, time, 0, now)
    console.log('[DEBUG] Inserted task', id)
    listContents.push({ id: uuidv4(), list_id: list3Id, item_type: 'task', item_id: id, sort_order: 0 })
    taskIds.push(id)
  }
})

  // Add phases
  const phase1Id = uuidv4(), phase2Id = uuidv4(), phase3Id = uuidv4()
  const unphased1Id = uuidv4()
const unphased2Id = uuidv4()

safeInsert('phases', () => {
  db.prepare(`INSERT INTO phases (id, project_id, title, order_index, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(phase1Id, project1Id, 'Phase 1: Planning', 0, now)
  db.prepare(`INSERT INTO phases (id, project_id, title, order_index, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(phase2Id, project1Id, 'Phase 2: Development', 1, now)
  db.prepare(`INSERT INTO phases (id, project_id, title, order_index, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(phase3Id, project2Id, 'Phase 1: Recording', 0, now)

  db.prepare(`INSERT INTO phases (id, project_id, title, order_index, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(unphased1Id, project1Id, 'Unsorted', 99, now)
  db.prepare(`INSERT INTO phases (id, project_id, title, order_index, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(unphased2Id, project2Id, 'Unsorted', 99, now)
})


  // Link tasks and items to phases
  safeInsert('phase_links', () => {
  console.log('[DEBUG] Linking items to phases')

  const stmt = db.prepare(`INSERT INTO phase_links (phase_id, target_type, target_id) VALUES (?, ?, ?)`)

  // Link first task to Phase 1
  stmt.run(phase1Id, 'task', taskIds[0])

  // Link second task to Phase 3
  stmt.run(phase3Id, 'task', taskIds[1])

  // Link first list item to Phase 3 (studio gear)
  console.log('[DEBUG] Linking list item', listItemIds[0])
  stmt.run(phase3Id, 'list_item', listItemIds[0])

  // Link second list item to Phase 1 (monitor arm)
  console.log('[DEBUG] Linking list item', listItemIds[1])
  stmt.run(phase1Id, 'list_item', listItemIds[1])
})

  safeInsert('list_contents', () => {
    const stmt = db.prepare(`INSERT INTO list_contents (id, list_id, item_type, item_id, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
    for (const entry of listContents) {
      stmt.run(entry.id, entry.list_id, entry.item_type, entry.item_id, entry.sort_order, now)
    }
  })

  safeInsert('tag_links', () => {
    const stmt = db.prepare(`INSERT INTO tag_links (tag_id, entity_type, entity_id, created_at)
      VALUES (?, ?, ?, ?)`)
    for (const link of tagLinks) {
      stmt.run(link.tag_id, link.entity_type, link.entity_id, link.created_at)
    }
  })

  console.log('✅ Seed complete.')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed()
}