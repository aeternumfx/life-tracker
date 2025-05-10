// modules/TaskPanel/index.js
import TaskPanel from './TaskPanel.vue'

export default {
  id: 'task-panel',
  title: 'Tasks',
  component: TaskPanel,
  defaultLayout: {
    i: 'tasks',
    x: 9,
    y: 0,
    w: 3,
    h: 5,
    minW: 3,
    minH: 5
  },
  defW: 3,
  defH: 5,
  getProps: ({ events }) => ({
    events
  })
}