export function getArcColor(
  primaryColor: string,
  secondaryColor: string,
  index: number,
  opacity: number = 0.7
): string {
  const palette = [
    primaryColor,
    secondaryColor,
    blendColors(primaryColor, secondaryColor, 0.5),
    blendColors(primaryColor, '#ffffff', 0.3),
  ]
  const hex = palette[index % palette.length]
  return hexToRgba(hex, opacity)
}

function blendColors(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  return `#${Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, '0')}${Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, '0')}${Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, '0')}`
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}
