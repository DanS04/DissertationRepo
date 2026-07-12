// Colour scales based off of research
// Activation: dark-blue > teal > amber > red (cool to hot)
// Fatigue: green > amber > red (recovered to fatigued)

function lerp(a, b, t) { return a + (b - a) * t }

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}

function interpolateStops(stops, value) {
  const clamped = Math.max(0, Math.min(100, value))
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i]
    const [p1, c1] = stops[i + 1]
    if (clamped >= p0 && clamped <= p1) {
      const t = (clamped - p0) / (p1 - p0)
      const [r0, g0, b0] = hexToRgb(c0)
      const [r1, g1, b1] = hexToRgb(c1)
      return rgbToHex(lerp(r0, r1, t), lerp(g0, g1, t), lerp(b0, b1, t))
    }
  }
  return stops[stops.length - 1][1]
}

// Activation heat map dark-blue > teal > amber > red
const ACTIVATION_STOPS = [
  [0, '#1a2744'],
  [20, '#1e5f8c'],
  [40, '#0ea5a0'],
  [65, '#f59e0b'],
  [85, '#ef4444'],
  [100, '#cc1133'],
]

// Fatigue heat map green > amber > red
const FATIGUE_STOPS = [
  [0, '#0d4022'],
  [20, '#16a34a'],
  [45, '#84cc16'],
  [60, '#f59e0b'],
  [80, '#ef4444'],
  [100, '#991b1b'],
]

export function activationColour(value) {
  if (!value || value === 0) return '#1a2744'
  return interpolateStops(ACTIVATION_STOPS, value)
}

export function fatigueColour(value) {
  if (!value || value === 0) return '#0d4022'
  return interpolateStops(FATIGUE_STOPS, value)
}

export function getColour(value, mode) {
  return mode === 'fatigue' ? fatigueColour(value) : activationColour(value)
}

// Colours for inactive muscles
export const INACTIVE_COLOUR = '#1a2744'
export const BASE_BODY_COLOUR = '#1e293b'
