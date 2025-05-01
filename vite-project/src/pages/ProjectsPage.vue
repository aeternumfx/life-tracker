<template>
    <div class="flex h-screen overflow-hidden bg-[color:var(--color-background)] text-[color:var(--color-textPrimary)]">
      <!-- Sidebar -->
      <aside
        :class="[
          'w-72 border-r p-4 transition-all duration-300',
          sidebarCollapsed ? 'hidden' : '',
          'bg-[color:var(--color-surface)] border-[color:var(--color-border)]'
        ]"
      >
        <div class="flex justify-between items-center mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects..."
            class="w-full px-2 py-1 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)] placeholder-[color:var(--color-textTertiary)]"
          />
          <button @click="toggleSidebar" class="ml-2 text-[color:var(--color-textSecondary)]">❌</button>
        </div>
        
  
        <div class="mb-4">
          <select
            v-model="selectedFilter"
            class="w-full border px-2 py-1 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border-[color:var(--color-inputBorder)]"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
  
        <!-- Add Project Button -->
<div class="mb-4">
    <button
  @click="showAddDialog = true"
  class="mb-4 w-full text-center py-1 px-3 rounded bg-[color:var(--color-buttonBackground)] text-[color:var(--color-buttonText)] hover:opacity-90 transition"
>
  + New Project
</button>

<AddProjectDialog
  v-if="showAddDialog"
  @close="showAddDialog = false"
  @refresh="refreshProjects"
/>


  <div v-if="showAddForm" class="mt-3 space-y-2">
    <input
      v-model="newProject.name"
      type="text"
      placeholder="Project name"
      class="w-full px-2 py-1 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)] placeholder-[color:var(--color-textTertiary)]"
    />
    <textarea
      v-model="newProject.description"
      placeholder="Description"
      class="w-full px-2 py-1 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)] placeholder-[color:var(--color-textTertiary)]"
    ></textarea>
    <button
      @click="addProject"
      class="w-full py-1 px-2 rounded bg-[color:var(--color-positive)] text-white hover:opacity-90"
    >
      Save Project
    </button>
  </div>
</div>

<ul class="space-y-1">
  <li
    v-for="project in filteredProjects"
    :key="project.id"
    :class="[
      'cursor-pointer px-2 py-1 rounded transition-colors',
      project.id === selectedProjectId
        ? 'bg-[color:var(--color-surfaceSecondary)]'
        : 'hover:bg-[color:var(--color-surfaceSecondary)]'
    ]"
    @click="selectProject(project.id)"
  >
    {{ project.name }}
  </li>
</ul>

      </aside>
  
      <!-- Main project view -->
      <main class="flex-1 p-6 overflow-y-auto">
        <button
          v-if="sidebarCollapsed"
          @click="toggleSidebar"
          class="mb-4 text-sm text-[color:var(--color-textSecondary)]"
        >
          Show Project List
        </button>
  
        <div v-if="selectedProject">
          <h2 class="text-2xl font-bold mb-2">{{ selectedProject.name }}</h2>
          <p class="text-[color:var(--color-textSecondary)] mb-4">{{ selectedProject.description }}</p>
  
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border rounded border-[color:var(--color-border)] bg-[color:var(--color-surfaceSecondary)]">
              <h3 class="font-semibold mb-2">Tasks</h3>
              <ul class="list-disc list-inside">
                <li v-for="task in selectedProject.tasks" :key="task.id">{{ task.title }}</li>
              </ul>
            </div>
  
            <div class="p-4 border rounded border-[color:var(--color-border)] bg-[color:var(--color-surfaceSecondary)]">
              <h3 class="font-semibold mb-2">Events</h3>
              <ul class="list-disc list-inside">
                <li v-for="event in selectedProject.events" :key="event.id">{{ event.title }}</li>
              </ul>
            </div>
          </div>
        </div>
  
        <div v-else>
          <p class="text-[color:var(--color-textTertiary)]">Select a project to view its details.</p>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import AddProjectDialog from '../components/AddProjectDialog.vue'

  const showAddDialog = ref(false)

  
  const sidebarCollapsed = ref(false)
  const searchQuery = ref('')
  const selectedFilter = ref('')
  const selectedProjectId = ref(null)
  const projects = ref([])
  
  const showAddForm = ref(false)
const newProject = ref({ name: '', description: '' })

async function refreshProjects() {
  const res = await fetch('/api/projects')
  projects.value = await res.json()
}

async function addProject() {
  const payload = {
    name: newProject.value.name.trim(),
    description: newProject.value.description.trim()
  }

  if (!payload.name) return alert('Project name is required')

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const result = await res.json()
    if (!result.success) throw new Error('Add failed')

    // Refresh project list
    const refreshed = await fetch('/api/projects')
    projects.value = await refreshed.json()
    showAddForm.value = false
    newProject.value = { name: '', description: '' }

    // Select new project
    const newProjectEntry = projects.value.find(p => p.id === result.id)
    if (newProjectEntry) {
      selectedProjectId.value = newProjectEntry.id
    }

  } catch (err) {
    console.error('Error adding project:', err)
    alert('Failed to add project')
  }
}

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  const selectProject = (id) => {
    selectedProjectId.value = id
  }
  
  const filteredProjects = computed(() => {
    return projects.value.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesFilter = !selectedFilter.value || project.status === selectedFilter.value
      return matchesSearch && matchesFilter
    })
  })
  
  const selectedProject = computed(() =>
    projects.value.find((p) => p.id === selectedProjectId.value)
  )
  
  onMounted(async () => {
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to load projects')
      projects.value = await res.json()
  
      // optional: auto-select first
      if (projects.value.length > 0) {
        selectedProjectId.value = projects.value[0].id
      }
    } catch (err) {
      console.error('Project fetch error:', err)
    }
  })
  </script>
  