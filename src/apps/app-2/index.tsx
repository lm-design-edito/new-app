import * as preact from 'preact.v10.13.2'
import util2 from '../../utils/util-2'

console.log('I imported util 2', util2)

export default class MyApp extends preact.Component {
  render () {
    return preact.createElement('div', {}, 'I am app 2')
  }
}
