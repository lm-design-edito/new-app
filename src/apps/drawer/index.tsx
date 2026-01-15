import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import Drawer, { Props } from '~/components/Drawer'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Drawer }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    defaultState: i => Apps.ifNotUndefinedHelper(i, i => {
      const strI = Cast.toString(i)
      if (strI === 'opened') return 'opened'
      if (strI === 'closed') return 'closed'
      return undefined
    }),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    topBarContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    topBarClosedContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    togglerContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    togglerClosedContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    transitionDuration: i => Apps.ifNotUndefinedHelper(i, i => typeof i === 'number' ? i : Cast.toString(i)),
    transitionCloseDuration: i => Apps.ifNotUndefinedHelper(i, i => typeof i === 'number' ? i : Cast.toString(i)),
    transitionEase: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    transitionCloseEase: i => Apps.ifNotUndefinedHelper(i, Cast.toString)
  })?? {}
}
