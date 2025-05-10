<template>
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar: Task Filters -->
      <div class="w-[300px] shrink-0 border-r border-gray-200 bg-[--color-surface] p-4 overflow-y-auto">
        <h2 class="text-lg font-semibold mb-3 text-[--color-textPrimary]">Task Manager</h2>
  
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tasks..."
          class="mb-3 w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]"
        />
  
        <!-- Tags -->
        <div class="mb-3">
          <h3 class="text-sm font-medium mb-1">Tags:</h3>
          <div class="flex flex-wrap gap-1 mb-1">
            <button
              v-for="tag in allTags"
              :key="tag.id"
              @click="toggleTag(tag.id)"
              :class="[
                'px-2 py-1 text-sm rounded',
                selectedTags.includes(tag.id)
                  ? 'bg-[--color-primary] text-white'
                  : 'bg-[--color-surfaceAlt] text-[--color-textPrimary]'
              ]"
            >
              {{ tag.emoji_icon }} {{ tag.label }}
            </button>
          </div>
          <button v-if="selectedTags.length" @click="selectedTags = []" class="text-xs text-[--color-mutedText] hover:underline">
            Clear tags
          </button>
        </div>
  
        <!-- Project Filter (Placeholder) -->
        <div class="mb-3">
          <label class="block text-sm mb-1">Project:</label>
          <select class="w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]">
            <option value="">All Projects</option>
            <!-- TODO: Load from projectStore -->
          </select>
        </div>
  
        <!-- Status Filter -->
        <div class="mb-3">
          <h3 class="text-sm font-medium mb-1">Status:</h3>
          <div class="flex flex-col gap-1">
            <label class="text-sm">
              <input type="checkbox" v-model="filterCompleted" class="mr-1" /> Completed
            </label>
            <label class="text-sm">
              <input type="checkbox" v-model="filterIncomplete" class="mr-1" /> Incomplete
            </label>
          </div>
        </div>
  
        <button @click="showAddDialog = true" class="w-full bg-[--color-primary] text-white py-2 px-4 rounded hover:opacity-90 mt-2">
          ➕ Add Task
        </button>
      </div>
  
      <!-- Main Area -->
      <div class="flex-1 overflow-y-auto p-4 bg-[--color-surfaceAlt]">
        <!-- View Toggle -->
        <div class="flex justify-end mb-2">
          <button @click="viewMode = 'list'" :class="toggleClass(viewMode === 'list')">List</button>
          <button @click="viewMode = 'calendar'" :class="toggleClass(viewMode === 'calendar')">Calendar</button>
        </div>
  
        <!-- List View -->
        <div v-if="viewMode === 'list'">
          <div v-if="groupedTasks.length === 0" class="text-[--color-mutedText]">No tasks to show.</div>
          <div v-else>
            <div v-for="(group, label) in groupedTasks" :key="label" class="mb-6">
              <h3 class="text-sm font-semibold text-[--color-mutedText] mb-2">{{ label }}</h3>
              <ul class="space-y-2">
                <li v-for="task in group" :key="task.id" class="p-2 border rounded bg-[--color-surface] text-[--color-textPrimary]">
                  <div class="flex items-center justify-between">
                    <span>{{ task.title }}</span>
                    <input type="checkbox" v-model="task.completed" />
                  </div>
                  <div class="text-xs text-[--color-mutedText]">{{ task.due_date || 'No due date' }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
  
        <!-- Calendar View -->
<div v-else>
  <BaseCalendar v-if="calendarTasks.length" :events="calendarTasks" />
</div>


      </div>
  
      <AddTaskDialog v-if="showAddDialog" @close="showAddDialog = false" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watchEffect } from 'vue'
  import { useTaskStore } from '@/stores/taskStore'
  import { useTagStore } from '@/stores/tagStore'
  import BaseCalendar from '@/components/BaseCalendar.vue'
  import AddTaskDialog from '@/components/dialogs/AddTaskDialog.vue'
  
  const taskStore = useTaskStore()
  const tagStore = useTagStore()
  
  const searchQuery = ref('')
  const selectedTags = ref([])
  const filterCompleted = ref(true)
  const filterIncomplete = ref(true)
  const viewMode = ref('list')
  const showAddDialog = ref(false)
  
  onMounted(() => {
    taskStore.loadTasks()
    tagStore.loadTags()
  })
  
  const allTasks = computed(() => taskStore.tasks)
  const allTags = computed(() => tagStore.tags)
  
  function toggleTag(id) {
    const i = selectedTags.value.indexOf(id)
    if (i >= 0) selectedTags.value.splice(i, 1)
    else selectedTags.value.push(id)
  }
  
  function toggleClass(active) {
    return [
      'px-3 py-1 rounded-l border',
      active
        ? 'bg-[--color-primary] text-white'
        : 'bg-[--color-surface] text-[--color-textPrimary]'
    ]
  }
  
  const filteredTasks = computed(() => {
    let tasks = [...allTasks.value]
  
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      )
    }
  
    if (selectedTags.value.length > 0) {
      tasks = tasks.filter(t => t.tags?.some(tag => selectedTags.value.includes(tag)))
    }
  
    tasks = tasks.filter(t => {
      if (t.completed && !filterCompleted.value) return false
      if (!t.completed && !filterIncomplete.value) return false
      return true
    })
  
    return tasks
  })
  
  const groupedTasks = computed(() => {
    const now = new Date()
    const groups = {
      'Today': [],
      'This Week': [],
      'Later': [],
      'No Due Date': [],
      'Completed': []
    }
  
    for (const task of filteredTasks.value) {
      if (task.completed) {
        groups['Completed'].push(task)
      } else if (!task.due_date) {
        groups['No Due Date'].push(task)
      } else {
        const due = new Date(task.due_date)
        const diff = (due - now) / (1000 * 60 * 60 * 24)
        if (diff < 1) groups['Today'].push(task)
        else if (diff < 7) groups['This Week'].push(task)
        else groups['Later'].push(task)
      }
    }
  
    return groups
  })
  
  const calendarTasks = computed(() =>
    filteredTasks.value
      .filter(t => t.due_date)
      .map(t => ({
        id: t.id,
        title: t.title,
        start: t.due_date,
        allDay: true,
        type: 'task'
      }))
  )

  watchEffect(() => {
  console.log('[TaskPage] calendarTasks:', calendarTasks.value)
})
  </script>
  
  <style scoped>
  button:focus {
    outline: none;
  }
  </style>