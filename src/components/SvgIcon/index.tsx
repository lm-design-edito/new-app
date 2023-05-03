import { Component, JSX } from 'preact'
import Svg from '~/components/Svg'

import icons from './assets'

interface Props {
  name: string
}

class SvgIcon extends Component<Props, {}> {

  /* * * * * * * * * * * * * * *
   * RENDER
   * * * * * * * * * * * * * * */
  render(): JSX.Element {
    const { props } = this

    const iconUrl = icons[props.name]

    return <Svg src={iconUrl} />
  }
}

export default SvgIcon
