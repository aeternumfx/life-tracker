import { defineStore } from 'pinia'

export const useEventStore = defineStore('events', {
  state: () => ({
    events: []
  }),
  actions: {
    async loadEvents() {
      const res = await fetch('/api/events')
      this.events = await res.json()
    },
    async addEvent(event) {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
      const { id } = await res.json()
      this.events.push({ ...event, id })
    },
    async softDeleteEvent(id) {
      await fetch(`/api/events/${id}`, { method: 'DELETE' })
      this.events = this.events.filter(e => e.id !== id)
    }
  }
})