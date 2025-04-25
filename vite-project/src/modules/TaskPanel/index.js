// modules/TaskPanel/index.js
import { markRaw } from 'vue'
import TaskPanel from './TaskPanel.vue'

export default {
  id: 'tasks',
  component: markRaw(TaskPanel),
  defaultLayout: {
    i: 'tasks',
    x: 9,
    y: 0,
    w: 3,
    h: 5,
    minW: 3,
    minH: 5
  },
  getProps: ({ events }) => ({
    events
  })
}