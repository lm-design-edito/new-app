import { Component, createElement, render } from 'preact'
import { Options, Renderer } from '../../shared/scripts/utils/lm-page-apps'

type Props = {}
const optionsToProps = (options: Options): Props => {
  return {}
}

const App = () => createElement('div', {})

const ScrllgngnApp: Renderer = ({ options, root, silentLogger, pageConfig }) => {
  render(<App />, root)
}

export default ScrllgngnApp
