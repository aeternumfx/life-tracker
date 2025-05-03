// File: src/stores/goalStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGoalStore = defineStore('goalStore', () => {
  const goals = ref([])

  async function loadGoals() {
    const res = await fetch('/api/goals')
    goals.value = await res.json()
  }

  return { goals, loadGoals }
})