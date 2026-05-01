export const DEFAULT_PRIMARY_COLOR = '#2563eb'

const NAMED_COLORS: Record<string, string> = {
  green: '#16a34a',
  blue: '#2563eb',
  red: '#dc2626',
  yellow: '#ca8a04',
  orange: '#ea580c',
  purple: '#7c3aed',
  pink: '#db2777',
  teal: '#0f766e',
  emerald: '#059669',
  cyan: '#0891b2',
  indigo: '#4f46e5',
}

const PRIMARY_SHADE_STOPS: Record<number, number> = {
  50: 92,
  100: 84,
  200: 70,
  300: 52,
  400: 28,
  500: 0,
  600: -10,
  700: -22,
  800: -34,
  900: -46,
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const normalizeHexColor = (value?: string | null) => {
  if (!value) return DEFAULT_PRIMARY_COLOR

  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_PRIMARY_COLOR

  const hex = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed

  const namedColor = NAMED_COLORS[hex.toLowerCase()]
  if (namedColor) {
    return namedColor
  }

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex
      .split('')
      .map((char) => char + char)
      .join('')}`
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex}`
  }

  return DEFAULT_PRIMARY_COLOR
}

const hexToRgb = (hex: string) => {
  const normalized = normalizeHexColor(hex).slice(1)
  const value = Number.parseInt(normalized, 16)

  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  }
}

const rgbToHex = (red: number, green: number, blue: number) => {
  return `#${[red, green, blue]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
}

const mixWithWhite = (color: string, percentage: number) => {
  const rgb = hexToRgb(color)
  return rgbToHex(
    rgb.red + (255 - rgb.red) * percentage,
    rgb.green + (255 - rgb.green) * percentage,
    rgb.blue + (255 - rgb.blue) * percentage,
  )
}

const mixWithBlack = (color: string, percentage: number) => {
  const rgb = hexToRgb(color)
  return rgbToHex(rgb.red * (1 - percentage), rgb.green * (1 - percentage), rgb.blue * (1 - percentage))
}

const getReadableForeground = (color: string) => {
  const rgb = hexToRgb(color)
  const luminance = (0.299 * rgb.red + 0.587 * rgb.green + 0.114 * rgb.blue) / 255
  return luminance > 0.62 ? '#0f172a' : '#ffffff'
}

export const buildPrimaryPalette = (primaryColor?: string) => {
  const base = normalizeHexColor(primaryColor)
  const palette = {
    50: mixWithWhite(base, PRIMARY_SHADE_STOPS[50] / 100),
    100: mixWithWhite(base, PRIMARY_SHADE_STOPS[100] / 100),
    200: mixWithWhite(base, PRIMARY_SHADE_STOPS[200] / 100),
    300: mixWithWhite(base, PRIMARY_SHADE_STOPS[300] / 100),
    400: mixWithWhite(base, PRIMARY_SHADE_STOPS[400] / 100),
    500: base,
    600: mixWithBlack(base, Math.abs(PRIMARY_SHADE_STOPS[600]) / 100),
    700: mixWithBlack(base, Math.abs(PRIMARY_SHADE_STOPS[700]) / 100),
    800: mixWithBlack(base, Math.abs(PRIMARY_SHADE_STOPS[800]) / 100),
    900: mixWithBlack(base, Math.abs(PRIMARY_SHADE_STOPS[900]) / 100),
  }

  return {
    color: base,
    foreground: getReadableForeground(base),
    palette,
  }
}

export const applyThemeColor = (primaryColor?: string, target: HTMLElement = document.documentElement) => {
  const theme = buildPrimaryPalette(primaryColor)

  Object.entries(theme.palette).forEach(([shade, value]) => {
    target.style.setProperty(`--primary-${shade}`, value)
  })

  const primaryRgb = hexToRgb(theme.color)
  const foregroundRgb = hexToRgb(theme.foreground)

  target.style.setProperty('--primary', theme.color)
  target.style.setProperty('--primary-foreground', theme.foreground)
  target.style.setProperty('--primary-rgb', `${primaryRgb.red} ${primaryRgb.green} ${primaryRgb.blue}`)
  target.style.setProperty('--primary-foreground-rgb', `${foregroundRgb.red} ${foregroundRgb.green} ${foregroundRgb.blue}`)
  target.style.setProperty('--background-primary', '#ffffff')
  target.style.setProperty('--background-secondary', '#f8fafc')
  target.style.setProperty('--background-tertiary', '#eef2f7')
  target.style.setProperty('--text-primary', '#0f172a')
  target.style.setProperty('--text-secondary', '#334155')
  target.style.setProperty('--text-tertiary', '#64748b')
  target.style.setProperty('--border-color', '#e2e8f0')
  target.style.setProperty('--surface-elevated', '#ffffff')

  return theme
}

export const extractThemeColor = (payload: any): string | undefined => {
  const data = payload?.data?.data ?? payload?.data ?? payload

  return data?.colorCode ?? data?.ColorCode ?? data?.school?.colorCode ?? data?.school?.ColorCode ?? undefined
}
