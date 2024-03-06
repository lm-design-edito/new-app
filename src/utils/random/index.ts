export default function random (max: number = 1, min: number = 0) {
  const actualMin = Math.min(min, max)
  const actualMax = Math.max(min, max)
  const range = actualMax - actualMin
  return (Math.random() * range) + actualMin
}

export function randomInt (max?: number, min?: number) {
  return Math.floor(random(max, min))
}
