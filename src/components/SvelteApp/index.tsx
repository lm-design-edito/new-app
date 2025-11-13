import { FunctionalComponent, VNode } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import styles from './styles.module.scss'

export type Props = {
  customClass?: string
  content?: string | VNode
  selector?: string
  fileUrl?: string
  // Handlers
  
}

export type State = {
  rootElt: HTMLElement | null
}

const SvelteApp: FunctionalComponent<Props> = ({
  customClass,
  content,
  selector
}: Props) => {
  const bemClss = Bem.bem('lm-svelte-app')
  const wrapperClasses = [bemClss.value, styles['wrapper']]
  if (customClass !== undefined) wrapperClasses.push(customClass)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {}, [selector])

  return <div
    ref={rootRef}
    className={wrapperClasses.join(' ')}>
    {content}
  </div>
}

export default SvelteApp

// export default class SvelteApp extends Component<Props, State> {
//   bemClss = Bem.bem('lm-svelte-app')

//   /* * * * * * * * * * * * * * * * * * *
//    * CONSTRUCTOR
//    * * * * * * * * * * * * * * * * * * */
//   constructor (props: Props) {
//     super(props)
//   }

//   /* * * * * * * * * * * * * * * * * * *
//    * METHODS
//    * * * * * * * * * * * * * * * * * * */

//   /* * * * * * * * * * * * * * * * * * *
//    * RENDER
//    * * * * * * * * * * * * * * * * * * */
//   render (): JSX.Element {
//     const { bemClss } = this
//     const wrapperBemClass = bemClss.mod({

//     }).value
//     const wrapperClasses = [wrapperBemClass, styles['wrapper']]
//     return <div className={wrapperClasses.join(' ')}>
//       {`Svelte App :)`}
//     </div>
//   }
// }
