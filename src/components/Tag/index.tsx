import { Component, JSX } from 'preact'

type AnyObj = { [key: string]: any }
type IntrscElts = JSX.IntrinsicElements

export type AllowedAttributes<T extends keyof IntrscElts> = IntrscElts[T] extends AnyObj
  ? IntrscElts[T]
  : never

export type Props<T extends keyof IntrscElts> = {
  name?: T
  attributes?: AllowedAttributes<T>
}

const defaultTagName = 'div'

export default class Tag<T extends keyof IntrscElts = typeof defaultTagName> extends Component<Props<T>> {
  render () {
    const {
      name = defaultTagName,
      attributes = {} as AllowedAttributes<T>,
      children
    } = this.props
    const CustomTag = name.toLowerCase().trim()
    return <CustomTag {...attributes}>
      {children}
    </CustomTag>
  }
}
