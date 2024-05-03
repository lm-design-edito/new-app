export type Input = Record<string, any>
export type Mapper<I extends Input> = (val: I[keyof I], key: keyof I, record: I) => any
export type Mapped<I extends Input, M extends Mapper<I>> = Record<keyof I, ReturnType<M>>
export default function recordMap<I extends Input, M extends Mapper<I>> (
  input: I,
  mapper: M
): Record<keyof I, ReturnType<M>> {
  const returned = {} as Partial<Mapped<I, M>>
  Object.entries(input).forEach(([key, val]) => {
    returned[key as keyof I] = mapper(val, key, input)
  })
  return returned as Mapped<I, M>
}
