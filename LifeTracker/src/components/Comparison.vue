<template>
    <div>
      <h4 class="font-bold mb-2">{{ title }}</h4>
      <div class="grid grid-cols-2 gap-4 text-xs font-mono border rounded overflow-hidden bg-[--color-background]">
        <div class="border-r p-2">
          <div class="font-bold text-[--color-accent] mb-1">Current (v{{ oldVersion }})</div>
          <pre>{{ formattedOld }}</pre>
        </div>
        <div class="p-2">
          <div class="font-bold text-[--color-accent] mb-1">Imported (v{{ newVersion }})</div>
          <pre>{{ formattedNew }}</pre>
        </div>
      </div>
      <div class="mt-2 flex gap-2">
        <button class="btn bg-red-600" @click="$emit('choose', 'old')">Use Current</button>
        <button class="btn" @click="$emit('choose', 'new')">Use Imported</button>
        <button class="btn bg-yellow-500" @click="$emit('choose', 'merge')">Merge (Old Priority)</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps([
    'title',
    'oldVersion',
    'newVersion',
    'oldContent',
    'newContent'
  ])
  
  function safeStringify(obj) {
    try {
      return JSON.stringify(JSON.parse(JSON.stringify(obj)), null, 2)
    } catch (e) {
      console.warn('🧪 Could not serialize:', obj)
      return '[Unserializable]'
    }
  }
  
  const formattedOld = computed(() => safeStringify(props.oldContent))
  const formattedNew = computed(() => safeStringify(props.newContent))
  </script>
  
  <style scoped>
  .btn {
    @apply px-3 py-2 rounded bg-[--color-primary] text-[--color-textPrimary] hover:opacity-80 transition;
  }
  pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
  </style>  