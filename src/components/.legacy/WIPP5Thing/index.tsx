import { Component } from 'preact'
import p5 from 'p5'
import sketchCreator from './sketch'

interface Props {
  height?: string
  flow?: number
  aperture?: number
  frameRate?: number
  maxSimultaneousGrains?: number
  gravity?: number
  showStats?: boolean
}

export default class P5Thing extends Component<Props, {}> {
  $root: HTMLDivElement|null = null
  sketch: p5|null = null
  resizeInterval: number|null = null
  canvasSizeSetter: ((w: number, h: number) => void)|null = null
  sketchCreator: ReturnType<typeof sketchCreator>|null = null

  constructor (props: Props) {
    super(props)
    this.sketchCreator = sketchCreator()
    this.setCanvasSize = this.setCanvasSize.bind(this)
  }

  componentDidMount() {
    if (this.$root === null) return
    if (this.sketchCreator === null) return
    const {
      sketch,
      setSize,
      setFlow,
      setAperture,
      setFrameRate,
      setMaxSimultaneousGrains,
      setGravity,
      setShowStats
    } = this.sketchCreator
    setFlow(this.props.flow ?? 200)
    setAperture(this.props.aperture ?? 15)
    setFrameRate(this.props.frameRate ?? 60)
    setMaxSimultaneousGrains(this.props.maxSimultaneousGrains ?? 10000)
    setGravity(this.props.gravity ?? 1)
    setShowStats(this.props.showStats ?? false)
    this.sketch = new p5(sketch, this.$root)
    this.canvasSizeSetter = setSize
    window.addEventListener('resize', this.setCanvasSize)
    this.resizeInterval = window.setInterval(this.setCanvasSize, 100)
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.sketchCreator === null) return
    const {
      setFlow,
      setAperture,
      setFrameRate,
      setMaxSimultaneousGrains,
      setGravity,
      setShowStats
    } = this.sketchCreator
    if (prevProps.flow !== this.props.flow) setFlow(this.props.flow ?? 200)
    if (prevProps.aperture !== this.props.aperture) setAperture(this.props.aperture ?? 15)
    if (prevProps.frameRate !== this.props.frameRate) setFrameRate(this.props.frameRate ?? 60)
    if (prevProps.maxSimultaneousGrains !== this.props.maxSimultaneousGrains) setMaxSimultaneousGrains(this.props.maxSimultaneousGrains ?? 10000)
    if (prevProps.gravity !== this.props.gravity) setGravity(this.props.gravity ?? 1)
    if (prevProps.showStats !== this.props.showStats) setShowStats(this.props.showStats ?? false)
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.setCanvasSize)
    if (this.sketch !== null) { this.sketch.remove() }
    if (this.resizeInterval !== null) {
      window.clearInterval(this.resizeInterval)
      this.resizeInterval = null
    }
  }

  setCanvasSize () {
    if (this.$root === null) return
    const { width, height } = this.$root.getBoundingClientRect()
    if (this.canvasSizeSetter === null) return
    this.canvasSizeSetter(width, height)
  }

  render () {
    return <div
      ref={n => { this.$root = n }}
      style={{
        position: 'relative',
        width: '100%',
        height: this.props.height
      }} />
  }
}
