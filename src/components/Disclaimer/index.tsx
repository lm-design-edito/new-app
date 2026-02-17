import { Component, VNode } from 'preact'
import * as Bem from '@design-edito/tools/agnostic/css/bem'
import { isNotFalsy } from "@design-edito/tools/agnostic/booleans/is-falsy"

export type Props = {
  text?: string | VNode
  buttonText?: string | VNode
  content?: string | VNode
  onDismiss?: () => void
}

export type State = {
  isDismissed: boolean
}

export default class Disclaimer extends Component<Props, State> {
  bemClss = Bem.bem('lm-disclaimer')
  $disclaimer: HTMLElement | null = null
  $button: HTMLElement | null = null
  
  state: State = {
    isDismissed: (
      this.props.text
      ?? this.props.buttonText
      ?? this.props.content
    ) !== undefined
  }

  constructor (props: Props) {
    super(props)
    this.addListeners = this.addListeners.bind(this)
    this.removeListeners = this.removeListeners.bind(this)
    this.handleDisclaimerClick = this.handleDisclaimerClick.bind(this)
  }

  componentDidMount (): void {
    this.addListeners()
  }

  componentWillUnmount (): void {
    this.removeListeners()
  }

  get $clickableElement (): HTMLElement | null {  
    return this.$button ?? this.$disclaimer
  }

  addListeners (): void {
    if (this.$clickableElement === null) return;
    this.$clickableElement.addEventListener(
      'click',
      this.handleDisclaimerClick.bind(this)
    )
  }
  
  removeListeners (): void {
    if (this.$clickableElement === null) return;
    this.$clickableElement.removeEventListener(
      'click',
      this.handleDisclaimerClick
    )
  }

  handleDisclaimerClick (): void {
    this.setState({ isDismissed: false })
    if (this.props.onDismiss) this.props.onDismiss()
  }

  render() {
    const { bemClss, props, state } = this;
    const wrapperClasses = [
      bemClss.elt('wrapper').value,
      bemClss.mod(state.isDismissed ? 'visible' : 'dismissed').value
    ]
    const textClasses = [bemClss.elt('text').value]
    const buttonClasses = [bemClss.elt('button').value]
    return <div
      className={wrapperClasses.join(' ')}
      ref={n => { this.$disclaimer = n }}>
      {isNotFalsy(props.text) && <div className={textClasses.join(' ')}>{props.text}</div>}
      {isNotFalsy(props.buttonText) && <button
        className={buttonClasses.join(' ')}
        ref={n => { this.$button = n }}>
        {props.buttonText}
      </button>}
      {props.children}
      {props.content}
    </div>
  }
}
