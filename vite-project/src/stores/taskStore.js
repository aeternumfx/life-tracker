import { defineStore } from 'pinia'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: []
  }),
  actions: {
    async loadTasks() {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      this.tasks = data
    },
    async addTask(task) {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
      const { id } = await res.json()
      this.tasks.push({ ...task, id })
    },
    async updateTaskStatus(id, completed) {
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
          })          
      const t = this.tasks.find(t => t.id === id)
      if (t) t.completed = completed
    },
    async softDeleteTask(id) {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' }) // Optional, if you add this route
      this.tasks = this.tasks.filter(t => t.id !== id)
    }
  }
})