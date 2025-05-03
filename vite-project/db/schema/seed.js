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
    try {
      db.exec(`
        DROP TABLE IF EXISTS activity_log;
        DROP TABLE IF EXISTS templates;
        DROP TABLE IF EXISTS entity_links;
        DROP TABLE IF EXISTS tag_links;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS system_tag_links;
        DROP TABLE IF EXISTS system_tags;
        DROP TABLE IF EXISTS list_items;
        DROP TABLE IF EXISTS lists;
        DROP TABLE IF EXISTS tasks;
        DROP TABLE IF EXISTS events;
        DROP TABLE IF EXISTS projects;
      `)
      console.log('🧹 Old tables dropped.')
    } catch (err) {
      console.error('❌ Failed to drop old tables:', err.message)
      rl.close()
      return
    }

    createTables()
    const now = new Date().toISOString()

    const tagMap = new Map()
    const tagLinks = []

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
        tagLinks.push({
          tag_id: tagId,
          entity_type: entityType,
          entity_id: entityId,
          created_at: now
        })
      }
    }

    const project1Id = uuidv4()
    const project2Id = uuidv4()

    const listItemTagMap = new Map()

    safeInsert('tags', () => {
      const tagData = [
        { label: 'home', emoji: '🏠', color: '#a3e635' },
        { label: 'work', emoji: '💼', color: '#60a5fa' },
        { label: 'music', emoji: '🎸', color: '#f472b6' },
        { label: 'dev', emoji: '💻', color: '#facc15' },
        { label: 'urgent', emoji: '⏰', color: '#f87171' }
      ]
      for (const tag of tagData) {
        const id = uuidv4()
        tagMap.set(tag.label, id)
        db.prepare(`
          INSERT INTO tags (id, label, emoji_icon, icon_path, color, use_theme_color, description, is_system, locked, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, tag.label, tag.emoji, null, tag.color, 0, '', 0, 0, now)
      }
    })

    safeInsert('projects', () => {
      db.prepare(`INSERT INTO projects (id, name, description, created_at) VALUES (?, ?, ?, ?)`).run(project1Id, 'Life Tracker MVP', 'Core modules and system setup', now)
      linkTag('dev', 'project', project1Id)

      db.prepare(`INSERT INTO projects (id, name, description, created_at) VALUES (?, ?, ?, ?)`).run(project2Id, 'Music Production', 'Finish EP and plan releases', now)
      linkTag('music', 'project', project2Id)
    })

    safeInsert('tasks', () => {
      const makeTask = (props, tags = []) => {
        const id = uuidv4()
        db.prepare(`
          INSERT INTO tasks (id, project_id, event_id, title, description, due_date, due_time, completed, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, ...props, 0, now)
        tags.forEach(t => linkTag(t, 'task', id))
      }
      makeTask([project1Id, null, 'Mock up dashboard UI', 'Use Figma to lay out grid system', '2025-05-05', '17:00'], ['dev'])
      makeTask([project1Id, null, 'Implement theme loader', 'Support custom color JSONs', '2025-05-08', '14:00'], ['dev', 'urgent'])
      makeTask([project1Id, null, 'Refactor Container.vue', 'Modularize logic into hooks', null, null], ['dev'])
      makeTask([project2Id, null, 'Practice scales', '20 minutes alternate picking', '2025-05-06', '09:00'], ['music'])
      makeTask([project2Id, null, 'Write lyrics for "Echoes"', 'Try first verse and chorus', '2025-05-10', null], ['music'])
    })

    safeInsert('events', () => {
      const eventData = [
        ['Sprint Planning', 'Prioritize dashboard features', '2025-05-04', 90, 'dev'],
        ['System Architecture Review', 'Review database relationships and API', '2025-05-07', 90, 'dev'],
        ['Jam Session', 'Group jam on new track ideas', '2025-05-10', 2880, 'music'],
        ['Studio Recording', 'Record live guitar takes', '2025-05-18', 4320, 'music'],
        ['Module Showcase', 'Demo the app to early users', '2025-06-01', 90, 'dev']
      ]
      for (let i = 0; i < eventData.length; i++) {
        const [title, desc, date, duration, tag] = eventData[i]
        const id = uuidv4()
        db.prepare(`
          INSERT INTO events (id, project_id, title, description, date, time, is_all_day, duration_minutes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, i < 2 ? project1Id : project2Id, title, desc, date, '13:00', 0, duration, now)
        linkTag(tag, 'event', id)
      }
    })

    safeInsert('lists', () => {
      const list1Id = uuidv4()
      const list2Id = uuidv4()
      db.prepare(`INSERT INTO lists (id, name, type, created_at) VALUES (?, ?, ?, ?)`).run(list1Id, 'Studio Gear Checklist', 'dynamiclist', now)
      db.prepare(`INSERT INTO lists (id, name, type, created_at) VALUES (?, ?, ?, ?)`).run(list2Id, 'Buylist: Home Office', 'dynamiclist', now)
      linkTag('music', 'list', list1Id)
      linkTag('home', 'list', list2Id)

      const items = [
        ['Guitar Cables', list1Id, ['music']],
        ['Audio Interface', list1Id, ['music', 'dev']],
        ['Microphone Stand', list1Id, ['music']],
        ['Pop Filter', list1Id, ['music']],
        ['Tuner Pedal', list1Id, ['music']],
        ['Desk Lamp', list2Id, ['home']],
        ['Monitor Arm', list2Id, ['home', 'dev']],
        ['Chair Mat', list2Id, ['home']],
        ['Whiteboard', list2Id, ['home', 'work']],
        ['Surge Protector', list2Id, ['home']]
      ]

      for (const [text, listId, tagLabels] of items) {
        const id = uuidv4()
        db.prepare(`
          INSERT INTO list_items (id, list_id, text, priority, completed, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, listId, text, 1, 0, 0, now)        
        tagLabels.forEach(label => linkTag(label, 'list_item', id))
      }
    })

    safeInsert('tag_links', () => {
      const stmt = db.prepare(`
        INSERT INTO tag_links (tag_id, entity_type, entity_id, created_at)
        VALUES (?, ?, ?, ?)
      `)
      for (const link of tagLinks) {
        stmt.run(link.tag_id, link.entity_type, link.entity_id, link.created_at)
      }
    })

    safeInsert('system_tags', () => {
      db.prepare(`
        INSERT INTO system_tags (tag, description, applies_to, created_at)
        VALUES (?, ?, ?, ?)
      `).run('_template:habit', 'Task created from habit template', 'task', now)
    })

    safeInsert('templates', () => {
      db.prepare(`
        INSERT INTO templates (id, label, entity_type, default_fields, system_tags, icon, color, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), 'Daily Practice', 'task', JSON.stringify({ recurrence_rule: 'daily' }), JSON.stringify(['_template:habit']), '🎸', '#88cc88', 'system', now)
    })

    console.log('✅ Seed complete.')
  } else {
    console.log('❌ Cancelled.')
  }
  rl.close()
})