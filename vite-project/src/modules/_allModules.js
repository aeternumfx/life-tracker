import { markRaw } from 'vue'
const modules = import.meta.glob('./*/index.js', { eager: true })

export default Object.entries(modules).map(([path, mod]) => {
  const id = path.split('/')[1]
  const def = mod.default

  return {
    id: def.id || id,
    component: markRaw(def.component), // ✅ moved here
    defaultLayout: def.defaultLayout || { w: 4, h: 4, minW: 2, minH: 2 },
    getProps: def.getProps,
    title: def.title || id,
    help: def.help || ''
  }
})