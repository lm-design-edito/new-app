import { Apps } from '~/apps'
import { toString, toBoolean, toArray } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import isInEnum from '~/utils/is-in-enum'
import Header, { Props, CtaActionType } from '~/components/Header'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Header }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  return await Apps.toPropsHelper(input,  {
    customClass: i => Apps.ifNotUndefinedHelper(i, toString),
    logoHref: i => Apps.ifNotUndefinedHelper(i, toString),
    hideLogo: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    hideNav: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    hideCta: i => Apps.ifNotUndefinedHelper(i, toBoolean),
    navItems: i => Apps.ifNotUndefinedHelper(i, async i => {
      const arr = toArray(i)
      const prom = arrayToNavItems(arr)
      return await prom
    }),
    navItemsAlign: i => Apps.ifNotUndefinedHelper(i, toString),
    navPosition: i => Apps.ifNotUndefinedHelper(i, i => {
      const str = toString(i)
      if (str === 'top') return 'top'
      if (str === 'below') return 'below'
      return undefined
    }),
    ctaContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    ctaActionType: i => Apps.ifNotUndefinedHelper(i, i => {
      const strI = toString(i)
      if (isInEnum(CtaActionType, strI)) return strI
      return undefined
    }),
    subnavContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
    panelContent: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper)
    // ctaOnClick, // Cannot handle functions from options
  }) ?? {}
}

async function arrayToNavItems (array: unknown[]): Promise<Props['navItems']> {
  const navItemsProps: NonNullable<Props['navItems']> = []
  for (const item of array) {
    if (!isRecord(item)) continue
    const navItemProps: NonNullable<Props['navItems']>[number] = await recordFormat(item, {
      value: i => Apps.ifNotUndefinedHelper(i, toString),
      content: i => Apps.ifNotUndefinedHelper(i, Apps.toStringOrVNodeHelper),
      clickAction: i => Apps.ifNotUndefinedHelper(i, i => {
        const strI = toString(i)
        if (strI === 'scroll-to-chapter') return strI
        return undefined
      }),
      isActive: i => Apps.ifNotUndefinedHelper(i, toBoolean)
    })
    navItemsProps.push(navItemProps)
  }
  return navItemsProps
}
