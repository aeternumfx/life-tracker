// src/modules/_allModules.js
const modules = import.meta.glob('./*/index.js', { eager: true })

export default Object.values(modules)
  .map(m => m.default)
  .filter(Boolean) // ensure it's not undefined