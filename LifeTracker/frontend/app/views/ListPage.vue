<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <div class="w-[300px] shrink-0 border-r border-gray-200 bg-[--color-surface] p-4 overflow-y-auto">
      <h2 class="text-lg font-semibold mb-3 text-[--color-textPrimary]">Your Lists</h2>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search lists..."
        class="mb-3 w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]"
      />

      <div class="mb-3">
        <h3 class="text-sm font-medium mb-1">Filter by Tags</h3>
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
        <button
          v-if="selectedTags.length"
          @click="selectedTags = []"
          class="text-xs text-[--color-mutedText] hover:underline"
        >
          Clear tags
        </button>
      </div>

      <button
        @click="addListDialogRef?.open()"
        class="w-full bg-[--color-primary] text-white py-2 px-4 rounded hover:opacity-90 mb-3"
      >
        ➕ Add List
      </button>

      <div class="space-y-1">
        <button
          v-for="list in filteredLists"
          :key="list.id"
          @click="selectList(list.id)"
          :class="[
            'w-full text-left px-3 py-2 rounded text-sm font-medium',
            list.id === selectedListId
              ? 'bg-[--color-primary] text-white'
              : 'bg-[--color-surfaceAlt] text-[--color-textPrimary]'
          ]"
        >
          {{ list.name }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6 bg-[--color-surfaceAlt]">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-xl font-bold text-[--color-textPrimary]">
          {{ currentList?.name || 'Select a list' }}
        </h1>
        <button
          @click="openAddItemDialog"
          class="bg-[--color-primary] text-white px-4 py-2 rounded"
        >
          ➕ Add Item
        </button>
      </div>

      <div v-if="currentListItems.length === 0" class="text-[--color-mutedText]">No items found.</div>

      <div class="flex flex-col gap-2">
        <!-- Active Items -->
        <div
          v-for="(item, index) in currentListItems"
          :key="item.id"
          class="flex items-center p-3 border rounded bg-[--color-surface] text-[--color-textPrimary] justify-between"
          @pointerdown.prevent="startPreciseDrag(index, $event)"
        >
          <div
            class="grab-handle select-none text-[--color-mutedText] pr-3 cursor-ns-resize"
            title="Drag to reorder"
          >
            ☰
          </div>
          <div class="flex-1">
            <div class="flex items-start gap-3 font-medium">
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-full text-xl font-bold shrink-0 mt-1"
                :class="item.type === 'task'
                  ? 'bg-[--color-accent] text-[--color-onAccent]'
                  : 'bg-[--color-muted] text-[--color-textPrimary]'"
              >
                {{ item.type === 'task' ? '🗒️' : '✅' }}
              </span>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span>{{ item.text }}</span>
                  <span
                    class="px-2 py-0.5 rounded text-xs font-semibold border"
                    :class="item.type === 'task'
                      ? 'bg-[--color-accent] text-[--color-onAccent] border-[--color-accent]'
                      : 'bg-[--color-muted] text-[--color-textPrimary] border-[--color-border]'"
                  >
                    {{ item.type === 'task' ? 'Task' : 'Item' }}
                  </span>
                </div>
                <div class="text-xs text-[--color-mutedText] flex gap-2 mt-1">
                  <span v-if="item.priority">Priority: {{ item.priority }}</span>
                  <span
                    v-for="tag in getTagObjects(item.tags || [])"
                    :key="tag.id"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm bg-[--color-surfaceAlt] text-[--color-textPrimary] border border-[--color-border]"
                  >
                    <span>{{ tag.emoji_icon }}</span>
                    <span>{{ tag.label }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            v-model="item.completed"
            @change="toggleItemStatus(item.id, item.completed)"
          />
        </div>

        <!-- Completed Section -->
        <div v-if="completedItems.length" class="mt-6 border-t pt-4">
          <h2 class="text-sm font-semibold text-[--color-mutedText] mb-2">✅ Completed</h2>
          <div class="flex flex-col gap-2">
            <div
              v-for="item in completedItems"
              :key="item.id"
              class="flex items-center p-3 border rounded bg-[--color-surface] text-[--color-mutedText] justify-between opacity-60"
            >
              <div class="flex-1">
                <div class="flex items-start gap-3">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-xl font-bold shrink-0 mt-1"
                    :class="item.type === 'task'
                      ? 'bg-[--color-accent] text-[--color-onAccent]'
                      : 'bg-[--color-muted] text-[--color-textPrimary]'"
                  >
                    {{ item.type === 'task' ? '🗒️' : '✅' }}
                  </span>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span>{{ item.text }}</span>
                      <span
                        class="px-2 py-0.5 rounded text-xs font-semibold border border-[--color-border]"
                      >
                        {{ item.type === 'task' ? 'Task' : 'Item' }}
                      </span>
                    </div>
                    <div class="text-xs flex gap-2 mt-1">
                      <span v-if="item.priority">Priority: {{ item.priority }}</span>
                      <span
                        v-for="tag in getTagObjects(item.tags || [])"
                        :key="tag.id"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm bg-[--color-surfaceAlt] text-[--color-textPrimary] border border-[--color-border]"
                      >
                        <span>{{ tag.emoji_icon }}</span>
                        <span>{{ tag.label }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                v-model="item.completed"
                @change="toggleItemStatus(item.id, item.completed)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <AddListDialog ref="addListDialogRef" @list-added="onListAdded" />
    <AddListItemDialog
      ref="addItemDialogRef"
      v-if="showAddItemDialog"
      :list-id="selectedListId"
      @close="showAddItemDialog = false"
      @item-added="onItemAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, watchEffect } from 'vue'
import { useListStore } from '@/stores/listStore'
import { useTagStore } from '@/stores/tagStore'
import AddListDialog from '@/components/dialogs/AddListDialog.vue'
import AddListItemDialog from '@/components/dialogs/AddListItemDialog.vue'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const listStore = useListStore()
const tagStore = useTagStore()

const addItemDialogRef = ref(null)
const searchQuery = ref('')
const selectedTags = ref([])
const selectedListId = ref(null)
const showAddItemDialog = ref(false)

onMounted(async () => {
  await Promise.all([tagStore.loadTags(), listStore.loadLists()])
  if (selectedListId.value) await listStore.loadItems(selectedListId.value)
})

const allTags = computed(() => tagStore.tags)
const allLists = computed(() => listStore.lists)

const filteredLists = computed(() => {
  let lists = allLists.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    lists = lists.filter(l => l.name.toLowerCase().includes(q))
  }
  if (selectedTags.value.length > 0) {
    lists = lists.filter(l => l.tags?.some(tag => selectedTags.value.includes(tag)))
  }
  return lists
})

function openAddItemDialog() {
  showAddItemDialog.value = true
  // Wait a tick for the dialog to exist before calling open()
  nextTick(() => {
    addItemDialogRef.value?.open()
  })
}

async function onItemAdded(payload) {
  console.log('[onItemAdded] Received:', payload)

  const listId = payload.list_id || payload.listId

  if (payload.type === 'task') {
  await taskStore.addTaskFromList({
    text: payload.text ?? '', // fallback just in case
    tags: payload.tags ?? '',
    list_id: listId
  })
}
 else {
    await listStore.addItem(payload)
  }
  await listStore.loadItems(listId)
}


const currentList = computed(() =>
  filteredLists.value.find(l => l.id === selectedListId.value)
)

function toggleTag(id) {
  const i = selectedTags.value.indexOf(id)
  i >= 0 ? selectedTags.value.splice(i, 1) : selectedTags.value.push(id)
}

async function selectList(id) {
  selectedListId.value = id
  await listStore.loadItems(id)
}

function toggleItemStatus(id, completed) {
  listStore.updateItemStatus(id, completed)
}

function getTagObjects(tagIds) {
  return allTags.value.filter(tag => tagIds.includes(tag.id) || tagIds.includes(tag.label))
}

function onListAdded(newList) {
  listStore.loadLists()
  selectedListId.value = newList.id
}

function startPreciseDrag(index, event) {
  if (!event.target.classList.contains('grab-handle')) return

  const draggedEl = event.currentTarget
  const rect = draggedEl.getBoundingClientRect()
  const placeholder = draggedEl.cloneNode(true)
  placeholder.style.opacity = '0.3'
  placeholder.style.pointerEvents = 'none'

  draggedEl.style.position = 'absolute'
  draggedEl.style.width = `${rect.width}px`
  draggedEl.style.zIndex = 1000
  draggedEl.classList.add('drag-active')

  const container = draggedEl.parentElement
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
      container.insertBefore(placeholder, container.children[overIndex])
    }
  }

  const onUp = () => {
    const newIndex = Array.from(container.children).indexOf(placeholder)
    const reordered = [...currentListItems.value]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)

    updateSortOrders(reordered)

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

async function updateSortOrders(reorderedItems) {
  for (let i = 0; i < reorderedItems.length; i++) {
    const item = reorderedItems[i]
    item.sort_order = i
    await listStore.updateItemOrder(item.id, i)
  }

  listStore.itemsByListId[selectedListId.value] = [
    ...reorderedItems,
    ...completedItems.value
  ]
}

const currentListItems = computed(() => {
  const raw = listStore.itemsByListId[selectedListId.value] || []
  return raw
    .map(i => ({
      ...i,
      text: i.text ?? i.title ?? '', // normalize .text
    }))
    .filter(i => !i.completed && !i.deleted_at)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
})

const completedItems = computed(() => {
  const raw = listStore.itemsByListId[selectedListId.value] || []
  return raw
    .map(i => ({
      ...i,
      text: i.text ?? i.title ?? '',
    }))
    .filter(i => i.completed && !i.deleted_at)
})

</script>

<style scoped>
.reorder-move {
  transition: transform 0.2s ease;
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