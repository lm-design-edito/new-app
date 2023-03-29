import fse, { ensureDirSync } from 'fs-extra'
import { Plugin } from 'rollup'
import { createFilter } from '@rollup/pluginutils'

type MyPluginOptions = {}

export default function myPlugin (options: MyPluginOptions = {}): Plugin {
  return {
    name: 'myPlugin',
    transform: (code, id) => {
      console.log('TRANSFORM')
      console.log(id, code)
      return { code: code, map: null }
    },
    writeBundle: (context, options, ...rest) => {
      console.log('WRITE')
      console.log(context, options, ...rest)
      return
    }
  }
}
