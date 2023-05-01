import { Component, JSX } from 'preact'
import { SheetBase, tsvToSheetBase, fetchTsv } from '~/utils/sheet-base'

interface Props {
  preload?: string
  url?: string|null
  render?: (data: SheetBase) => JSX.Element
}

interface State {
  loading: boolean
  error: Error|null
  data: SheetBase|undefined
}

class Spreadsheet extends Component<Props, State> {
  state: State = {
    loading: false,
    error: null,
    data: undefined
  }

  constructor (props: Props) {
    super(props)
    this.fetchData = this.fetchData.bind(this)
  }

  async componentDidMount (): Promise<any> {
    await this.fetchData()
  }

  componentDidUpdate (): void {
    // [WIP] Check if data or preload has changed
  }

  async fetchData (): Promise<any> {
    const { preload, url } = this.props
    const hasPreload = preload !== undefined
    const hasUrl = url !== undefined && url !== null
    if (!hasPreload && !hasUrl) {
      this.setState({ loading: false, error: null, data: undefined })
    } else if (hasPreload && !hasUrl) {
      const preloadedBase = tsvToSheetBase(preload)
      this.setState({ loading: false, error: null, data: preloadedBase })
    } else if (hasUrl) {
      const preloadedBase = hasPreload ? tsvToSheetBase(preload) : undefined
      this.setState({ loading: true, error: null, data: preloadedBase })
      try {
        const fetched = await fetchTsv(url)
        const fetchedBase = tsvToSheetBase(fetched)
        this.setState({ loading: false, error: null, data: fetchedBase })
      } catch (err: any) {
        this.setState({ loading: false, error: err, data: undefined })
      }
    }
  }

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render (): JSX.Element|null {
    const { props, state } = this
    if (props.render === undefined) return null
    else if (state.error !== null) {
      const error = state.error
      return (
        <div>
          <p>Something went wrong</p>
          <p>{error.message}</p>
        </div>
      )
    } else if (state.data === undefined
      && state.loading !== null) {
      return <div>Loading...</div>
    } else if (state.data === undefined) {
      return <div>The spreadsheet contains no data.</div>
    } else {
      return props.render(state.data)
    }
  }
}

export type { Props, State }
export default Spreadsheet
