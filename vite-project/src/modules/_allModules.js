import { markRaw } from 'vue'
const modules = import.meta.glob('./*/index.js', { eager: true })

export default Object.entries(modules).map(([path, mod]) => {
  const id = path.split('/')[1].toLowerCase()
    const def = mod.default
    
  
    return {
      id: (def.id || id).toLowerCase(),
      component: markRaw(def.component),
      title: def.title || id,
      help: def.help || '',
      getProps: def.getProps,
      defW: def.defW || 3,
      defH: def.defH || 5,
      minW: def.defaultLayout?.minW || 2,
      minH: def.defaultLayout?.minH || 2,
      defaultLayout: def.defaultLayout
    }
  })  