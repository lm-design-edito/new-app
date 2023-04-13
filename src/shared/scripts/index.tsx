import { render } from 'preact'
import sharedUtil from './shared-util'
import App1 from '../../apps/app-1'

sharedUtil()

async function initPage () {
  console.log(App1)
  render(<App1 />, document.querySelector('body'))
}

initPage()
