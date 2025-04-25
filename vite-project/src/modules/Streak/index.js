// modules/Streak/index.js
import { markRaw } from 'vue'
import Streak from './Streak.vue'

export default {
  id: 'streak',
  component: markRaw(Streak),
  defaultLayout: {
    i: 'streak',
    x: 0,
    y: 22,
    w: 3,
    h: 6,
    minW: 3,
    minH: 6
  },
  getProps: () => ({})
}