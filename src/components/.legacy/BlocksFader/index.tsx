import { Component, VNode, JSX } from 'preact'
import bem from '~/utils/bem'
// [WIP] css module here
import './styles.scss'

interface BlockDescriptor {
  id?: string
  content?: VNode|string
}

interface Props {
  className?: string
  style?: JSX.CSSProperties
  blocks?: BlockDescriptor[]
  current?: number
  animationDuration?: number
}

interface State {
  blocks: BlockDescriptor[]
  current?: number
  previous?: number
}

export default class BlocksFader extends Component<Props, State> {
  static clss = 'lm-blocks-fader'
  static fadeInDelay = 50

  constructor (props: Props) {
    super(props)
    this.fadeCurrentBlock = this.fadeCurrentBlock.bind(this)
    this.dirtySetContainerHeight = this.dirtySetContainerHeight.bind(this)
  }

  static getDerivedStateFromProps (props: Props, state: State) {
    if (props.current === state.current) return null
    const propsCurrentBlock = props.current !== undefined ? (props.blocks ?? [])[props.current] : undefined
    const stateCurrentBlock = state.current !== undefined ? state.blocks[state.current] : undefined
    const areEqual = BlocksFader.blocksAreEqual(propsCurrentBlock ?? {}, stateCurrentBlock ?? {})
    if (areEqual) return null
    return {
      current: props.current,
      previous: state.current,
      blocks: props.blocks
    }
  }

  static blocksAreEqual (block1: BlockDescriptor, block2: BlockDescriptor) {
    if (
      block1.id === block2.id
      && block1.id !== undefined
    ) return true
    
    let strContent1 = undefined
    if (block1.content === undefined) strContent1 = undefined
    else if (typeof block1.content === 'string') strContent1 = block1.content
    else return false
    
    let strContent2 = undefined
    if (block2.content === undefined) strContent2 = undefined
    else if (typeof block2.content === 'string') strContent2 = block2.content
    else return false

    return strContent1 === strContent2
  }

  clss = BlocksFader.clss
  state: State = { blocks: [] }
  $wrapper: HTMLDivElement|null = null
  $blocks: HTMLDivElement|null = null

  componentDidMount () {
    this.fadeCurrentBlock()
    this.dirtySetContainerHeight()
    window.addEventListener('resize', this.dirtySetContainerHeight)
  }
  
  componentDidUpdate () {
    this.fadeCurrentBlock()
    this.dirtySetContainerHeight()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.dirtySetContainerHeight)
  }

  fadeCurrentBlock () {
    window.setTimeout(() => {
      const { $wrapper } = this
      if ($wrapper === null) return
      const blockClass = bem(this.clss).elt('block')
      const preCurrBlockClass = `${blockClass.value}_pre-current`
      const currBlockClass = `${blockClass.value}_current`
      const $preCurrent = $wrapper.querySelector(`.${preCurrBlockClass}`)
      if ($preCurrent === null) return
      $preCurrent.classList.remove(preCurrBlockClass)
      $preCurrent.classList.add(currBlockClass)
    }, BlocksFader.fadeInDelay)
  }

  dirtySetContainerHeight () {
    if (this.$blocks === null) return
    const blockClass = bem(this.clss).elt('block')
    const preCurrBlockClass = `${blockClass.value}_pre-current`
    const currBlockClass = `${blockClass.value}_current`
    const preCurrBlock = this.$blocks.querySelector(`.${preCurrBlockClass}`)
    const currBlock = this.$blocks.querySelector(`.${currBlockClass}`)
    if (preCurrBlock === null && currBlock === null) {
      this.$blocks.style.height = '0px'
      return
    }
    const preCurrBlockHeight = preCurrBlock?.getBoundingClientRect().height
    const currBlockHeight = currBlock?.getBoundingClientRect().height
    const height = Math.max(preCurrBlockHeight ?? 0, currBlockHeight ?? 0)
    this.$blocks.style.height = `${height}px`
  }

  render () {
    const { props, state } = this

    // Logic
    const blocksClasses = bem(this.clss).elt('blocks')
    
    const blockClass = bem(this.clss).elt('block')
    const preCurrBlockClass = blockClass.mod('pre-current')
    const prevBlockClass = blockClass.mod('previous')
    const hideBlockClass = blockClass.mod('hide')

    // Assign classes and styles
    const wrapperClasses = bem(props.className).block(this.clss)
    const wrapperStyle: JSX.CSSProperties = {
      ...props.style,
      '--fade-in-delay': `${BlocksFader.fadeInDelay}ms`,
      '--animation-duration': props.animationDuration !== undefined
        ? `${props.animationDuration}ms`
        : '300ms'
    }

    return <div
      ref={n => { this.$wrapper = n }}
      style={wrapperStyle}
      className={wrapperClasses.value}>
      <div
        ref={n => { this.$blocks = n }}
        className={blocksClasses.value}>
        {state.blocks?.map((block, blockPos) => {
          const isCurrent = blockPos === state.current
          const isPrevious = blockPos === state.previous
          if (isCurrent) return <div className={preCurrBlockClass.value}>{block.content}</div>
          if (isPrevious) return <div className={prevBlockClass.value}>{block.content}</div>
          return <div className={hideBlockClass.value}>{block.content}</div>
        })}
      </div>
    </div>
  }
}
