const themeModules = import.meta.glob('../themes/*/colors.json', { eager: true })

export function getAvailableThemes() {
  return Object.keys(themeModules)
    .map(path => path.match(/themes\/(.*?)\//)?.[1])
    .filter(Boolean)
}

export async function loadTheme(themeName) {
  const match = Object.entries(themeModules).find(([path]) =>
    path.includes(`/themes/${themeName}/colors.json`)
  )

  if (!match) throw new Error(`Theme '${themeName}' not found`)

  const themeData = match[1].default
  const colors = themeData.colors || themeData

  for (const [key, value] of Object.entries(colors)) {
    document.documentElement.style.setProperty(`--color-${key}`, value)

    // 🔥 Also define RGB vars
    if (typeof value === 'string' && value.startsWith('#')) {
      const rgb = hexToRgb(value)
      if (rgb) {
        document.documentElement.style.setProperty(`--color-${key}-rgb`, rgb)
      }
    }
  }

  return themeData
}

export function getIconPath(themeName, iconName) {
  return `/src/themes/${themeName}/icons/${iconName}.svg`
}

function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#')) return ''
  if (hex.length === 4) {
    hex = '#' + [...hex.slice(1)].map(x => x + x).join('')
  }
  const [r, g, b] = hex.match(/\w\w/g).map(c => parseInt(c, 16))
  return `${r}, ${g}, ${b}`
}