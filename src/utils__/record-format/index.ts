export type FormatKey<Input extends {} = any> = keyof Input | string
export type InputValue<Input extends {}, Key extends FormatKey<Input>> = Input extends Record<Key, infer V> ? V : undefined
export type FormatterFunc<I, O> = (val: I) => O | Promise<O>
export type Format<Input extends {} = any> = { [Key in FormatKey<Input>]: FormatterFunc<InputValue<Input, Key>, any> }
export type UnwrapPromise<PromiseOrNot> = PromiseOrNot extends Promise<infer Resolved> ? Resolved : PromiseOrNot
export type Formatted<F extends Format<{}>> = { [Key in keyof F]: UnwrapPromise<ReturnType<F[Key]>> }

export default async function recordFormat<
  I extends {},
  F extends Format<I>
> (input: I, format: F): Promise<Formatted<F>> {
  const result: Partial<Formatted<F>> = {}
  for (const key in format) {
    const formatter = format[key]
    if (typeof formatter === 'function') { result[key] = await formatter((input as any)[key as any]) }
    else { result[key] = formatter }
  }
  return result as Formatted<F>
}