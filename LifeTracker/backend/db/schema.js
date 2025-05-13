import db from './db.js'

export function createTables() {
  try {
    const statements = [

      // ================================
      // Table: projects
      // ================================
      `
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );`,

      // ================================
      // Table: events
      // ================================
      `
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT,
        duration_minutes INTEGER,
        lead_minutes INTEGER,
        lag_minutes INTEGER,
        is_all_day BOOLEAN DEFAULT 1,
        recurrence_rule TEXT,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );`,

      // ================================
      // Table: tasks
      // ================================
      `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        phase_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        due_time TEXT,
        completed BOOLEAN DEFAULT 0,
        recurrence_rule TEXT,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (phase_id) REFERENCES phases(id)
      );`,

      // ================================
      // Table: lists
      // ================================
      `
      CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        deleted_at TEXT
      );`,

      // ================================
      // Table: list_items
      // ================================
      `
      CREATE TABLE IF NOT EXISTS list_items (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      tags TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      deleted_at TEXT
);
`,


        // ================================
        // Table: phase_links
        // ================================

        `CREATE TABLE phase_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phase_id INTEGER NOT NULL,
        target_type TEXT NOT NULL CHECK(target_type IN ('task', 'event', 'list', 'goal', 'list_item')),
        target_id INTEGER NOT NULL,
        FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE CASCADE
      );
`,


        // ================================
        // Table: list_contents
        // ================================
`
        CREATE TABLE IF NOT EXISTS list_contents (
          id TEXT PRIMARY KEY,
          list_id TEXT NOT NULL,
          entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'item')),
          entity_id TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          deleted_at TEXT,
          FOREIGN KEY (list_id) REFERENCES lists(id)
        );
        `,

      // ================================
      // Table: system_tags
      // ================================
      `
      CREATE TABLE IF NOT EXISTS system_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT UNIQUE NOT NULL,
        description TEXT,
        applies_to TEXT DEFAULT '*',
        locked INTEGER DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,

      // ================================
      // Table: system_tag_links
      // ================================
      `
      CREATE TABLE IF NOT EXISTS system_tag_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_id INTEGER NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT,
        FOREIGN KEY (tag_id) REFERENCES system_tags(id)
      );`,

      // ================================
      // Table: tags (user-defined)
      // ================================
      `
      CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      label TEXT UNIQUE NOT NULL,      
      emoji_icon TEXT,                 
      icon_path TEXT,                  
      color TEXT,                      
      use_theme_color BOOLEAN DEFAULT 0,
      description TEXT,
      is_system INTEGER DEFAULT 0,
      locked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
      );`,

      // ================================
      // Table: tag_links
      // ================================
      `
      CREATE TABLE IF NOT EXISTS tag_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,

      // ================================
      // Table: entity_links
      // ================================
      `
      CREATE TABLE IF NOT EXISTS entity_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_type TEXT NOT NULL,
        from_id TEXT NOT NULL,
        to_type TEXT NOT NULL,
        to_id TEXT NOT NULL,
        relationship TEXT,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,

      // ================================
      // Table: templates
      // ================================
      `
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        default_fields TEXT,
        system_tags TEXT,
        icon TEXT,
        color TEXT,
        created_by TEXT,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );`,

      // ================================
      // Table: goals
      // ================================
      `
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        target_date TEXT,
        completed BOOLEAN DEFAULT 0,
        deleted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      );`,


      // ================================
      // Table: activity_log
      // ================================
      `
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        meta TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,


      // ================================
      // Table: phases
      // ================================
      `
      CREATE TABLE IF NOT EXISTS phases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  start_date TEXT,
  end_date TEXT,
  deleted_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);`

    ]

    for (const stmt of statements) {
      try {
        db.exec(stmt)
        const match = stmt.match(/TABLE IF NOT EXISTS (\w+)/)
        const tableName = match ? match[1] : 'unknown'
        console.log(`✅ Created table: ${tableName}`)
      } catch (tableErr) {
        const match = stmt.match(/TABLE IF NOT EXISTS (\w+)/)
        const tableName = match ? match[1] : 'unknown'
        console.error(`❌ Failed to create table: ${tableName}`)
        console.error(tableErr.message)
      }
    }

    console.log('🎉 All tables processed.')

  } catch (err) {
    console.error('❌ Error initializing schema setup:', err.message)
    console.error(err.stack)
  }
}