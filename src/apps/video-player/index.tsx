import { Cast } from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import VideoPlayer, { Props, State } from '~/components/VideoPlayer'

export { Props, State }

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
    console.log({unknownProps})
  const props = await toProps(unknownProps, id)
  return { props, Component: VideoPlayer }
}
 
async function toProps (input: unknown, id: string): Promise<Props> {
    console.log({input})
    return await Apps.toPropsHelper(input, {
        source: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
        poster_url: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
        credits: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
        legend: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
        autoplay: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
        loop: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
        sound: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
        sound_controls: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
        play_controls: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
        time_controls: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
        title: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
        kicker: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
        sensitive_content: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
        disclaimer_text: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
        disclaimer_button: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    }) ?? {}
}
