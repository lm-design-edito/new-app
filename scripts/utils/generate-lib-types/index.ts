import { spawn } from 'node:child_process'
import * as config from '../../config.js'

export default function generateTypeDefinitions (): Promise<true> {
  return new Promise((resolve, reject) => {
    const tscProcess = spawn('tsc', ['--project', config.SRC_TSCONFIG_LIB], { stdio: 'inherit' })
    tscProcess.on('close', code => {
      if (code === 0) resolve(true)
      else reject(new Error('Failed to generate type definitions'));
    })
  })
}
