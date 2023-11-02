import { Apps } from 'apps'
import Logger from '~/utils/silent-log'
import { toBoolean, toString } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Gallery, { Props } from '~/components/Gallery'

export default async function renderer (
  unknownProps: unknown,
  id: string,
  logger?: Logger
): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id, logger)
  return { props, Component: Gallery }
}
 
async function toProps (input: unknown, id: string, logger?: Logger): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = {}
  const {
    customClass,
    itemsContent,
    prevButtonContent,
    nextButtonContent,
    snapScroll,
    scrollerWidth
  } = input
  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (Array.isArray(itemsContent)) {
    const itemsPromise = itemsContent.map(itemContent => Apps.toStringOrVNodeHelper(itemContent, logger))
    props.itemsContent = await Promise.all(itemsPromise)
  }
  if (prevButtonContent !== undefined) { props.prevButtonContent = await Apps.toStringOrVNodeHelper(prevButtonContent, logger) }
  if (nextButtonContent !== undefined) { props.nextButtonContent = await Apps.toStringOrVNodeHelper(nextButtonContent, logger) }
  if (snapScroll !== undefined) { props.snapScroll = toBoolean(snapScroll) }
  if (scrollerWidth !== undefined) { props.scrollerWidth = toString(scrollerWidth) }
  return props
}
