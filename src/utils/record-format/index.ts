export type FuncRecord = Record<string, (...args: any[]) => any>
export type UnwrapPromise<PromiseOrNot> = PromiseOrNot extends Promise<infer Resolved> ? Resolved : PromiseOrNot
export type FormattedFieldPromise<Format extends FuncRecord, Key extends keyof Format> = ReturnType<Format[Key]>
export type FormattedField<Format extends FuncRecord, Key extends keyof Format> = UnwrapPromise<FormattedFieldPromise<Format, Key>>
export type Formatted<Format extends FuncRecord> = { [key in keyof Format]: FormattedField<Format, key> }

export default async function recordFormat<Format extends FuncRecord> (
  input: Record<string, unknown>,
  format: Format
): Promise<Formatted<Format>> {
  const output: Partial<Formatted<Format>> = {}
  const promises: Promise<any>[] = []
  Object.entries(format).forEach(async ([key, func]) => {
    const inputValue = input[key]
    const resultPromise = func(inputValue)
    promises.push(resultPromise)
    const result = await resultPromise
    output[key as keyof Format] = result
  })
  await Promise.all(promises)
  return output as Formatted<Format>
}
