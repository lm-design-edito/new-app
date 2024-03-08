import { Component, VNode } from 'preact'
import { Props as HeaderProps } from '~/components/Header'
import IntersectionObserverComponent from '~/components/IntersectionObserver'
import bem from '~/utils/bem'
import randomUUID from '~/utils/random-uuid'

let hasScrolled = false
const scrollHandler = () => {
  hasScrolled = true
  window.removeEventListener('scroll', scrollHandler)
}
window.addEventListener('scroll', scrollHandler)

export enum Trigger {
  ENTER_BOTTOM = 'enter-bottom',
  LEAVE_BOTTOM = 'leave-bottom',
  ENTER_TOP = 'enter-top',
  LEAVE_TOP = 'leave-top'
}

export enum Instruction {
  SET_HEADER_PROPS = 'set-header-props',
  UPDATE_HEADER_PROPS = 'update-header-props',
  SET_PAGE_CURRENT_CHAPTER = 'set-page-current-chapter'
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

  handleIntersection (details: { ioEntry: IntersectionObserverEntry | undefined }) {
    const { props } = this
    const { trigger } = props
    const { ENTER_BOTTOM, ENTER_TOP, LEAVE_TOP, LEAVE_BOTTOM } = Trigger
    if (!hasScrolled) {
      if (trigger === ENTER_BOTTOM
        || trigger === ENTER_TOP
        || trigger === LEAVE_BOTTOM
        || trigger === LEAVE_TOP) return
    }
    const { isIntersecting, boundingClientRect } = ioEntry
    const expectsIntersecting = trigger === ENTER_BOTTOM || trigger === ENTER_TOP
    if (isIntersecting !== expectsIntersecting) return;
    const { top } = boundingClientRect
    const { innerHeight } = window
    const distanceToTop = top
    const distanceToBottom = innerHeight - top
    const isCloserToTop = distanceToTop < distanceToBottom
    const expectsTop = trigger === ENTER_TOP || trigger === LEAVE_TOP
    if (isCloserToTop !== expectsTop) return;
    const { instruction, payload } = props
    if (instruction === undefined) return;
    dispatchEvent(instruction, payload)
  }

  render () {
    const { props, handleIntersection } = this
    const { trigger, instruction, customClass, content } = props
    const actualContent = content ?? <div />
    const bemClass = bem('lm-event-dispatcher').mod({
      [`trigger-${trigger}`]: trigger !== undefined,
      [`instruction-${instruction}`]: instruction !== undefined
    })
    const wrapperClasses = [bemClass.value]
    if (customClass !== undefined) wrapperClasses.push(customClass)
    return <div className={wrapperClasses.join(' ')}>
      <IntersectionObserverComponent
        onIntersection={handleIntersection}>
        {actualContent}
      </IntersectionObserverComponent>
    </div>
  }
}
