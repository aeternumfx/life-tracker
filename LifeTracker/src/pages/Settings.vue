<template>
    <ExportConfirmDialog
      :show="showExportDialog"
      :dbSize="stats.dbSize"
      @confirm="confirmExportProceed"
      @cancel="showExportDialog = false"
    />
    <ImportConfirmDialog
    :show="showImportDialog"
    @confirm="proceedWithImport"
    @cancel="showImportDialog = false"
    @request-reset="confirmReset"
    />
    <ResetConfirmDialog
      :show="showResetDialog"
      @confirm="performReset"
      @cancel="showResetDialog = false"
    />
    <GenerateDummyDataDialog
    :show="showDummyDialog"
    @confirm="generateDummyData"
    @cancel="showDummyDialog = false"
    />


    <div class="p-6 text-[--color-textPrimary] bg-[--color-surface] min-h-screen">
      <h1 class="text-2xl font-bold mb-6">⚙️ Settings</h1>
  
      <!-- Stats Section -->
      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">App Stats</h2>
        <ul class="text-sm space-y-1">
          <li><strong>Version:</strong> {{ version }}</li>
          <li><strong>Lists:</strong> {{ stats.lists }}</li>
          <li><strong>Tasks:</strong> {{ stats.tasks }}</li>
          <li><strong>Events:</strong> {{ stats.events }}</li>
          <li><strong>Projects:</strong> {{ stats.projects }}</li>
          <li><strong>Goals:</strong> {{ stats.goals }}</li>
          <li><strong>Database Size:</strong> {{ stats.dbSize }} MB</li>
        </ul>
      </section>
  
      <!-- Actions -->
      <section class="space-x-3">
        <button @click="confirmExport" class="btn">📤 Export</button>
        <button @click="showImportDialog = true" class="btn">📥 Import</button>
        <button @click="confirmReset" class="btn bg-red-600 hover:bg-red-700 text-white">🗑️ Reset</button>
        <button @click="showDummyDialog = true" class="btn bg-yellow-600 hover:bg-yellow-700 text-white">🧪 Generate Dummy Data</button>
        <input type="file" ref="importFile" @change="handleImportFile" accept=".json" class="hidden" />
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import ExportConfirmDialog from '@/components/dialogs/ExportConfirmDialog.vue'
  import ImportConfirmDialog from '@/components/dialogs/ImportConfirmDialog.vue'
  import ResetConfirmDialog from '@/components/dialogs/ResetConfirmDialog.vue'
  import GenerateDummyDataDialog from '@/components/dialogs/GenerateDummyDataDialog.vue'
  import { useImportExportStore } from '@/stores/importExportStore'

  const importExport = useImportExportStore()
  const showDummyDialog = ref(false)
  const showExportDialog = ref(false)
  const showImportDialog = ref(false)
  const showResetDialog = ref(false)
  const pendingExport = ref(false)
  
  const version = '1.0.0'
  const stats = ref({ lists: 0, tasks: 0, events: 0, projects: 0, goals: 0, dbSize: '0.00' })
  const importFile = ref(null)
  
  async function loadStats() {
    try {
      const res = await fetch('/api/stats')
      stats.value = await res.json()
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err)
    }
  }

  async function generateDummyData() {
  showDummyDialog.value = false
  try {
    await fetch('/api/generate-dummy', { method: 'POST' })
    alert('✅ Dummy data generated. Reloading...')
    location.reload()
  } catch (err) {
    console.error('❌ Failed to generate dummy data:', err)
    alert('❌ Generation failed. See console.')
  }
}
  
  function confirmExport() {
    showExportDialog.value = true
  }
  
  async function confirmExportProceed() {
    showExportDialog.value = false
    pendingExport.value = true
    await exportData()
    pendingExport.value = false
  }
  
  async function exportData() {
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('Failed to fetch export')
  
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      let filename = 'lifetracker-export.json'
      const match = disposition?.match(/filename="?(.+?)"?$/)
      if (match) filename = match[1]
  
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('❌ Export failed:', err)
      alert('❌ Export failed. See console for details.')
    }
  }
  
  async function proceedWithImport() {
  showImportDialog.value = false
  importFile.value?.click()
}
  
  function triggerImport() {
    importFile.value?.click()
  }
  
  async function handleImportFile(e) {
  const file = e.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    await importExport.importData(data)
    alert('✅ Import complete. Reloading...')
    location.reload()
  } catch (err) {
    console.error('❌ Import failed:', err)
    alert('❌ Import failed. Check console for details.')
  }
}
  
  function confirmReset() {
    showResetDialog.value = true
  }
  
  async function performReset() {
    showResetDialog.value = false
    try {
      await fetch('/api/reset', { method: 'POST' })
      alert('✅ Database reset. Reloading...')
      location.reload()
    } catch (err) {
      console.error('❌ Reset failed:', err)
      alert('❌ Reset failed.')
    }
  }
  
  onMounted(() => {
    loadStats()
  })
  </script>
  
  <style scoped>
  .btn {
    @apply px-4 py-2 rounded bg-[--color-primary] text-[--color-textPrimary] hover:opacity-80 transition;
  }
  </style>  