import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = string | Text
type Args = Array<string | Text>
type Output = string | Text

export const notrailing = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'notrailing',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Utils.Tree.TypeChecks.typeCheck(m, 'string', 'text'),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckMany(a, 'string', 'text'),
  func: (main, args) => {
    let done = false
    const strMain = Cast.toString(main)
    const strArgs = args.map(a => Cast.toString(a))
    if (strArgs.length === 0) strArgs.push('/')
    let strOutput: string = strMain
    while (!done) {
      if (strArgs.some(strArg => strMain.endsWith(strArg))) {
        strArgs.forEach(strArg => {
          // [WIP] should use @design-edito/tools/regexps/escape when available
          const escapedArg = strArg.replace(/\s/igm, '\\s')
            .replace(/\n/igm, '\\n')
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regexp = new RegExp(`${escapedArg}$`)
          strOutput = strOutput.replace(regexp, '')
        })
      } else { done = true }
    }
    if (typeof main === 'string') return Outcome.makeSuccess(strOutput)
    return Outcome.makeSuccess(Cast.toText(strOutput))    
  }
})
