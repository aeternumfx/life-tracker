import { defineStore } from 'pinia'
import { useProjectStore } from './projectStore'
import { useEventStore } from './eventStore'
import { useTaskStore } from './taskStore'
import { useListStore } from './listStore'
import { useListItemStore } from './listItemStore'
import { useTagStore } from './tagStore'
import { useGoalStore } from './goalStore'
import { useModuleSettingsStore } from './moduleSettingsStore'
import { useLayoutStore } from './layoutStore'
import { useTemplateStore } from './templateStore'
import { useSystemTagStore } from './systemTagStore'

export const useImportExportStore = defineStore('importExport', () => {
  async function importData(json) {
    console.log('[IMPORT] Received JSON:', json)
    console.log('[IMPORT] DB:', json.db)
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    })

    if (!res.ok) throw new Error('Failed to import data')

    const { layout, moduleSettings, db } = json

    useProjectStore().setProjects(db.projects)
    useEventStore().setEvents(db.events)
    useTaskStore().setTasks(db.tasks)
    useListStore().setLists(db.lists)
    useListItemStore().setListItems(db.list_items)
    useTagStore().setTags(db.tags)
    useTagStore().setTagLinks(db.tag_links)
    useGoalStore().setGoals(db.goals)
    useSystemTagStore().setSystemTags(db.system_tags)
    useTemplateStore().setTemplates(db.templates)
    useModuleSettingsStore().hydrateSettings(moduleSettings)
    useLayoutStore().setLayout(layout)
  }

  return {
    importData
  }
})