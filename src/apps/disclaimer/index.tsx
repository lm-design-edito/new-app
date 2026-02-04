import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import Disclaimer, { Props } from '~/components/Disclaimer'
import { Events } from '~/shared'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Disclaimer }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    text: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    buttonText: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    onDismiss: i =>  Apps.makeHandlerHelper<Event | undefined>(Events.Type.DISCLAIMER_DISMISSED, i, id),
    customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString)
  }) ?? {}
}
