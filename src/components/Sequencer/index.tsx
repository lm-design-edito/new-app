import { Component, JSX } from 'preact'

interface RendererArgs {
  step: number
  value: any
}

interface Props {
  tempo?: number
  play?: boolean
  length?: number
  sequence?: any[]
  renderer?: (args: RendererArgs) => any
  onFirstStep?: (args: RendererArgs) => any
  onLastStep?: (args: RendererArgs) => any
  onStepChange?: (args: RendererArgs) => any
}

interface State {
  step: number
}

class Sequencer extends Component<Props, State> {
  intervaller: number|null = null
  state: State = { step: 0 }

  /* * * * * * * * * * * * * * *
   * CONSTRUCTOR & LIFE CYCLE
   * * * * * * * * * * * * * * */
  constructor (props: Props) {
    super(props)
    this.startPlaying = this.startPlaying.bind(this)
    this.stopPlaying = this.stopPlaying.bind(this)
    this.updateTempo = this.updateTempo.bind(this)
    this.goToStep = this.goToStep.bind(this)
    this.getLoopLength = this.getLoopLength.bind(this)
    this.getCurrentValue = this.getCurrentValue.bind(this)
  }

  componentDidMount (): void {
    if (this.props.play === true) this.startPlaying()
  }

  componentDidUpdate (prevProps: Props): void {
    if (prevProps.play !== this.props.play) {
      if (this.props.play === true) this.startPlaying()
      else this.stopPlaying()
    }
    if (prevProps.tempo !== this.props.tempo) {
      this.updateTempo()
    }
  }

  /* * * * * * * * * * * * * * *
   * METHODS
   * * * * * * * * * * * * * * */
  startPlaying (): void {
    const tempo = (this.props.tempo === undefined || this.props.tempo <= 0) ? 60 : this.props.tempo
    const cappedTempo = Math.min(tempo, 60 * 1000)
    if (cappedTempo !== tempo) console.warn('Maximum tempo is 60 000 bpm')
    const timeIntervalMs = (60 * 1000) / cappedTempo
    this.intervaller = window.setInterval(() => this.goToStep('next'), timeIntervalMs)
    const stepAndValue = this.getCurrentStepAndValue()
    if (this.props.onStepChange !== undefined) this.props.onStepChange(stepAndValue)
    if (this.state.step === 0 && this.props.onFirstStep !== undefined) this.props.onFirstStep(stepAndValue)
  }

  stopPlaying (): void {
    if (this.intervaller === null) return
    window.clearInterval(this.intervaller)
    this.intervaller = null
  }

  getLoopLength (): number {
    if (this.props.length !== undefined) return this.props.length
    else if (this.props.sequence !== undefined) return this.props.sequence.length
    else return Infinity
  }

  getCurrentValue (): any {
    return this.getCurrentStepAndValue().value
  }

  getCurrentStepAndValue (): RendererArgs {
    return {
      step: this.state.step,
      value: this.props.sequence !== undefined
        ? this.props.sequence[this.state.step]
        : this.state.step
    }
  }

  goToStep (step: number|'next'|'prev'): void {
    this.setState(curr => {
      const loopLength = this.getLoopLength()
      let newStep
      if (typeof step === 'number') newStep = step % loopLength
      else if (step === 'next') newStep = (curr.step + 1) % loopLength
      else newStep = (curr.step - 1) % loopLength
      if (curr.step === newStep) return null
      return { ...curr, step: newStep % loopLength }
    }, () => {
      const loopLength = this.getLoopLength()
      const stepAndValue = this.getCurrentStepAndValue()
      if (this.props.onStepChange !== undefined) this.props.onStepChange(stepAndValue)
      if (this.state.step === 0 && this.props.onFirstStep !== undefined) this.props.onFirstStep(stepAndValue)
      if (this.state.step === loopLength - 1 && this.props.onLastStep !== undefined) this.props.onLastStep(stepAndValue)
    })
  }

  updateTempo (): void {
    if (this.intervaller === null) return
    this.stopPlaying()
    this.startPlaying()
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element {
    const { props } = this
    const stepAndValue = this.getCurrentStepAndValue()
    return <>
      {props.children}
      {props.renderer !== undefined
        ? props.renderer(stepAndValue)
        : null
      }
    </>
  }
}

export type { Props, RendererArgs }
export default Sequencer
