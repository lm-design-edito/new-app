type FuncRecord = Record<string, (...args: any[]) => any>
type UnwrapPromise<PromiseOrNot> = PromiseOrNot extends Promise<infer Resolved> ? Resolved : PromiseOrNot

export default async function recordFormat<Format extends FuncRecord> (
  input: Record<string, unknown>,
  format: Format
): Promise<{ [Key in keyof Format]: UnwrapPromise<ReturnType<Format[Key]>> }> {
  const output: Partial<{ [Key in keyof Format]: UnwrapPromise<ReturnType<Format[Key]>> }> = {}
  const promises: Promise<any>[] = []
  Object.entries(format).forEach(async ([key, func]) => {
    const inputValue = input[key]
    const resultPromise = func(inputValue)
    promises.push(resultPromise)
    const result = await resultPromise
    output[key as keyof Format] = result
  })
  await Promise.all(promises)
  return output as { [Key in keyof Format]: UnwrapPromise<ReturnType<Format[Key]>> }
}
