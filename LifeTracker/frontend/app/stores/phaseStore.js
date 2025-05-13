// src/stores/phaseStore.js

import { defineStore } from 'pinia'

import { reactive } from 'vue'

export const usePhaseStore = defineStore('phaseStore', {
  state: () => ({
    phases: [],
    phaseLinks: reactive({})
  }),

actions: {
  async loadPhases(projectId) {
    const res = await fetch(`/api/phases/${projectId}`)
    if (res.ok) {
      this.phases = await res.json()
      // Load links for each phase
      for (const phase of this.phases) {
        await this.loadPhaseLinks(phase.id)
      }
    }
  },
    async loadPhaseLinks(phaseId) {
    const res = await fetch(`/api/phases/${phaseId}/links`)
    if (res.ok) {
      this.phaseLinks[phaseId] = await res.json()
    }
  },

    async addPhase({ project_id, title, order_index = 0 }) {
  const res = await fetch('/api/phases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id, title, order_index }),
  })
  if (res.ok) {
    await this.loadPhases(project_id)
  } else {
    const err = await res.json()
    console.error('[addPhase] Failed:', err)
    throw new Error(err?.error || 'Failed to create phase')
  }
},

    async deletePhase(id) {
      const res = await fetch(`/api/phases/${id}`, { method: 'DELETE' })
      if (res.ok) {
        this.phases = this.phases.filter(p => p.id !== id)
      }
    },

async reorderPhases(phaseOrder) {
  await fetch('/api/phases/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phaseOrder),
  })
}
  }
})