import { Component } from 'preact'
import { customEventName, Instruction } from '../EventDispatcher'

type Props = {
  instruction: Instruction
}

export default class EventCatcher extends Component<Props> {
  constructor (props: Props) {
    super(props)
    window.addEventListener(customEventName, this.handleCustomEvent)
  }

  componentWillUnmount () {
    window.removeEventListener(customEventName, this.handleCustomEvent)
  }

  handleCustomEvent (customEvent: Event) {
    if (!('detail' in customEvent)) return
    const { detail } = customEvent as CustomEvent
    if (!('instruction' in detail)) return
    const { instruction, payload } = detail as { instruction: unknown, payload?: unknown }
    const { props } = this
    if (instruction === Instruction.SET_HEADER_PROPS) {
      const p = payload
    }
    
  }

  render () {
    return <div></div>
  }
}