import { Component, VNode } from 'preact'
import { Props as HeaderProps } from '~/components/Header'
import IntersectionObserverComponent from '~/components/IntersectionObserver'
import bem from '~/utils/bem'
import randomUUID from '~/utils/random-uuid'
import EventCatcher from '../EventCatcher'

export enum Trigger {
  ENTER_BOTTOM = 'enter-bottom',
  LEAVE_BOTTOM = 'leave-bottom',
  ENTER_TOP = 'enter-top',
  LEAVE_TOP = 'leave-top'
}

export enum Instruction {
  SET_HEADER_PROPS = 'set-header-props',
  UPDATE_HEADER_PROPS = 'update-header-props',
}

type CommonProps = {
  customClass?: string
  trigger?: Trigger
  content?: string|VNode
}

type NoInstructionProps = CommonProps & {
  instruction?: undefined
  payload?: undefined
}

type SetHeaderProps = CommonProps & {
  instruction: Instruction.SET_HEADER_PROPS
  payload?: HeaderProps
}

type UpdateHeaderProps = CommonProps & {
  instruction: Instruction.UPDATE_HEADER_PROPS
  payload?: Partial<HeaderProps>
}

export const customEventName = randomUUID()
export const customEventTarget = document.createElement('div')
export function dispatchEvent (instruction: Instruction, payload: any): void {
  customEventTarget.dispatchEvent(new CustomEvent(
    customEventName, {
      detail: {
        instruction,
        payload
      }
    }
  ))
}

export type Props = NoInstructionProps
  |SetHeaderProps
  |UpdateHeaderProps

export default class EventDispatcher extends Component<Props, {}> {
  constructor (props: Props) {
    super(props)
    this.handleIntersection = this.handleIntersection.bind(this)
  }

  handleIntersection (ioEntry: IntersectionObserverEntry) {
    const { props } = this
    const { trigger } = props
    const { isIntersecting, boundingClientRect } = ioEntry
    const { ENTER_BOTTOM, ENTER_TOP, LEAVE_TOP } = Trigger
    const expectsIntersecting = trigger === ENTER_BOTTOM || trigger === ENTER_TOP
    if (isIntersecting !== expectsIntersecting) return
    const { top } = boundingClientRect
    const { innerHeight } = window
    const distanceToTop = top
    const distanceToBottom = innerHeight - top
    const isCloserToTop = distanceToTop < distanceToBottom
    const expectsTop = trigger === ENTER_TOP || trigger === LEAVE_TOP
    if (isCloserToTop !== expectsTop) return
    const { instruction, payload } = props
    if (instruction === undefined) return;
    dispatchEvent(instruction, payload)
  }

  render () {
    const { props, handleIntersection } = this
    const { trigger, instruction, customClass, content } = props
    const actualContent = props.content ?? <div />
    const bemClass = bem('lm-event-dispatcher').mod({
      [`trigger-${trigger}`]: trigger !== undefined,
      [`instruction-${instruction}`]: instruction !== undefined
    })
    const wrapperClasses = [bemClass.value]
    if (customClass !== undefined) wrapperClasses.push(customClass)
    return <div className={wrapperClasses.join(' ')}>
      <IntersectionObserverComponent callback={handleIntersection}>
        {actualContent}
      </IntersectionObserverComponent>
    </div>
  }
}
