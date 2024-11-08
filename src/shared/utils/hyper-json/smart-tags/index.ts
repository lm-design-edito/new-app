import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'
import { Generators } from '../generators'
import { Types } from '../types'

import { and } from './and'
import { append } from './append'
import { hyperjson } from './hyperjson'
import { string } from './string'

export namespace SmartTags {
  export const defaultRegister: Types.SmartTags.Register = new Map([
    and,
    append,
    hyperjson,
    string
  ])
}
