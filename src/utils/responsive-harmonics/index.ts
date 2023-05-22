import roundNumbers from '~/utils/round-numbers'

export function getHarmonic (
  min: number,
  max: number,
  level: number,
  steps: number) {
  if (min === 0) {
    console.warn('Cannot generate harmonics if min value is zero')
    return NaN
  }
  if (steps < 1) {
    console.warn('Cannot generate harmonics if steps is lower than one')
    return NaN
  }
  const maxOverMin = max / min
  const oneOverSteps = 1 / parseInt(`${steps}`)
  const factor = Math.pow(maxOverMin, oneOverSteps)
  return min * Math.pow(factor, level)
}

type AffineFunction = {
  slope: number
  yIntercept: number
}

function getAffineFunction (
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number): AffineFunction {
  const slope = (y2 - y1) / (x2 - x1)
  const yIntercept = y1 - (x1 * slope)
  return { slope, yIntercept }
}

function getCssValueFromAffine (affine: AffineFunction) {
  const { slope, yIntercept } = affine
  const roundedSlope = roundNumbers(100 * slope, 3)
  const roundedIntercept = roundNumbers(yIntercept, 2)
  return `calc(${roundedSlope}vw + ${roundedIntercept}px)`
}

type ScaleDescriptor = {
  screenBounds: [number, number]
  lowLevel: [number, number]
  highLevel: [number, number]
  steps: number
  clamp?: boolean
}

export function createScale (descriptor: ScaleDescriptor) {
  const {
    screenBounds: [loBound, hiBound],
    lowLevel: [loLevelMin, loLevelMax],
    highLevel: [hiLevelMin, hiLevelMax],
    steps,
    clamp
  } = descriptor
  return function scale (level: number) {
    if (steps < 2) return
    const loBoundRange = [loLevelMin, hiLevelMin]
    const hiBoundRange = [loLevelMax, hiLevelMax]
    const loBoundVal = getHarmonic(loBoundRange[0], loBoundRange[1], level - 1, steps - 1)
    const hiBoundVal = getHarmonic(hiBoundRange[0], hiBoundRange[1], level - 1, steps - 1)
    if (loBoundVal === undefined) return
    if (hiBoundVal === undefined) return
    const affine = getAffineFunction(loBound, loBoundVal, hiBound, hiBoundVal)
    const cssFormula = getCssValueFromAffine(affine)
    return clamp === true
      ? `clamp(${roundNumbers(loBoundVal, 2)}px, ${cssFormula}, ${roundNumbers(hiBoundVal, 2)}px)`
      : cssFormula
  }
}
