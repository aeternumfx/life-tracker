// src/modules/DynamicList/index.js
import DynamicList from './DynamicList.vue'

export default {
  id: 'dynamic-list',
  title: 'Dynamic List',
  component: DynamicList,
  defaultLayout: {
    i: 'dynamiclist',
    x: 0,
    y: 0,
    w: 3,
    h: 5,
    minW: 3,
    minH: 5
  },
  defW: 3,
  defH: 5,
  getProps: ({ refreshKey }) => ({
    refreshKey
  })
}