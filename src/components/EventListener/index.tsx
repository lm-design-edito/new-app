import { Component, VNode } from 'preact'

export type Props = {
  // [@Léa] => possible de remplacer par customClass ? Il y a un customWrapperClass qui traine sur un autre composant, mais c'est une erreur
  // Also, types => eventTypes, selector => targetSelector
  customWrapperClass?: string;
  types?: string[];
  selector?: string;
  content?: string | VNode,
  options?: AddEventListenerOptions,
  callback?: (e: Event) => void,
}

export default class EventListenerComponent extends Component<Props> {
  $root: HTMLDivElement|null = null

  constructor (props: Props) {
    super(props)
    this.addListeners = this.addListeners.bind(this)
    this.removeListeners = this.removeListeners.bind(this)
  }

  componentDidMount () {
    this.addListeners(this.props.selector, this.props.types, this.props.callback)
  }

  componentDidUpdate (previousProps: Readonly<Props>): void {
    this.removeListeners(previousProps.selector, previousProps.types, previousProps.callback)
    this.addListeners(this.props.selector, this.props.types, this.props.callback)
  }

  componentWillUnmount (): void {
    this.removeListeners(this.props.selector, this.props.types, this.props.callback)
  }

  addListeners (selector: Props['selector'], types: Props['types'], callback: Props['callback']) {
    if (callback === undefined
      || types === undefined
      || this.$root == undefined) return;
    if (selector !== undefined) {
      const elements = this.$root.querySelectorAll(selector);
      elements.forEach(element => {
        types.forEach(type => element.addEventListener(type, callback))
      })
      return;
    }
    Array.from(this.$root.children).forEach(child => {
      types.forEach((type) => child.addEventListener(type, callback))
    });
  }
  
  removeListeners (selector: Props['selector'], types: Props['types'], callback: Props['callback']) {
    if (callback === undefined
      || types === undefined
      || this.$root == undefined) return;
    if (selector !== undefined) {
      const elements = this.$root.querySelectorAll(selector)
      elements.forEach((element) => {
        types.forEach((type) => element.removeEventListener(type, callback))
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
    const wrapperClasses = ['lm-event-listener']
    if (customWrapperClass !== undefined) wrapperClasses.push(customWrapperClass)
    return <div  
      className={wrapperClasses.join(' ')}
      ref={(n) => this.$root = n}>
      {children}
      {content}
    </div>
  }
}
