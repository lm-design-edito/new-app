type BasicFunc = (...args: any[]) => any

export default function memoize<T extends BasicFunc = BasicFunc> (toMemoizeFunc: T) {
  let cachedArgs:  Parameters<T>|undefined = undefined
  let cachedResult: ReturnType<T>|undefined = undefined
  return function memoized (...args: Parameters<T>) {
    const allArgsAreInCache = cachedArgs !== undefined
      && args.every((arg, argPos) => (cachedArgs as Parameters<T>)[argPos] === arg)
    const allCachedAreInArgs = cachedArgs !== undefined
      && cachedArgs.every((arg, argPos) => args[argPos] === arg)
    const returnCache = allArgsAreInCache && allCachedAreInArgs
    if (returnCache) return cachedResult
    const result = toMemoizeFunc(...args)
    cachedResult = result
    return result
  }
}
