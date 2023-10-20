import isConstructorFunction, { ConstructorFunction } from '~/utils/is-constructor-function'
type TypeCheckerFunction = (input: unknown) => boolean
type TypeChecker = ConstructorFunction | TypeCheckerFunction

export default function isArrayOf (input: unknown, _types: TypeChecker | TypeChecker[] = []): input is unknown[] {
  if (!Array.isArray(input)) return false;
  const types = Array.isArray(_types) ? _types : [_types]
  if (types.length === 0) return true
  return input.every(entry => {
    return types.some(typeChecker => {
      const isConstructor = isConstructorFunction(typeChecker)
      if (!isConstructor) return typeChecker(entry)
      if (typeChecker === Number) return typeof entry === 'number'
      if (typeChecker === String) return typeof entry === 'string'
      if (typeChecker === Boolean) return typeof entry === 'boolean'
      if (isConstructor) return entry instanceof typeChecker
    })
  })
}
