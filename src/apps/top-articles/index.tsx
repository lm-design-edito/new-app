import { Cast } from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import TopArticles, { Props } from '~/components/TopArticles'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: TopArticles }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    dateFormat: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    dateLocale: i => Apps.ifNotUndefinedHelper(i, Cast.toString)
  }) ?? {}
}
