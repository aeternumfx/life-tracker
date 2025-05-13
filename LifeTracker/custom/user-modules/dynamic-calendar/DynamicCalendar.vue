<template>
    <div class="w-full h-full flex flex-col p-2 gap-2"
         style="background-color: var(--color-surface); color: var(--color-textPrimary);">
  
      <!-- Toolbar -->
      <div class="flex justify-between items-center">
        <button @click="dialog?.open()"
                class="px-3 py-1 rounded"
                style="background-color: var(--color-primary); color: var(--color-textPrimary);">
          ➕ Add
        </button>
  
        <!-- View Switcher -->
        <div class="flex gap-2 items-center">
          <template v-for="(viewData, key) in availableViews" :key="key">
            <button
              v-if="viewData.visible"
              @click="currentView = key"
              :class="[
                'px-3 py-1 rounded border text-sm',
                currentView === key
                  ? 'bg-[--color-primary] text-white'
                  : 'bg-[--color-surfaceAlt] text-[--color-textPrimary]'
              ]"
            >
              {{ viewData.label }}
            </button>
          </template>
        </div>
      </div>
  
      <!-- Dynamic Calendar View -->
      <component :is="currentViewComponent" @edit="onEdit" />
  
      <!-- Dialog -->
      <CalendarAddItemDialog ref="dialog" />
      <EditEventDialog
  ref="editDialog"
  @save="updateEvent"
  @delete="deleteEvent"
  @close="editing = null"
/>
    </div>
  </template>  
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import CalendarAddItemDialog from '@/components/dialogs/CalendarAddItemDialog.vue'
  import MonthView from './MonthView.vue'
  import WeekView from './WeekView.vue'
  import DayView from './DayView.vue'
  import YearView from './YearView.vue'
  import { useModuleSettingsStore } from '@/stores/moduleSettingsStore'
  import EditEventDialog from '@/components/dialogs/EditEventDialog.vue'
  import { useEventStore } from '@/stores/eventStore'


  const eventStore = useEventStore()
  const moduleId = 'dynamic-calendar'
  const settingsStore = useModuleSettingsStore()
  const settings = settingsStore.settings[moduleId] || {}
  const editDialog = ref(null)
  const editing = ref(null)
  
  const dialog = ref(null)

  function onEdit(eventData) {
  editing.value = eventData
  editDialog.value?.open(eventData)
}
  
async function updateEvent(updated) {
  await eventStore.updateEvent(updated)
  await eventStore.loadEvents()
}

  // View logic
  const availableViews = {
    month: { label: 'Month', visible: settings.showMonthView !== false },
    week: { label: 'Week', visible: settings.showWeekView !== false },
    day: { label: 'Day', visible: settings.showDayView !== false },
    year: { label: 'Year', visible: settings.showYearView !== false }
  }
  
  const currentView = ref(settings.rememberLastView ? settingsStore.getSetting(moduleId, 'lastView') || settings.defaultViewMode || 'month' : settings.defaultViewMode || 'month')
  
  watch(currentView, newVal => {
    if (settings.rememberLastView) {
      settingsStore.setSetting(moduleId, 'lastView', newVal)
    }
  })

  async function deleteEvent(deleted) {
  if (!deleted?.id) return
  await eventStore.softDeleteEvent(deleted.id)
  await eventStore.loadEvents()
  editing.value = null
}
  
  const currentViewComponent = computed(() => {
    switch (currentView.value) {
      case 'month': return MonthView
      case 'week': return WeekView
      case 'day': return DayView
      case 'year': return YearView
      default: return MonthView
    }
  })
  </script>  