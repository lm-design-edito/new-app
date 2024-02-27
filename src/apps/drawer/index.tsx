import { Apps } from '~/apps'
import { toString } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import Drawer, { Props } from '~/components/Drawer'
import recordFormat from '~/utils/record-format'
import { Events } from '~/shared'

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: Drawer }
}

async function toProps (input: unknown, id: string): Promise<Props> {
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
    content: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    topBarContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    topBarClosedContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    togglerContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    togglerClosedContent: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
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
    transitionCloseEase: (i: unknown) => i !== undefined ? toString(i) : undefined,
    onSomeEvent: (i: unknown) => i !== undefined
      ? Apps.eventsSyncHelper({
        names: i,
        appId: id,
        eventType: Events.Type.SOME_EVENT
      })
      : undefined
  })
  return props
}
