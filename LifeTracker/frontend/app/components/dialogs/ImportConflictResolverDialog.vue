<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-[--color-surface] text-[--color-textPrimary] rounded p-4 shadow-xl max-w-5xl w-full max-h-screen overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">🧩 Resolve Import Conflict</h2>

      <template v-if="currentStep">
        <div v-if="currentStep.type === 'layout'">
          <Comparison
            title="Dashboard Layout"
            oldVersion="Current"
            newVersion="Imported"
            :oldContent="current.layout"
            :newContent="imported.layout"
            @choose="handleDecision('layout', null, $event)"
          />
        </div>

        <div v-else-if="currentStep.type === 'module'">
          <Comparison
            :title="`Module: ${currentStep.id}`"
            :oldVersion="(current.moduleSettings?.[currentStep.id]?.version) || 'N/A'"
            :newVersion="(imported.moduleSettings?.[currentStep.id]?.version) || 'N/A'"
            :oldContent="current.moduleSettings?.[currentStep.id] || {}"
            :newContent="imported.moduleSettings?.[currentStep.id] || {}"
            @choose="handleDecision('module', currentStep.id, $event)"
          />
        </div>

        <div v-else-if="currentStep.type === 'done'" class="text-right mt-4">
          <button class="btn bg-green-600 text-white hover:bg-green-700" @click="finalize">
            ✅ Save and Reload
          </button>
        </div>
      </template>

      <template v-else>
        <div class="text-red-600">
          ⚠️ No step data available. Something went wrong with import structure.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import Comparison from '../common/Comparison.vue'

const { show, current, imported } = defineProps(['show', 'current', 'imported'])
const emit = defineEmits(['done'])

const layoutDecision = ref(null)
const moduleDecisions = ref({})

const steps = computed(() => {
  if (!imported || !imported.moduleSettings) return []
  const modules = Object.keys(imported.moduleSettings)
  return [
    { type: 'layout' },
    ...modules.map(id => ({ type: 'module', id })),
    { type: 'done' }
  ]
})

const currentStepIndex = ref(0)
const currentStep = computed(() => steps.value[currentStepIndex.value])

function handleDecision(type, id, choice) {
  if (type === 'layout') layoutDecision.value = choice
  if (type === 'module' && id) moduleDecisions.value[id] = choice
  currentStepIndex.value++
}

function finalize() {
  emit('done', {
    layoutDecision: layoutDecision.value,
    moduleDecisions: { ...moduleDecisions.value }
  })
}

watchEffect(() => {
  console.log('🧩 currentStep:', currentStep.value)
  console.log('📦 current:', current)
  console.log('📦 imported:', imported)
})
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded bg-[--color-primary] text-[--color-textPrimary] hover:opacity-80 transition;
}
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>