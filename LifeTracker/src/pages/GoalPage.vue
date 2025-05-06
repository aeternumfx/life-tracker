<!-- src/pages/GoalsPage.vue -->
<template>
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar: Goal List -->
      <div class="w-[300px] shrink-0 border-r border-gray-200 bg-[--color-surface] p-4 overflow-y-auto">
        <h2 class="text-lg font-semibold text-[--color-textPrimary] mb-3">Goals</h2>
  
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search goals..."
          class="mb-3 w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]"
        />
  
        <!-- Goal List -->
        <div v-if="filteredGoals.length">
          <button
            v-for="goal in filteredGoals"
            :key="goal.id"
            @click="selectGoal(goal)"
            :class="[
              'w-full text-left px-3 py-2 rounded mb-1',
              selectedGoal?.id === goal.id
                ? 'bg-[--color-primary] text-white'
                : 'bg-[--color-surfaceAlt] text-[--color-textPrimary] hover:bg-[--color-surface]'
            ]"
          >
            <span class="mr-1">{{ goal.emoji || '🎯' }}</span>
            {{ goal.title }}
          </button>
        </div>
        <div v-else class="text-[--color-mutedText]">No goals found.</div>
  
        <button
          class="mt-4 w-full py-2 bg-[--color-primary] text-white rounded hover:opacity-90"
          @click="showAddDialog = true"
        >
          ➕ New Goal
        </button>
      </div>
  
      <!-- Main Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-[--color-surfaceAlt]">
        <div v-if="!selectedGoal" class="text-[--color-mutedText]">
          Select a goal from the left.
        </div>
        <div v-else>
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-2xl font-bold text-[--color-textPrimary]">
                {{ selectedGoal.emoji || '🎯' }} {{ selectedGoal.title }}
              </h2>
              <p class="text-[--color-mutedText] mt-1">{{ selectedGoal.description }}</p>
            </div>
            <button class="text-sm px-3 py-1 border rounded text-[--color-primary] hover:bg-[--color-surface]">
              Edit
            </button>
          </div>
  
          <!-- Placeholder Sections -->
          <div class="grid gap-4">
            <div class="bg-[--color-surface] border rounded p-4">
              <h3 class="font-semibold text-[--color-textPrimary] mb-2">Overview</h3>
              <p class="text-[--color-mutedText]">Progress, due date, tags, etc.</p>
            </div>
            <div class="bg-[--color-surface] border rounded p-4">
              <h3 class="font-semibold text-[--color-textPrimary] mb-2">Associated Items</h3>
              <p class="text-[--color-mutedText]">Tasks, events, and projects will appear here.</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Add Goal Dialog (TODO) -->
      <!-- <AddGoalDialog v-if="showAddDialog" @close="showAddDialog = false" /> -->
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useGoalStore } from '@/stores/goalStore'
  
  const goalStore = useGoalStore()
  const searchQuery = ref('')
  const selectedGoal = ref(null)
  const showAddDialog = ref(false)
  
  onMounted(() => {
    goalStore.loadGoals()
  })
  
  const filteredGoals = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return goalStore.goals.filter(g =>
      g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)
    )
  })
  
  function selectGoal(goal) {
    selectedGoal.value = goal
  }
  </script>
  
  <style scoped>
  button:focus {
    outline: none;
  }
  </style>  