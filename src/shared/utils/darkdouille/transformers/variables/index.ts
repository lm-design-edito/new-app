import { Darkdouille } from '../..'
import { resolveArgs } from '../_resolveArgs'

// [WIP] since values are resolved from tree bottom to top, variables
// declared below will be created before those declared above. We cannot
// declare a variable at the top of the document and consume it below
// in a branch. If this is needed, variables should be considered as
// an other type of object than value/transformer/function, they
// would not be able to access any computed values inside the tree
// and should be stored as variables at the moment of parsing, not
// the moment of computing a node's value.

type VariablesList = Map<Darkdouille.TreeValue, Darkdouille.TreeValue>
const registry = new Map<string, VariablesList>()

const setVar = (resolve: Darkdouille.TreeResolver): Darkdouille.TransformerFunctionGenerator => (...args) => {
  return inputValue => {
    const path = resolve('./')?.pathForResolver
    if (path === undefined) return inputValue
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [name, rawValue] = resolvedArgs
    const value = rawValue ?? inputValue
    const thisVariables = registry.get(path)
    if (thisVariables === undefined) registry.set(path, new Map([[name, value]]))
    else thisVariables.set(name, value)
    return inputValue
  }
}

const getVar = (resolve: Darkdouille.TreeResolver): Darkdouille.TransformerFunctionGenerator => (...args) => {
  return inputValue => {
    const path = resolve('./')?.pathForResolver
    if (path === undefined) return inputValue
    const resolvedArgs = resolveArgs(inputValue, ...args)
    const [name] = resolvedArgs
    const thisVariables = registry.get(path)
    if (thisVariables === undefined) return undefined
    const theVariable = thisVariables.get(name)
    return theVariable
  }
}

export { setVar, getVar }
