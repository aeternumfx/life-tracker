// File: src/stores/goalStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGoalStore = defineStore('goalStore', () => {
  const goals = ref([])

  async function loadGoals() {
    const res = await fetch('/api/goals')
    goals.value = await res.json()
  }

  async function addGoal(goal) {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    })
    const newGoal = await res.json()
    goals.value.push(newGoal)
    return newGoal
  }

  async function updateGoal(goal) {
    await fetch(`/api/goals/${goal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    })
    const index = goals.value.findIndex(g => g.id === goal.id)
    if (index !== -1) goals.value[index] = { ...goals.value[index], ...goal }
  }

  async function deleteGoal(id) {
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    goals.value = goals.value.filter(g => g.id !== id)
  }

  function setGoals(newGoals) {
    goals.value = newGoals
  }  

  return {
    goals,
    loadGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    setGoals
  }  
})