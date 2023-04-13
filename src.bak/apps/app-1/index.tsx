import * as preact from 'preact.v10.13.2'
import util1 from '../../utils/util-1'

console.log('I imported util 1', util1)
console.log('app 1')
// [WIP] import json, svg, jpg and scss module

// [WIP] do JSX
export default class MyApp extends preact.Component {
  render () {
    return preact.createElement('div', {}, 'I am some app.')
  }
}
