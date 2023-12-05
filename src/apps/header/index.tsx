import { Apps } from '~/apps'
import { toString, toBoolean } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import isInEnum from '~/utils/is-in-enum'
import Header, { Props, CtaActionType } from '~/components/Header'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Header }
}

async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    logoHref: (i: unknown) => i !== undefined ? toString(i) : undefined,
    hideLogo: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    hideNav: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    hideCta: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    navItems: async (i: unknown) => Array.isArray(i) ? await arrayToNavItems(i) : undefined,
    navItemsAlign: (i: unknown) => i !== undefined ? toString(i) : undefined,
    navPosition: (i: unknown) => {
      if (i === undefined) return undefined
      const strI = toString(i)
      if (strI === 'top') return 'top'
      if (strI === 'below') return 'below'
      return undefined
    },
    ctaContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    ctaActionType: (i: unknown) => {
      if (i === undefined) return undefined
      const strI = toString(i)
      if (isInEnum(CtaActionType, strI)) return strI
      return undefined
    },
    // ctaOnClick, // Cannot handle functions from options
    subnavContent: async (i: unknown) => i !== undefined ? await Apps.toStringOrVNodeHelper(i) : undefined,
    panelContent: async (i: unknown) => i !== undefined ? await Apps.toStringOrVNodeHelper(i) : undefined
  })
  return props
}

async function arrayToNavItems (array: unknown[]): Promise<Props['navItems']> {
  const navItemsProps: NonNullable<Props['navItems']> = []
  for (const item of array) {
    if (!isRecord(item)) continue
    const navItemProps: NonNullable<Props['navItems']>[number] = await recordFormat(item, {
      value: (i: unknown) => i !== undefined ? toString(i) : undefined,
      content: async (i: unknown) => i !== undefined ? await Apps.toStringOrVNodeHelper(i) : undefined,
      clickAction: (i: unknown) => {
        if (i === undefined) return undefined
        const strI = toString(i)
        if (strI === 'scroll-to-chapter') return strI
        return undefined
      },
      isActive: (i: unknown) => i !== undefined ? toBoolean(i) : undefined
    })
    navItemsProps.push(navItemProps)
  }
  return navItemsProps
}
