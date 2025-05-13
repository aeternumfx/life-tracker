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
    setTasks(tasks) {
      this.tasks = tasks
    },
    async addTaskFromList({ text, tags = '', list_id }) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  title: text,
  description: '',
  due_date: null,
  due_time: null,
  completed: false,
  event_id: null,
  project_id: null,
  tags,
  list_id
})
  })

  const { id } = await res.json()
  const newTask = {
    id,
    title: text,
    tags: tags.split(',').filter(Boolean),
    completed: 0,
    list_id,
    type: 'task' // make sure the UI renders this correctly
  }

  this.tasks.push(newTask)
  return id
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