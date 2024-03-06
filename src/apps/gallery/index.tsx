import { Apps } from '~/apps'
import { toBoolean, toString } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Gallery, { Props } from '~/components/Gallery'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Gallery }
}
 
async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    itemsContent: async (i: unknown) => Array.isArray(i)
      ? await Promise.all(i.map(e => Apps.toStringOrVNodeHelper(e)))
      : undefined,
    prevButtonContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    nextButtonContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    snapScroll: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    scrollerWidth: i => Apps.ifNotUndefinedHelper(i, toString)
  })
  return props
}
