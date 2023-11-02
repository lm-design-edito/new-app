import { Apps } from 'apps'
import Logger from '~/utils/silent-log'
import { toString } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Drawer, { Props } from '~/components/Drawer'

export default async function renderer (
  unknownProps: unknown,
  id: string,
  logger?: Logger
): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id, logger)
  return { props, Component: Drawer }
}

async function toProps (input: unknown, id: string, logger?: Logger): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = {}
  const {
    customClass,
    defaultState,
    content,
    topBarContent,
    topBarClosedContent,
    togglerContent,
    togglerClosedContent,
    transitionDuration,
    transitionCloseDuration,
    transitionEase,
    transitionCloseEase
  } = input
  if (customClass !== undefined) { props.customClass = toString(customClass) }
  if (defaultState !== undefined) {
    const strDefaultState = toString(defaultState)
    if (strDefaultState === 'opened' || strDefaultState === 'closed') {
      props.defaultState = strDefaultState
    }
  }
  if (content !== undefined) { props.content = await Apps.toStringOrVNodeHelper(content, logger) }
  if (topBarContent !== undefined) { props.topBarContent = await Apps.toStringOrVNodeHelper(topBarContent, logger) }
  if (topBarClosedContent !== undefined) { props.topBarClosedContent = await Apps.toStringOrVNodeHelper(topBarClosedContent, logger) }
  if (togglerContent !== undefined) { props.togglerContent = await Apps.toStringOrVNodeHelper(togglerContent, logger) }
  if (togglerClosedContent !== undefined) { props.togglerClosedContent = await Apps.toStringOrVNodeHelper(togglerClosedContent, logger) }
  if (typeof transitionDuration === 'number') { props.transitionDuration = transitionDuration }
  else if (transitionDuration !== undefined) { props.transitionDuration = toString(transitionDuration) }
  if (typeof transitionCloseDuration === 'number') { props.transitionCloseDuration = transitionCloseDuration }
  else if (transitionCloseDuration !== undefined) { props.transitionCloseDuration = toString(transitionCloseDuration) }
  if (transitionEase !== undefined) { props.transitionEase = toString(transitionEase) }
  if (transitionCloseEase !== undefined) { props.transitionCloseEase = toString(transitionCloseEase) }
  return props
}
