import * as Cast from '@design-edito/tools/agnostic/misc/cast'
import { isRecord } from '@design-edito/tools/agnostic/objects/is-record'
import { isInEnum } from '@design-edito/tools/agnostic/objects/enums/is-in-enum'
import { recordFormat } from '@design-edito/tools/agnostic/objects/record-format'
import { Apps } from '~/apps'
import Header, { Props, CtaActionType } from '~/components/Header'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Header }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input,  {
    customClass: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    logoHref: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    hideLogo: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    hideNav: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    hideCta: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean),
    navItems: i => Apps.ifNotUndefinedHelper(i, async i => {
      const arr = Cast.toArray(i)
      const prom = arrayToNavItems(arr)
      return await prom
    }),
    navItemsAlign: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
    navPosition: i => Apps.ifNotUndefinedHelper(i, i => {
      const str = Cast.toString(i)
      if (str === 'top') return 'top'
      if (str === 'below') return 'below'
      return undefined
    }),
    ctaContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    ctaActionType: i => Apps.ifNotUndefinedHelper(i, i => {
      const strI = Cast.toString(i)
      if (isInEnum(CtaActionType, strI)) return strI
      return undefined
    }),
    subnavContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    panelContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper)
    // ctaOnClick, // [WIP] Cannot handle functions from options
  }) ?? {}
}

async function arrayToNavItems (array: unknown[]): Promise<Props['navItems']> {
  const navItemsProps: NonNullable<Props['navItems']> = []
  for (const item of array) {
    if (!isRecord(item)) continue
    const navItemProps: NonNullable<Props['navItems']>[number] = await recordFormat(item, {
      value: i => Apps.ifNotUndefinedHelper(i, Cast.toString),
      content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      clickAction: i => Apps.ifNotUndefinedHelper(i, i => {
        // [WIP] should handle this using Apps.makeHandlerHelper
        const strI = Cast.toString(i)
        if (strI === 'scroll-to-chapter') return strI
        return undefined
      }),
      isActive: i => Apps.ifNotUndefinedHelper(i, Cast.toBoolean)
    })
    navItemsProps.push(navItemProps)
  }
  return navItemsProps
}
