import { render } from 'preact'
import { Options, Renderer } from '~/shared/page-apps/index.BAK'
import EventDispatcher, { Props, Instruction, Trigger } from '~/components/EventDispatcher'
import { optionsToProps as optionsToHeaderProps } from 'apps.BAK/header'
import { toString, toVNode } from '~/utils/cast'

/* * * * * * * * * * * * * * * * * * *
 * RENDERER
 * * * * * * * * * * * * * * * * * * */
export default function EventDispatcherApp({
  options,
  root,
  silentLogger
}: Parameters<Renderer>[0]): ReturnType<Renderer> {
  const props = optionsToProps(options)
  const app = <EventDispatcher {...props} />
  render(app, root)
  silentLogger?.log(
    'event-dispatcher-app/rendered',
    'root:', root,
    '\noptions:', options,
    '\nprops:', props
  )
}

/* * * * * * * * * * * * * * * * * * *
 * OPTIONS TO PROPS
 * * * * * * * * * * * * * * * * * * */
export function optionsToProps(options: Options): Props {
  const {
    trigger,
    content,
    instruction,
    payload
  } = options
  if (instruction === undefined) return {}
  
  // Extracting trigger
  let castedTrigger: Trigger|undefined = undefined
  if (trigger !== undefined) {
    const strTrigger = toString(trigger)
    const isTrigger = Object
      .values(Trigger)
      .includes(strTrigger as Trigger)
    if (isTrigger) { castedTrigger = strTrigger as Trigger }
  }

  // Extracting content
  const castedContent = content !== undefined
    ? toVNode(content)
    : undefined

  // Casting instruction
  const strInstruction = toString(instruction)
  const isInstruction = Object
    .values(Instruction)
    .includes(strInstruction as Instruction)
  if (!isInstruction) return {}
  const castedInstruction = strInstruction as Instruction  
  const {
    SET_HEADER_PROPS,
    UPDATE_HEADER_PROPS
  } = Instruction

  // Retreive the rest of the props depending on instruction type
  if (castedInstruction === SET_HEADER_PROPS) {
    const props: Props = {
      trigger: castedTrigger,
      instruction: SET_HEADER_PROPS,
      content: castedContent
    }
    try {
      Object.keys(payload as any)
      props.payload = optionsToHeaderProps(payload as Options)
    }
    catch (err) {}
    return props
  } else if (castedInstruction === UPDATE_HEADER_PROPS) {
    const props: Props = {
      trigger: castedTrigger,
      instruction: UPDATE_HEADER_PROPS,
      content: castedContent
    }
    try {
      Object.keys(payload as any)
      props.payload = optionsToHeaderProps(payload as Options)
    }
    catch (err) {}
    return props
  } else return {}
}

