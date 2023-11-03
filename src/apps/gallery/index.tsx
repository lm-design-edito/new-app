import { Apps } from '~/apps'
import Logger from '~/utils/silent-log'
import { toBoolean, toString } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Gallery, { Props } from '~/components/Gallery'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string, logger?: Logger): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id, logger)
  return { props, Component: Gallery }
}
 
async function toProps (input: unknown, id: string, logger?: Logger): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    itemsContent: async (i: unknown) => Array.isArray(i)
      ? await Promise.all(i.map(e => Apps.toStringOrVNodeHelper(e, logger)))
      : undefined,
    prevButtonContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i, logger) : undefined,
    nextButtonContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i, logger) : undefined,
    snapScroll: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    scrollerWidth: (i: unknown) => i !== undefined ? toString(i) : undefined
  })
  return props
}
