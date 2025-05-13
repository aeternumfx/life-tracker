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
    setEvents(events) {
      this.events = events
    },    
    async softDeleteEvent(id) {
  await fetch(`/api/events/${id}/soft-delete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deleted: true })
  })
  this.events = this.events.filter(e => e.id !== id)
},
    async updateEvent(event) {
      await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
      // Optional: update locally if you don’t reload everything
      const index = this.events.findIndex(e => e.id === event.id)
      if (index !== -1) this.events[index] = { ...this.events[index], ...event }
    }
    
  }
})