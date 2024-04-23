import { Darkdouille } from '../..'
import { resolveArgs } from '../_utils/resolveArgs'
import clone from '../clone'
import toDkdll from '../toDkdll'

const appendDkdll: Darkdouille.TransformerFunctionGenerator<Darkdouille.TreeValue> = (...args) => {
  return (inputValue): Darkdouille.TreeValue => {
    if (!(inputValue instanceof NodeList)) return inputValue
    const clonedInput = clone<NodeListOf<Node>>()(inputValue)
    const resolvedArgs = resolveArgs(clonedInput, ...args)
    const firstArg = resolvedArgs[0]
    const firstArgIsSelector = typeof firstArg === 'string'
    const rawDkdllValues = firstArgIsSelector ? [...resolvedArgs].slice(1) : [...resolvedArgs]
    const dkdllValues = rawDkdllValues.map(rawDkdllVal => toDkdll()(rawDkdllVal))
    const fakeDiv = document.createElement('div')
    fakeDiv.append(...clonedInput)
    const targets = Array.from(firstArgIsSelector ? fakeDiv.querySelectorAll(firstArg) : [fakeDiv])
    targets.forEach(target => {
      dkdllValues.forEach(dkdllVal => {
        if (typeof dkdllVal === 'string') target.append(dkdllVal)
        else target.append(...dkdllVal)
      })
    })
    return fakeDiv.childNodes
  }
}

export default appendDkdll
