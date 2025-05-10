// src/stores/projectStore.js
import { defineStore } from 'pinia'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: []
  }),

  actions: {
    async loadProjects() {
      const res = await fetch('/api/projects')
      this.projects = await res.json()
    },

    async addProject({ name, description }) {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      const { id } = await res.json()
      this.projects.unshift({ id, name, description })
    },

    setProjects(projects) {
      this.projects = projects
    },    

    async deleteProject(id) {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      this.projects = this.projects.filter(p => p.id !== id)
    }
  }
})