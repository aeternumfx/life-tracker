import Donation from './Donation.vue'
import { markRaw } from 'vue'

export default {
  id: 'donation',
  title: 'Support Us',
  component: markRaw(Donation),
  defaultLayout: {
    i: 'donation',
    x: 9,
    y: 17,
    w: 3,
    h: 6,
    minW: 3,
    minH: 4
  },
  defW: 3,
  defH: 6,
  getProps: () => ({})
}