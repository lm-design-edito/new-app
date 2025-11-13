import { Cast } from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import SvelteApp, { Props } from '~/components/SvelteApp'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: SvelteApp }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    selector: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    fileUrl: i => Apps.ifNotUndefinedHelper(i, Cast.toString)
  }) ?? {}
}
