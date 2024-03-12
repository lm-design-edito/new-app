import { Component, JSX } from 'preact'

interface Props {
  pointing: string
}

export default class Arrow extends Component<Props> {
  render(props: Props): JSX.Element {
    const rotate = props.pointing === 'left' ? 180 : 0
    const inlineStyle = `transform: rotate(${rotate}deg);`
    return <svg 
      style={inlineStyle}
      width="16"
      height="12"
      viewBox="0 0 12 9"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0 3.762V5.238H9.44L7.056 7.938L8 9L12 4.5L8 0L7.056 1.062L9.44 3.762H0Z" />
    </svg>
  }
}
