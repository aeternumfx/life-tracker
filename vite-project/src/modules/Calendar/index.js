import { markRaw } from 'vue'
import Calendar from './Calendar.vue'

export default {
  id: 'calendar',
  component: Calendar,
  defaultLayout: {
    i: 'calendar',
    x: 0,
    y: 0,
    w: 9,
    h: 22,
    minW: 9,
    minH: 10
  },
  getProps: ({ events = [], eventSourceKey = 0, onEventAdded = () => {} } = {}) => ({
    events,
    eventSourceKey,
    onEventAdded
  }),
  title: 'Calendar',
  help: 'Displays a monthly calendar for managing events.'
}