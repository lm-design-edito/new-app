import { Types } from '../types'
import { and } from './and'
import { append } from './append'
import { classList } from './classList'
import { equals } from './equals'
import { functionFunc } from './function'
import { globalObj } from './globalObj'
import { join } from './join'
import { length } from './length'
import { or } from './or'
import { print } from './print'
import { property } from './property'
import { push } from './push'
import { querySelector } from './querySelector'
import { replace } from './replace'
import { split } from './split'
import { toArray } from './toArray'
import { toBoolean } from './toBoolean'
import { toElement } from './toElement'
import { toNodeList } from './toNodeList'
import { toNull } from './toNull'
import { toNumber } from './toNumber'
import { toRecord } from './toRecord'
import { toRef } from './toRef'
import { toString } from './toString'
import { toText } from './toText'
import { transformSelected } from './transformSelected'
import { trim } from './trim'

export namespace Transformers {
  export const defaultGeneratorsMap = new Map<string, Types.TransformerGenerator>([
    ['and'.toLowerCase(), and],
    ['append'.toLowerCase(), append],
    ['classList'.toLowerCase(), classList],
    ['equals'.toLowerCase(), equals],
    ['function'.toLowerCase(), functionFunc],
    ['globalObj'.toLowerCase(), globalObj],
    ['join'.toLowerCase(), join],
    ['length'.toLowerCase(), length],
    ['or'.toLowerCase(), or],
    ['print'.toLowerCase(), print],
    ['property'.toLowerCase(), property],
    ['push'.toLowerCase(), push],
    ['querySelector'.toLowerCase(), querySelector],
    ['replace'.toLowerCase(), replace],
    ['split'.toLowerCase(), split],
    ['toArray'.toLowerCase(), toArray],
    ['toBoolean'.toLowerCase(), toBoolean],
    ['toElement'.toLowerCase(), toElement],
    ['toNodeList'.toLowerCase(), toNodeList],
    ['toNull'.toLowerCase(), toNull],
    ['toNumber'.toLowerCase(), toNumber],
    ['toRecord'.toLowerCase(), toRecord],
    ['toRef'.toLowerCase(), toRef],
    ['toString'.toLowerCase(), toString],
    ['toText'.toLowerCase(), toText],
    ['transformSelected'.toLowerCase(), transformSelected],
    ['trim'.toLowerCase(), trim]
  ])
}
