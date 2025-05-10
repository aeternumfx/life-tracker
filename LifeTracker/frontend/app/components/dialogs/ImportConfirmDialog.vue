<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
    <ImportConflictResolverDialog
      v-if="importedJson"
      :show="show"
      :current="currentData"
      :imported="importedJson"
      @done="finalizeImport"
    />
  </div>
</template>

<script setup>
import { ref, toRaw, computed} from 'vue'
import { useLayoutStore } from '@/stores/layoutStore'
import { useModuleSettingsStore } from '@/stores/moduleSettingsStore'
import { useImportExportStore } from '@/stores/importExportStore'
import ImportConflictResolverDialog from './ImportConflictResolverDialog.vue'

defineProps({ show: Boolean })
defineEmits(['cancel'])

const importExport = useImportExportStore()
const layoutStore = useLayoutStore()
const settingsStore = useModuleSettingsStore()

const importedJson = ref(null)
const currentLayout = ref([])
const currentSettings = ref({})

function setJson(json) {
  importedJson.value = JSON.parse(JSON.stringify(json))

  const rawLayout = layoutStore.layout?.value ?? layoutStore.layout
  const rawSettings = settingsStore.settings?.value ?? settingsStore.settings

  currentLayout.value = JSON.parse(JSON.stringify(toRaw(rawLayout)))
  currentSettings.value = JSON.parse(JSON.stringify(toRaw(rawSettings)))

  console.log('✅ currentLayout.value:', currentLayout.value)
  console.log('✅ currentSettings.value:', currentSettings.value)
}

async function finalizeImport({ layoutDecision, moduleDecisions }) {
  try {
    const data = JSON.parse(JSON.stringify(importedJson.value))

    if (layoutDecision === 'old') {
      data.layout = currentLayout.value
    } else if (layoutDecision === 'merge') {
      data.layout = currentLayout.value.length ? currentLayout.value : data.layout
    }

    for (const [moduleId, decision] of Object.entries(moduleDecisions)) {
      const oldSettings = currentSettings.value[moduleId] || {}
      const newSettings = data.moduleSettings[moduleId] || {}

      if (decision === 'old') {
        data.moduleSettings[moduleId] = oldSettings
      } else if (decision === 'merge') {
        data.moduleSettings[moduleId] = { ...newSettings, ...oldSettings }
      }
    }

    await importExport.importData(data)
    alert('✅ Import complete. Reloading...')
    location.reload()
  } catch (err) {
    console.error('❌ Import failed:', err)
    alert('❌ Import failed.')
  }
}

const currentData = computed(() => ({
  layout: currentLayout.value,
  moduleSettings: currentSettings.value
}))


defineExpose({ setJson })
</script>