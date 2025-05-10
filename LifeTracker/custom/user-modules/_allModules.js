import { markRaw } from 'vue'

const modules = import.meta.glob('./*/index.js', { eager: true })

export default Object.entries(modules).map(([path, mod]) => {
  const folderId = path.split('/')[1].toLowerCase()
  const def = mod.default
  const declaredId = (def.id || folderId).toLowerCase()

  if (declaredId !== folderId) {
    console.warn(`⚠️ Module ID mismatch in ${path}: expected '${folderId}', got '${def.id}'`)
  }

  return {
    id: declaredId,
    component: markRaw(def.component),
    title: def.title || folderId,
    help: def.help || '',
    getProps: def.getProps,
    defW: def.defW || 3,
    defH: def.defH || 5,
    minW: def.defaultLayout?.minW || 2,
    minH: def.defaultLayout?.minH || 2,
    defaultLayout: def.defaultLayout
  }
})