// src/utils/themeLoader.js

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
  
  // 🚨 Here's the important difference:
  const colors = themeData.colors || themeData // fallback for old flat ones

  for (const [key, value] of Object.entries(colors)) {
    document.documentElement.style.setProperty(`--color-${key}`, value)
  }

  return themeData // 🔥 return the whole theme (meta + colors), not just colors
}

export function getIconPath(themeName, iconName) {
  return `/src/themes/${themeName}/icons/${iconName}.svg`
}