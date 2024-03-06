import { Component, VNode } from 'preact'

export type Props = {
  customClass?: string
  eventTypes?: string | string[]
  targetSelector?: string
  content?: string | VNode
  onEvent?: (e: Event) => void
  // options?: AddEventListenerOptions // [WIP] ?
}

export default class EventListenerComponent extends Component<Props> {
  $root: HTMLDivElement | null = null

  constructor (props: Props) {
    super(props)
    this.addListeners = this.addListeners.bind(this)
    this.removeListeners = this.removeListeners.bind(this)
  }

  componentDidMount () {
    const { targetSelector, eventTypes, onEvent } = this.props
    this.addListeners(targetSelector, eventTypes, onEvent)
  }

  componentDidUpdate (previousProps: Readonly<Props>): void {
    const { targetSelector: pTargetSelector, eventTypes: pEventTypes, onEvent: pOnEvent } = previousProps
    const { targetSelector, eventTypes, onEvent } = this.props
    this.removeListeners(pTargetSelector, pEventTypes, pOnEvent)
    this.addListeners(targetSelector, eventTypes, onEvent)
  }

  componentWillUnmount (): void {
    const { targetSelector, eventTypes, onEvent } = this.props
    this.removeListeners(targetSelector, eventTypes, onEvent)
  }

  addListeners (
    targetSelector: Props['targetSelector'],
    eventTypes: Props['eventTypes'],
    onEvent: Props['onEvent']) {
    const { $root } = this
    if (onEvent === undefined) return;
    if (eventTypes === undefined) return;
    if ($root === null) return;
    const actualEventTypes = Array.isArray(eventTypes)
      ? eventTypes
      : [eventTypes]
    Array.from(targetSelector === undefined
      ? [$root]
      : $root.querySelectorAll(targetSelector)
    ).forEach(elt => actualEventTypes.forEach(type => {
      elt.addEventListener(type, onEvent)
    }))
  }
  
  removeListeners (
    targetSelector: Props['targetSelector'],
    eventTypes: Props['eventTypes'],
    onEvent: Props['onEvent']) {
    const { $root } = this
    if (onEvent === undefined) return;
    if (eventTypes === undefined) return;
    if ($root === null) return;
    const actualEventTypes = Array.isArray(eventTypes)
      ? eventTypes
      : [eventTypes]
    Array.from(targetSelector === undefined
      ? [$root]
      : $root.querySelectorAll(targetSelector)
    ).forEach(elt => actualEventTypes.forEach(type => {
      elt.removeEventListener(type, onEvent)
    }))
  }

  render () {
    const { children, content, customClass } = this.props
    const wrapperClasses = ['lm-event-listener']
    if (customClass !== undefined) wrapperClasses.push(customClass)
    return <div  
      className={wrapperClasses.join(' ')}
      ref={(n) => this.$root = n}>
      {children}
      {content}
    </div>
  }
}
