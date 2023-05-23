import { Component, JSX } from 'preact'

export type Props = {
  name: keyof JSX.IntrinsicElements,
  [attribute: string]: any
}

export default class Tag extends Component<Props> {
  render () {
    const {
      name,
      ..._attributes
    } = this.props
    try {
      const CustomTag = name
      const attributes = _attributes as JSX.IntrinsicAttributes
      return <CustomTag {...attributes} />
    } catch (err) {
      return <></>
    }
  }
}
