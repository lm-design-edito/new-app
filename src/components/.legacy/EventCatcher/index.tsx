import { Component } from 'preact'
import { toRecord } from '~/utils/cast'
import {
  customEventName as eventName,
  customEventTarget as target,
  Instruction
} from '~/components/EventDispatcher'

export type Handler = (payload: Record<string, unknown>) => void

type Props = {
  on?: [Instruction, Handler][]
}

export default class EventCatcher extends Component<Props> {
  constructor (props: Props) {
    super(props)
    this.handleCustomEvent = this.handleCustomEvent.bind(this)
  }

  componentDidMount () {
    target.addEventListener(
      eventName,
      this.handleCustomEvent
    )
  }

  componentWillUnmount () {
    target.removeEventListener(
      eventName,
      this.handleCustomEvent
    )
  }

  handleCustomEvent (customEvent: Event) {
    const { on } = this.props
    if (on === undefined || on.length === 0) return;
    let foundPayload: unknown
    let foundInstruction: Instruction
    try {
      const { detail } = customEvent as any
      const { instruction, payload } = detail as Record<string, unknown>
      const instructionIsValid = Object
        .values(Instruction)
        .includes(instruction as Instruction)
      if (!instructionIsValid) return;
      foundPayload = payload
      foundInstruction = instruction as Instruction
    } catch (err) {
      console.error(err)
      return;
    }
    on.forEach(([instruction, handler]) => {
      if (instruction !== foundInstruction) return;
      const recordPayload = toRecord(foundPayload)
      handler(recordPayload)
    })
  }

  render () {
    return this.props.children ?? <></>
  }
}