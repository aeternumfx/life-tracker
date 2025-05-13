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

            <!-- Project Overview Header -->
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-2">Project Overview</h3>
              <p class="text-sm text-[color:var(--color-textTertiary)]">Phase-based structure</p>
            </div>

            <button
              @click="showAddPhaseDialog = true"
              class="mb-4 px-3 py-1 rounded bg-[color:var(--color-buttonBackground)] text-[color:var(--color-buttonText)] hover:opacity-90 transition"
            >
              ➕ Add Phase
            </button>

            <AddPhaseDialog
              v-if="showAddPhaseDialog"
              :project-id="selectedProjectId"
              @close="showAddPhaseDialog = false"
              @added="handleAddPhase"
            />

            <!-- Phase Sections -->
<div ref="phaseListRef">
  <template v-for="(phase, index) in orderedPhases" :key="phase.id">
      <!-- Phase Header -->
      <div
  class="phase-block mb-6 border rounded shadow-sm overflow-hidden"
  @pointerdown.prevent="startPhaseDrag(index, $event)"
>
  <!-- Phase Header -->
  <div class="phase-item flex items-center justify-between bg-[--color-surface] p-4 border-b">

        <div
          class="grab-handle select-none text-[--color-mutedText] pr-3 cursor-ns-resize"
          title="Drag to reorder"
        >
          ☰
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between px-1">
            <h4 class="text-lg font-semibold text-[color:var(--color-textPrimary)]">
              {{ phase.title || 'Untitled Phase' }}
            </h4>
            <div class="space-x-2">
              <button
                @click.stop="togglePhaseCollapse(phase.id)"
                class="text-sm text-[color:var(--color-secondary)] hover:underline"
                title="Toggle Collapse"
              >
                {{ collapsedPhases.has(phase.id) ? '▼' : '▲' }}
              </button>
              <button
                @click.stop="deletePhase(phase.id)"
                class="text-sm text-[color:var(--color-warning)] hover:underline"
                title="Delete Phase"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Collapsible Content Area -->
      <div v-if="!collapsedPhases.has(phase.id)">
        <div
          class="flex flex-wrap gap-3 bg-[color:var(--color-surfaceSecondary)] border-t border-[color:var(--color-border)] p-4"
        >
          <div
            v-for="item in getItemsForPhase(phase.id)"
            :key="item.id"
            class="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.33%-1rem)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded p-3 shadow-sm"
          >
            <div class="text-base font-medium text-[color:var(--color-textPrimary)]">
              {{ item.title || item.text }}
            </div>
            <div class="text-sm text-[color:var(--color-textSecondary)]">
              {{ itemType(item) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</div>

          </template>

          <!-- Future views -->
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
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
  import { usePhaseStore } from '@/stores/phaseStore'

  const phaseStore = usePhaseStore()

import { useTaskStore } from '@/stores/taskStore'
import { useListItemStore } from '@/stores/listItemStore'

import AddPhaseDialog from '../components/dialogs/AddPhaseDialog.vue'
const showAddPhaseDialog = ref(false)

const taskStore = useTaskStore()
const listItemStore = useListItemStore()

function shouldShowPhase(phase) {
  const title = phase?.title || ''
  const hasItems = getItemsForPhase(phase.id).length > 0
  const isUnsorted = title.toLowerCase().includes('unsorted')

  // console.log(`→ ${title} | hasItems=${hasItems} | isUnsorted=${isUnsorted}`)
  return hasItems || !isUnsorted
}

async function handleAddPhase(newPhase) {
  await phaseStore.loadPhases(selectedProjectId.value)
}

async function deletePhase(id) {
  const confirmed = confirm('Delete this phase?')
  if (!confirmed) return

  await phaseStore.deletePhase(id)
  await phaseStore.loadPhases(selectedProjectId.value)
}


  function itemType(item) {
  return item.title ? 'Task' : 'List Item'
}
  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function selectProject(id) {
    selectedProjectId.value = id
    currentView.value = 'overview'
  }

  const projectPhases = computed(() => {
  return phaseStore.phases.filter(p => p.project_id === selectedProjectId.value)
})

  function getItemsForPhase(phaseId) {
  const links = phaseStore.phaseLinks?.[phaseId] || []
  return links.map(link => {
    if (link.target_type === 'task') {
      return taskStore.tasks.find(t => t.id === link.target_id)
    } else if (link.target_type === 'list_item') {
      return listItemStore.listItems.find(i => i.id === link.target_id)
    }
    return null
  }).filter(Boolean)
}
  
async function enterProject(id) {
  selectedProjectId.value = id
  insideProject.value = true
  currentView.value = 'overview'

  await Promise.all([
    phaseStore.loadPhases(id),
    taskStore.loadTasks(),
    listItemStore.loadListItems()  // ← This was missing
  ])
}

const phaseListRef = ref(null)

const collapsedPhases = ref(new Set())

function togglePhaseCollapse(id) {
  if (collapsedPhases.value.has(id)) {
    collapsedPhases.value.delete(id)
  } else {
    collapsedPhases.value.add(id)
  }
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

function startPhaseDrag(index, event) {
  if (!event.target.classList.contains('grab-handle')) return

  const draggedEl = event.currentTarget
  const rect = draggedEl.getBoundingClientRect()
  const placeholder = draggedEl.cloneNode(true)
  placeholder.style.opacity = '0.3'
  placeholder.style.pointerEvents = 'none'
  const container = phaseListRef.value

  draggedEl.style.position = 'absolute'
  draggedEl.style.width = `${rect.width}px`
  draggedEl.style.zIndex = 1000
  draggedEl.classList.add('drag-active')

  const startY = event.clientY
  const offsetY = startY - rect.top

  document.body.appendChild(draggedEl)
  container.insertBefore(placeholder, container.children[index])

  const onMove = moveEvent => {
    const y = moveEvent.clientY - offsetY
    draggedEl.style.top = `${y}px`
    draggedEl.style.left = `${rect.left}px`

    const children = Array.from(container.children)
    const overIndex = children.findIndex(child => {
      const r = child.getBoundingClientRect()
      return moveEvent.clientY > r.top && moveEvent.clientY < r.bottom
    })

    if (overIndex !== -1 && container.children[overIndex] !== placeholder) {
      if (
  overIndex !== -1 &&
  container.contains(container.children[overIndex]) &&
  container.children[overIndex] !== placeholder
) {
  container.insertBefore(placeholder, container.children[overIndex])
}
    }
  }

  const onUp = async () => {
    const newIndex = Array.from(container.children).indexOf(placeholder)
    const reordered = [...orderedPhases.value]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)

    for (let i = 0; i < reordered.length; i++) {
      reordered[i].order_index = i
    }

    await phaseStore.reorderPhases(
      reordered.map(p => ({ id: p.id, order_index: p.order_index }))
    )
    await nextTick()
    setTimeout(async () => {
      await phaseStore.loadPhases(selectedProjectId.value)
    }, 50) // small delay to allow any in-flight state to settle

    container.insertBefore(draggedEl, placeholder)
    draggedEl.style.position = ''
    draggedEl.style.top = ''
    draggedEl.style.left = ''
    draggedEl.style.width = ''
    draggedEl.style.zIndex = ''
    draggedEl.classList.remove('drag-active')
    placeholder.remove()

    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}


const orderedPhases = computed(() => {
  return [...projectPhases.value].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
})

  
  async function refreshProjects() {
    const res = await fetch('/api/projects')
    projects.value = await res.json()
  }

      watch(projectPhases, (val) => {
  // console.log('[PHASES]', val)
})
  
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
  .grab-handle {
  cursor: ns-resize;
}
.drag-active {
  opacity: 1 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
  </style>  