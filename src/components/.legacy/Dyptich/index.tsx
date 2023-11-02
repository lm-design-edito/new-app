import { Component, JSX, VNode } from 'preact'
import BlocksFader from '~/components/BlocksFader'
import MediaCaption from '~/components/MediaCaption'
import Sequencer from '~/components/Sequencer'
import bem from '~/utils/bem'
import './styles.scss'

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
type Props = {
  className?: string
  style?: JSX.CSSProperties
  leftImagesUrls?: string|string[]
  rightImagesUrls?: string|string[]
  mobileBehavior?: 'keep'|'stack'|'merge'
  mergeOrder?: 'alternate'|'follow'
  tempo?: number
  mediaDescription?: string|VNode
  mediaCredits?: string|VNode
}

type State = {
  rightPanelIsPlaying: boolean
}

export default class Dyptich extends Component<Props, State> {
  static defaultTempo: WithRequired<Props, 'tempo'>['tempo'] = 10
  static defaultMobileBehavior: WithRequired<Props, 'mobileBehavior'>['mobileBehavior'] = 'keep'
  static defaultMergeOrder: WithRequired<Props, 'mergeOrder'>['mergeOrder'] = 'alternate'
  
  static clss = 'lm-dyptich'
  clss = Dyptich.clss

  activateRightPanelTimeout: number|null = null

  state: State = {
    rightPanelIsPlaying: false
  }

  componentDidMount () {
    const tempo = this.props.tempo ?? Dyptich.defaultTempo
    const delay = (1000 * 60) / tempo
    this.activateRightPanelTimeout = window.setTimeout(() => {
      this.setState({ rightPanelIsPlaying: true })
    }, delay)
  }

  componentWillUnmount(): void {
    if (this.activateRightPanelTimeout !== null) {
      window.clearTimeout(this.activateRightPanelTimeout)
    }
  }

  render () {
    const { props, state } = this
    const {
      leftImagesUrls,
      rightImagesUrls,
      mobileBehavior = Dyptich.defaultMobileBehavior,
      mergeOrder = Dyptich.defaultMergeOrder,
      tempo = Dyptich.defaultTempo
    } = props
    const leftUrls = leftImagesUrls === undefined ? [] : (Array.isArray(leftImagesUrls) ? leftImagesUrls : [leftImagesUrls])
    const rightUrls = rightImagesUrls === undefined ? [] : (Array.isArray(rightImagesUrls) ? rightImagesUrls : [rightImagesUrls])
    const mergedUrls: string[] = []
    if (mergeOrder === 'alternate') {
      const longestListLength = Math.max(leftUrls.length, rightUrls.length)
      new Array(longestListLength).fill(null).map((e, i) => {
        const leftUrl = leftUrls[i]
        const rightUrl = rightUrls[i]
        if (leftUrl !== undefined) mergedUrls.push(leftUrl)
        if (rightUrl !== undefined) mergedUrls.push(rightUrl)
      })
    } else mergedUrls.push(...leftUrls, ...rightUrls)

    const rootClass = bem(this.clss)
    const wrapperClasses = bem(props.className)
      .block(this.clss)
      .modifier(`mobile-behavior-${mobileBehavior}`)
    const wrapperStyle: JSX.CSSProperties = { ...props.style }
    const imagesClass = rootClass.elt('image')

    const hasCaption = (props.mediaDescription ?? props.mediaCredits) !== undefined

    return <div
      className={wrapperClasses.value}
      style={wrapperStyle}>
      <div className={rootClass.elt('separated-slot').value}>
        {/* Left slot */}
        <div className={rootClass.elt('left-slot').value}>
          <Sequencer
            play
            tempo={tempo / 2}
            sequence={leftUrls}
            renderer={({ step }) => {
              const blocks = leftUrls.map(url => ({
                id: url,
                content: <img className={imagesClass.value} src={url} />
              }))
              return <BlocksFader
                blocks={blocks}
                current={step} />
            }} />
        </div>
        {/* Right slot */}
        <div className={rootClass.elt('right-slot').value}>
          <Sequencer
            play={state.rightPanelIsPlaying}
            tempo={tempo / 2}
            sequence={rightUrls}
            renderer={({ step }) => {
              const blocks = rightUrls.map(url => ({
                id: url,
                content: <img className={imagesClass.value} src={url} />
              }))
              return <BlocksFader
                blocks={blocks}
                current={step} />
            }} />
        </div>
      </div>
      {/* Merged slot */}
      {props.mobileBehavior === 'merge' && <div className={rootClass.elt('merged-slot').value}>
        <Sequencer
          play
          tempo={tempo}
          sequence={mergedUrls}
          renderer={({ step }) => {
            const blocks = mergedUrls.map(url => ({
              id: url,
              content: <img className={imagesClass.value} src={url} />
            }))
            return <BlocksFader
              blocks={blocks}
              current={step} />
          }} />
      </div>}
      <div className={rootClass.elt('description-slot').value}>
        {hasCaption && <MediaCaption
          description={props.mediaDescription}
          credits={props.mediaCredits} />}
      </div>
    </div>
  }
}
