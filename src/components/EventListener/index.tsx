import { Component, VNode } from 'preact'

export type Props = {
  customWrapperClass?: string;
  types?: string[];
  selector?: string;
  content?: string | VNode,
  options?: AddEventListenerOptions,
  callback?: (e: Event) => void,
}

export default class EventListenerComponent extends Component<Props> {
  $root: HTMLDivElement|null = null

  componentDidMount () {
    this.addListeners(this.props.selector, this.props.types, this.props.callback)
  }

  componentDidUpdate(previousProps: Readonly<Props>): void {
    this.removeListeners(previousProps.selector, previousProps.types, previousProps.callback)
    this.addListeners(this.props.selector, this.props.types, this.props.callback)
  }

  componentWillUnmount(): void {
    this.removeListeners(this.props.selector, this.props.types, this.props.callback)
  }

  addListeners(selector: Props['selector'], types: Props['types'], callback: Props['callback']) {
    if (callback === undefined || types === undefined || this.$root == undefined) {
      return
    }
    if (selector !== undefined) {
      const elements = this.$root.querySelectorAll(selector);
      elements.forEach((element) => {
        types.forEach((type) => {
          element.addEventListener(type, callback)
        })
      })
      return
    }
    Array.from(this.$root.children).forEach((child) => {
      types.forEach((type) => {
        child.addEventListener(type, callback)
      })
    });
  }
  
  removeListeners(selector: Props['selector'], types: Props['types'], callback: Props['callback']) {
    if (callback === undefined || types === undefined || this.$root == undefined) {
      return
    }
    if (selector !== undefined) {
      const elements = this.$root.querySelectorAll(selector)
      elements.forEach((element) => {
        types.forEach((type) => {
          element.removeEventListener(type, callback)
        })
      })
      return
    }
    Array.from(this.$root.children).forEach((child) => {
      types.forEach((type) => {
        child.removeEventListener(type, callback)
      })
    });
  }

  render () {
    const { children, content, customWrapperClass } = this.props
    const eventClassName = 'lm-event-listener' + (customWrapperClass !== undefined ? ' ' + customWrapperClass : '')
    return (
      <div className={eventClassName} ref={(n) => this.$root = n}>
        {children}
        {content}
      </div>
    )
  }
}
