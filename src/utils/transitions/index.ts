type Callback = (val: number, timeMs: number) => void

export enum Ease {
  LINEAR = 'linear',
  EASE_IN_QUAD = 'ease-in-quad',
  EASE_OUT_QUAD = 'ease-out-quad',
  EASE_IN_OUT_QUAD = 'ease-in-out-quad',
  EASE_IN_CUBIC = 'ease-in-cubic',
  EASE_OUT_CUBIC = 'ease-out-cubic',
  EASE_IN_OUT_CUBIC = 'ease-in-out-cubic',
  EASE_IN_QUART = 'ease-in-quart',
  EASE_OUT_QUART = 'ease-out-quart',
  EASE_IN_OUT_QUART = 'ease-in-out-quart',
  EASE_IN_QUINT = 'ease-in-quint',
  EASE_OUT_QUINT = 'ease-out-quint',
  EASE_IN_OUT_QUINT = 'ease-in-out-quint',
  EASE_IN_SINE = 'ease-in-sine',
  EASE_OUT_SINE = 'ease-out-sine',
  EASE_IN_OUT_SINE = 'ease-in-out-sine',
  EASE_IN_EXPO = 'ease-in-expo',
  EASE_OUT_EXPO = 'ease-out-expo',
  EASE_IN_OUT_EXPO = 'ease-in-out-expo',
  EASE_IN_CIRC = 'ease-in-circ',
  EASE_OUT_CIRC = 'ease-out-circ',
  EASE_IN_OUT_CIRC = 'ease-in-out-circ',
  EASE_IN_BACK = 'ease-in-back',
  EASE_OUT_BACK = 'ease-out-back',
  EASE_IN_OUT_BACK = 'ease-in-out-back',
  EASE_IN_ELASTIC = 'ease-in-elastic',
  EASE_OUT_ELASTIC = 'ease-out-elastic',
  EASE_IN_OUT_ELASTIC = 'ease-in-out-elastic',
  EASE_IN_BOUNCE = 'ease-in-bounce',
  EASE_OUT_BOUNCE = 'ease-out-bounce',
  EASE_IN_OUT_BOUNCE = 'ease-in-out-bounce'
}

type EasingFunction = (progress: number) => number

type EasingDictionary = Record<string, EasingFunction>

export default async function transition (
  to: number,
  durationMs: number,
  callbackOrEase: Ease | Callback,
  callback?: Callback): Promise<void> {
  const ease = typeof callbackOrEase === 'string' ? callbackOrEase : Ease.LINEAR
  const easing = easings[ease]
  if (easing === undefined) return
  const actualCallback = callback ?? (typeof callbackOrEase === 'function' ? callbackOrEase : undefined)
  if (actualCallback === undefined) return
  const start = Date.now()
  const timeTable = new Array(to).fill(null).map((_, step) => {
    const progression = (step + 1) / to
    const eased = easing(progression)
    const time = start + eased * durationMs
    return { time, step: eased * to }
  })
  for (const { time, step } of timeTable) {
    const now = Date.now()
    const delay = time - now
    if (delay <= 0) actualCallback(step, time)
    else {
      await wait(delay)
      actualCallback(step, time)
    }
  }
}

export async function wait (durationMs: number) {
  return new Promise(resolve => {
    window.setTimeout(() => resolve(true), durationMs)
  })
}

// Easing functions taken from https://easings.net/
const pow = Math.pow
const sqrt = Math.sqrt
const sin = Math.sin
const cos = Math.cos
const PI = Math.PI
const c1 = 1.70158
const c2 = c1 * 1.525
const c3 = c1 + 1
const c4 = (2 * PI) / 3
const c5 = (2 * PI) / 4.5

const bounceOut: EasingFunction = function (x) {
	const n1 = 7.5625
	const d1 = 2.75
	if (x < 1 / d1) return n1 * x * x
	if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75
	if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375
	return n1 * (x -= 2.625 / d1) * x + 0.984375
}

export const easingFunctions: EasingDictionary = {
	linear: (x) => x,
	easeInQuad: x => (x * x),
	easeOutQuad: x => (1 - (1 - x) * (1 - x)),
	easeInOutQuad: x=> (x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2),
	easeInCubic: x => (x * x * x),
	easeOutCubic: x => (1 - pow(1 - x, 3)),
	easeInOutCubic: x => (x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2),
	easeInQuart: x => (x * x * x * x),
	easeOutQuart: x => (1 - pow(1 - x, 4)),
	easeInOutQuart: x => (x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2),
	easeInQuint: x => (x * x * x * x * x),
	easeOutQuint: x => (1 - pow(1 - x, 5)),
	easeInOutQuint: x => (x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2),
	easeInSine: x => (1 - cos((x * PI) / 2)),
	easeOutSine: x => (sin((x * PI) / 2)),
	easeInOutSine: x => (-(cos(PI * x) - 1) / 2),
	easeInExpo: x => (x === 0 ? 0 : pow(2, 10 * x - 10)),
	easeOutExpo: x => (x === 1 ? 1 : 1 - pow(2, -10 * x)),
	easeInOutExpo: x => {
		return x === 0
			? 0
			: x === 1
				? 1
				: x < 0.5
					? pow(2, 20 * x - 10) / 2
					: (2 - pow(2, -20 * x + 10)) / 2
	},
	easeInCirc: x => (1 - sqrt(1 - pow(x, 2))),
	easeOutCirc: x => (sqrt(1 - pow(x - 1, 2))),
	easeInOutCirc: x => (
		x < 0.5
			? (1 - sqrt(1 - pow(2 * x, 2))) / 2
			: (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2
	),
	easeInBack: x => (c3 * x * x * x - c1 * x * x),
	easeOutBack: x => (1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2)),
	easeInOutBack: x => (x < 0.5
		? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
		: (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
	),
	easeInElastic: x => {
		return x === 0
			? 0
			: x === 1
				? 1
				: -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4)
	},
	easeOutElastic: x => {
		return x === 0
			? 0
			: x === 1
				? 1
				: pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1
	},
	easeInOutElastic: x => {
		return x === 0
			? 0
			: x === 1
				? 1
				: x < 0.5
					? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
					: (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1
	},
	easeInBounce: x => (1 - bounceOut(1 - x)),
	easeOutBounce: bounceOut,
	easeInOutBounce: x => (x < 0.5
		? (1 - bounceOut(1 - 2 * x)) / 2
		: (1 + bounceOut(2 * x - 1)) / 2
	)
}

export const easings: Record<Ease, ((ratio: number) => number) | undefined> = {
  [Ease.LINEAR]: easingFunctions.linear,
  [Ease.EASE_IN_QUAD]: easingFunctions.easeInQuad,
  [Ease.EASE_OUT_QUAD]: easingFunctions.easeOutQuad,
  [Ease.EASE_IN_OUT_QUAD]: easingFunctions.easeInOutQuad,
  [Ease.EASE_IN_CUBIC]: easingFunctions.easeInCubic,
  [Ease.EASE_OUT_CUBIC]: easingFunctions.easeOutCubic,
  [Ease.EASE_IN_OUT_CUBIC]: easingFunctions.easeInOutCubic,
  [Ease.EASE_IN_QUART]: easingFunctions.easeInQuart,
  [Ease.EASE_OUT_QUART]: easingFunctions.easeOutQuart,
  [Ease.EASE_IN_OUT_QUART]: easingFunctions.easeInOutQuart,
  [Ease.EASE_IN_QUINT]: easingFunctions.easeInQuint,
  [Ease.EASE_OUT_QUINT]: easingFunctions.easeOutQuint,
  [Ease.EASE_IN_OUT_QUINT]: easingFunctions.easeInOutQuint,
  [Ease.EASE_IN_SINE]: easingFunctions.easeInSine,
  [Ease.EASE_OUT_SINE]: easingFunctions.easeOutSine,
  [Ease.EASE_IN_OUT_SINE]: easingFunctions.easeInOutSine,
  [Ease.EASE_IN_EXPO]: easingFunctions.easeInExpo,
  [Ease.EASE_OUT_EXPO]: easingFunctions.easeOutExpo,
  [Ease.EASE_IN_OUT_EXPO]: easingFunctions.easeInOutExpo,
  [Ease.EASE_IN_CIRC]: easingFunctions.easeInCirc,
  [Ease.EASE_OUT_CIRC]: easingFunctions.easeOutCirc,
  [Ease.EASE_IN_OUT_CIRC]: easingFunctions.easeInOutCirc,
  [Ease.EASE_IN_BACK]: easingFunctions.easeInBack,
  [Ease.EASE_OUT_BACK]: easingFunctions.easeOutBack,
  [Ease.EASE_IN_OUT_BACK]: easingFunctions.easeInOutBack,
  [Ease.EASE_IN_ELASTIC]: easingFunctions.easeInElastic,
  [Ease.EASE_OUT_ELASTIC]: easingFunctions.easeOutElastic,
  [Ease.EASE_IN_OUT_ELASTIC]: easingFunctions.easeInOutElastic,
  [Ease.EASE_IN_BOUNCE]: easingFunctions.easeInBounce,
  [Ease.EASE_OUT_BOUNCE]: easingFunctions.easeOutBounce,
  [Ease.EASE_IN_OUT_BOUNCE]: easingFunctions.easeInOutBounce
}
