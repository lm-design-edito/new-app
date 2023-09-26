import { Darkdouille } from '../..'

export function resolveArgs (
  inputValue: Darkdouille.TreeValue,
  ...args: (Darkdouille.TreeValue | Darkdouille.Transformer<Darkdouille.TreeValue>)[]
): Darkdouille.TreeValue[] {
  return args.map(arg => typeof arg === 'function'
    ? arg(inputValue)
    : arg)
}
