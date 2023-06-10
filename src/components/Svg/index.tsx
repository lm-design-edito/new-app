import { Component, JSX } from 'preact'
import bem, { BEM } from '~/utils/bem'

interface Props {
  className?: string
  style?: JSX.CSSProperties
  src?: string
  loader?: JSX.Element
  fallback?: JSX.Element
  desc?: string
}

interface State {
  loading: boolean
  error: any
  contents: string|null
  attributes: JSX.SVGAttributes<SVGElement>|null
}

class Svg extends Component<Props, State> {
  bem: BEM = bem('lm-svg')
  $root: HTMLDivElement|null = null
  state: State = {
    loading: false,
    error: null,
    contents: null,
    attributes: null
  }

  /* * * * * * * * * * * * * * *
   * CONSTRUCTOR
   * * * * * * * * * * * * * * */
  constructor (props: Props) {
    super(props)
    this.fetchSvg = this.fetchSvg.bind(this)
  }

  /* * * * * * * * * * * * * * *
   * DID MOUNT
   * * * * * * * * * * * * * * */
  componentDidMount (): void {
    this.fetchSvg(this.props.src)
  }

  componentDidUpdate(previousProps: Readonly<Props>): void {
    if (this.props.src !== previousProps.src) this.fetchSvg(this.props.src)
  }

  /* * * * * * * * * * * * * * *
   * FETCH SVG
   * * * * * * * * * * * * * * */
  async fetchSvg (src?: string): Promise<void> {
    if (src === undefined) return this.setState({
      loading: false,
      error: null,
      contents: null,
      attributes: null
    })
    this.setState({ loading: true, error: null })
    try {
      let svgData: string|null = null
      // [WIP] fix this, this is not cleau (because of content security policy from lemonde.fr)
      if (src.match(/^data:image\/svg/)) {
        const data = src.split(',')
        const [, ...imageDataChunks] = data
        const imageData = imageDataChunks.join(',')
        svgData = imageData
      } else {
        const response = await window.fetch(src)
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
        svgData = await response.text()
      }
      const fakeDiv = document.createElement('DIV')
      fakeDiv.innerHTML = svgData
      const $svg = fakeDiv.querySelector('svg')
      if ($svg === null) throw new Error('Not a svg')
      const contents = $svg.innerHTML
      const attributes = Array
        .from($svg.attributes)
        .reduce((acc, curr): JSX.SVGAttributes<SVGElement> => ({ ...acc, [curr.name]: curr.value }), {})
      this.setState({ loading: false, error: null, contents, attributes })
    } catch (err) {
      console.error(`Error while loading ${src}\n`, err)
      this.setState({ loading: false, error: err })
    }
  }

  stringToCSS(string: string): JSX.CSSProperties {
    const properties = string.trim().split(';')

    const cleanProperties: JSX.CSSProperties = {}

    properties
      .filter((property: string) => property !== '')
      .map((property: string) => {
        const key = property.split(':')[0].trim()
        const value = property.split(':')[1].trim()
        cleanProperties[key] = value
      })

    return cleanProperties
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props, state } = this

    /* Logic */
    const attributes = state.attributes ?? {}
    const contents = state.contents ?? ''
    const desc = props.desc !== undefined ? `<desc>${props.desc}</desc>` : ''

    /* Assign classes */
    const classes = bem(attributes.class ?? '')
      .block(props.className)
      .block(this.bem.value)
    
    const inlineStyle = { 
      ...(attributes.style ? this.stringToCSS(attributes.style as string) : {}),
      ...props.style
    }

    /* Display */
    // [WIP] fix dangerouslySetInner with some StrToVNode or something ?
    return <svg
      {...attributes as any}
      className={classes.value}
      style={inlineStyle}
      dangerouslySetInnerHTML={{ __html: `${desc}${contents}` }} />
  }
}

export type { Props, State }
export default Svg
