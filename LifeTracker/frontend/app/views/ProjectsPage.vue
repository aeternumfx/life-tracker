<template>
    <div class="flex h-screen overflow-hidden bg-[color:var(--color-background)] text-[color:var(--color-textPrimary)]">
      <!-- Sidebar -->
      <aside
  :class="[
    'transition-all duration-300 ease-in-out min-w-0 h-full',
    sidebarCollapsed ? 'w-0 overflow-hidden border-none' : 'w-72 border-r',
    'bg-[color:var(--color-surface)] border-[color:var(--color-border)]'
  ]"
>
  <div v-show="!sidebarCollapsed" class="p-4 transition-opacity duration-300 opacity-100">

        <!-- Top controls -->
        <div class="flex justify-between items-center mb-4" v-if="!insideProject">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects..."
            class="w-full px-2 py-1 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)] placeholder-[color:var(--color-textTertiary)]"
          />
          <button @click="toggleSidebar" class="ml-2 text-[color:var(--color-textSecondary)]">❌</button>
        </div>
  
        <div class="mb-4" v-if="!insideProject">
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
        <div class="mb-4" v-if="!insideProject">
          <button
            @click="showAddDialog = true"
            class="w-full text-center py-1 px-3 rounded bg-[color:var(--color-buttonBackground)] text-[color:var(--color-buttonText)] hover:opacity-90 transition"
          >
            + New Project
          </button>
  
          <AddProjectDialog
            v-if="showAddDialog"
            @close="showAddDialog = false"
            @refresh="refreshProjects"
          />
        </div>
  
        <!-- Inside project view -->
        <div v-if="insideProject">
          <div class="mb-2 font-semibold text-lg">{{ selectedProject?.name }}</div>
          <ul class="space-y-1">
            <li
              :class="[
                'cursor-pointer px-2 py-1 rounded transition-colors',
                currentView === 'overview'
                  ? 'bg-[color:var(--color-surfaceSecondary)]'
                  : 'hover:bg-[color:var(--color-surfaceSecondary)]'
              ]"
              @click="currentView = 'overview'"
            >
              📄 Overview
            </li>
            <!-- future project sections go here -->
          </ul>
          <button
            @click="exitProject"
            class="mt-4 w-full py-1 text-sm text-[color:var(--color-warning)] border border-[color:var(--color-warning)] rounded"
          >
            ← Exit Project
          </button>
        </div>
  
        <!-- Project list -->
        <ul v-if="!insideProject" class="space-y-1">
            <li
  v-for="project in filteredProjects"
  :key="project.id"
  class="flex justify-between items-center px-2 py-1 rounded cursor-pointer hover:bg-[color:var(--color-surfaceSecondary)]"
  @click.self="selectProject(project.id)"
>
  <div class="flex justify-between items-center w-full">
    <div @click="selectProject(project.id)" class="flex-1">
      {{ project.name }}
    </div>
    <button
      class="text-sm text-[color:var(--color-textSecondary)] hover:text-[color:var(--color-textPrimary)]"
      @click.stop="enterProject(project.id)"
    >
      ▶
    </button>
  </div>
</li>

        </ul>
        </div>
      </aside>
  
      <!-- Main view -->
      <transition name="slide-fade" mode="out-in">
        <main
          :key="insideProject ? 'focused' : 'overview'"
          class="flex-1 p-6 overflow-y-auto"
        >
          <button
            v-if="sidebarCollapsed"
            @click="toggleSidebar"
            class="mb-4 text-sm text-[color:var(--color-textSecondary)]"
          >
            Show Project List
          </button>
  
          <div v-if="selectedProject">
            <template v-if="currentView === 'overview'">
              <h2 class="text-2xl font-bold mb-2">{{ selectedProject.name }}</h2>
              <p class="text-[color:var(--color-textSecondary)] mb-4">
                {{ selectedProject.description }}
              </p>
  
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 border rounded border-[color:var(--color-border)] bg-[color:var(--color-surfaceSecondary)]">
                  <h3 class="font-semibold mb-2">Tasks</h3>
                  <ul class="list-disc list-inside">
                    <li v-for="task in selectedProject.tasks" :key="task.id">
                      {{ task.title }}
                    </li>
                  </ul>
                </div>
  
                <div class="p-4 border rounded border-[color:var(--color-border)] bg-[color:var(--color-surfaceSecondary)]">
                  <h3 class="font-semibold mb-2">Events</h3>
                  <ul class="list-disc list-inside">
                    <li v-for="event in selectedProject.events" :key="event.id">
                      {{ event.title }}
                    </li>
                  </ul>
                </div>
              </div>
            </template>
  
            <!-- more views like whiteboard, etc., can go here -->
          </div>
  
          <div v-else>
            <p class="text-[color:var(--color-textTertiary)]">
              Select a project to view its details.
            </p>
          </div>
        </main>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import AddProjectDialog from '../components/dialogs/AddProjectDialog.vue'
    import { useProjectStore } from '@/stores/projectStore'
  
  const showAddDialog = ref(false)
  const sidebarCollapsed = ref(false)
  const searchQuery = ref('')
  const selectedFilter = ref('')
  const selectedProjectId = ref(null)
  const insideProject = ref(false)
  const currentView = ref('overview')
  const projectStore = useProjectStore()

  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function selectProject(id) {
    selectedProjectId.value = id
    currentView.value = 'overview'
  }
  
  function enterProject(id) {
    selectedProjectId.value = id
    insideProject.value = true
    currentView.value = 'overview'
  }
  
  function exitProject() {
    insideProject.value = false
    selectedProjectId.value = null
    currentView.value = 'overview'
  }
  
  const filteredProjects = computed(() =>
  projectStore.projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = !selectedFilter.value || project.status === selectedFilter.value
    return matchesSearch && matchesFilter
  })
)
  
const selectedProject = computed(() =>
  projectStore.projects.find((p) => p.id === selectedProjectId.value)
)

  
  async function refreshProjects() {
    const res = await fetch('/api/projects')
    projects.value = await res.json()
  }
  
  onMounted(() => {
  projectStore.loadProjects()
})

  </script>
  
  <style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  .slide-fade-enter-from {
    transform: translateX(100%);
    opacity: 0;
  }
  .slide-fade-enter-to {
    transform: translateX(0%);
    opacity: 1;
  }
  .slide-fade-leave-from {
    transform: translateX(0%);
    opacity: 1;
  }
  .slide-fade-leave-to {
    transform: translateX(-10%);
    opacity: 0;
  }
  </style>  