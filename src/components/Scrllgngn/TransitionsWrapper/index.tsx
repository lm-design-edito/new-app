import { Component, ComponentChildren } from 'preact'
import { TransitionDuration, TransitionDescriptor } from '../'
import styles from './styles.module.scss'

type UnifiedTransition = {
  className: string
  duration?: string
}

type Props = {
  isActive?: boolean
  transitions?: TransitionDescriptor[]
  mobileTransitions?: TransitionDescriptor[]
}

export default class TransitionsWrapper extends Component<Props> {
  constructor (props: Props) {
    super(props)
    this.stringifyDuration = this.stringifyDuration.bind(this)
    this.unifyTransitions = this.unifyTransitions.bind(this)
  }

  stringifyDuration (duration?: TransitionDuration) {
    if (duration === undefined) return '400ms'
    if (typeof duration === 'number') return `${duration}ms`
    const isValidRegex = /([0-9]+(\.[0-9]+)?|\.[0-9]+)[a-zA-Z]*/
    const hasNoUnitRegex = /^[0-9\.]+$/
    if (!isValidRegex.test(duration)) return '400ms'
    if (hasNoUnitRegex) return `${duration}ms`
    return duration
  }

  unifyTransitions (
    _transitions?: TransitionDescriptor[],
    _mobileTransitions?: TransitionDescriptor[]): UnifiedTransition[] {
    const unifiedTransitionsData: Array<{ className: string, duration?: string }> = []
    const hasTransitions = _transitions !== undefined
    const hasMobileTransitions = _mobileTransitions !== undefined
    if (hasTransitions) {
      const transitions = _transitions as TransitionDescriptor[]
      transitions.forEach(([name, _duration]) => unifiedTransitionsData.push({
        className: styles[`t-${name}`],
        duration: this.stringifyDuration(_duration)
      }))
    }
    if (hasTransitions && !hasMobileTransitions) {
      const transitions = _transitions as TransitionDescriptor[]
      transitions.forEach(([name, _duration]) => unifiedTransitionsData.push({
        className: styles[`t-mob-${name}`],
        duration: this.stringifyDuration(_duration)
      }))
    }
    if (hasMobileTransitions) {
      const mobileTransitions = _mobileTransitions as TransitionDescriptor[]
      mobileTransitions.forEach(([name, _duration]) => unifiedTransitionsData.push({
        className: styles[`t-mob-${name}`],
        duration: this.stringifyDuration(_duration)
      }))
    }
    if (unifiedTransitionsData.length === 0) unifiedTransitionsData.push(
      { className: styles['t-default'] },
      { className: styles['t-mob-default'] },
    )
    return unifiedTransitionsData
  }

  wrapChildren (
    children: ComponentChildren,
    transitions?: TransitionDescriptor[],
    mobileTransitions?: TransitionDescriptor[]) {
    const unifiedTransitionsData = this.unifyTransitions(
      transitions,
      mobileTransitions
    )
    return unifiedTransitionsData.reduce((acc, curr) => {
      const { className, duration } = curr
      const style = duration !== undefined
        ? { '--duration': duration }
        : undefined
      return <div
        className={`${className} ${styles['t-wrapper']}`}
        style={style}>
        {acc}
      </div>
    }, children)
  }
  
  render () {
    const {
      isActive,
      transitions,
      mobileTransitions,
      children,
    } = this.props
    
    const transitionsWrappers = this.wrapChildren(
      children,
      transitions,
      mobileTransitions
    )

    const wrapperClasses = [styles['wrapper']]
    if (isActive) wrapperClasses.push(styles['wrapper_active'])
    else wrapperClasses.push(styles['wrapper_inactive'])
    
    return <div className={wrapperClasses.join(' ')}>
      {transitionsWrappers}
    </div>
  }
}
