import { Cast } from '@design-edito/tools/agnostic/misc/cast'
import { Apps } from '~/apps'
import TopArticles, {
  Props,
  orderByOptions,
  langOptions,
  deviceOptions,
  mediumOptions,
  sinceOptions,
  publishedSinceOptions,
  orderByDirectionOptions
} from '~/components/TopArticles'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: TopArticles }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input, {
    dateFormat: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    dateLocale: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    orderByOptions: i => {
      const stringified = Apps.ifNotUndefinedHelper(i, Cast.toString)
      if (stringified === undefined) return undefined
      if (orderByOptions.includes(stringified as any)) return stringified as typeof orderByOptions[number]
      return undefined
    },
    lang: i => {
      const stringified = Apps.ifNotUndefinedHelper(i, Cast.toString)
      if (stringified === undefined) return undefined
      if (langOptions.includes(stringified as any)) return stringified as typeof langOptions[number]
      return undefined
    },
    device: i => {
      const stringified = Apps.ifNotUndefinedHelper(i, Cast.toString)
      if (stringified === undefined) return undefined
      if (deviceOptions.includes(stringified as any)) return stringified as typeof deviceOptions[number]
      return undefined
    },
    medium: i => {
      const stringified = Apps.ifNotUndefinedHelper(i, Cast.toString)
      if (stringified === undefined) return undefined
      if (mediumOptions.includes(stringified as any)) return stringified as typeof mediumOptions[number]
      return undefined
    },
    since: i => {
      const stringified = Apps.ifNotUndefinedHelper(i, Cast.toString)
      if (stringified === undefined) return undefined
      if (sinceOptions.includes(stringified as any)) return stringified as typeof sinceOptions[number]
      return undefined
    },
    publishedSince: i => {
      const stringified = Apps.ifNotUndefinedHelper(i, Cast.toString)
      if (stringified === undefined) return undefined
      if (publishedSinceOptions.includes(stringified as any)) return stringified as typeof publishedSinceOptions[number]
      return undefined
    },
    free: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    author: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    subsection: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    section: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    excludedSections: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    excludedSubsections: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    itemNumber: i => Apps.ifNotUndefinedHelper(i, Cast.toNumber),
    page: i => Apps.ifNotUndefinedHelper(i, Cast.toNumber),
    orderByDirection: i => {
      const stringified = Apps.ifNotUndefinedHelper(i, Cast.toString)
      if (stringified === undefined) return undefined
      if (orderByDirectionOptions.includes(stringified as any)) return stringified as typeof orderByDirectionOptions[number]
      return undefined
    },
  }) ?? {}
}
