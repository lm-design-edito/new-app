import { Apps } from '~/apps'
import Logger from '~/utils/silent-log'
import { toString } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Drawer, { Props } from '~/components/Drawer'
import recordFormat from '~/utils/record-format'

export default async function renderer (unknownProps: unknown, id: string, logger?: Logger): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id, logger)
  return { props, Component: Drawer }
}

async function toProps (input: unknown, id: string, logger?: Logger): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    defaultState: (i: unknown) => {
      if (i === undefined) return undefined
      const strI = toString(i)
      if (strI === 'opened') return 'opened'
      if (strI === 'closed') return 'closed'
      return undefined
    },
    content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i, logger) : undefined,
    topBarContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i, logger) : undefined,
    topBarClosedContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i, logger) : undefined,
    togglerContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i, logger) : undefined,
    togglerClosedContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i, logger) : undefined,
    transitionDuration: (i: unknown) => {
      if (i === undefined) return undefined
      if (typeof i === 'number') return i
      return toString(i)
    },
    transitionCloseDuration: (i: unknown) => {
      if (i === undefined) return undefined
      if (typeof i === 'number') return i
      return toString(i)
    },
    transitionEase: (i: unknown) => i !== undefined ? toString(i) : undefined,
    transitionCloseEase: (i: unknown) => i !== undefined ? toString(i) : undefined
  })
  return props
}
