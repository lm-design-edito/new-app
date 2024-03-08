import { Apps } from '~/apps'
import { toString } from '~/utils/cast'
import Drawer, { Props } from '~/components/Drawer'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Drawer }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    defaultState: i => Apps.ifNotUndefinedHelper(i, i => {
      const strI = toString(i)
      if (strI === 'opened') return 'opened'
      if (strI === 'closed') return 'closed'
      return undefined
    }),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    topBarContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    topBarClosedContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    togglerContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    togglerClosedContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    transitionDuration: i => Apps.ifNotUndefinedHelper(i, i => typeof i === 'number' ? i : toString(i)),
    transitionCloseDuration: i => Apps.ifNotUndefinedHelper(i, i => typeof i === 'number' ? i : toString(i)),
    transitionEase: i => Apps.ifNotUndefinedHelper(i, toString),
    transitionCloseEase: i => Apps.ifNotUndefinedHelper(i, toString)
  })?? {}
}
