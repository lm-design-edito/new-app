import { Darkdouille } from '../..'
import toNumber from '../toNumber'
import clone from '../clone'

type RecordValue = { [key: string]: Darkdouille.TreeValue }

const toRecord: Darkdouille.TransformerFunctionGenerator<RecordValue> = () => {
  return (inputValue): RecordValue => {
    if (Array.isArray(inputValue)) {
      return inputValue.reduce((record: RecordValue, item, itemPos) => ({
        ...record,
        [itemPos]: clone()(item)
      }), {})
    }
    if (inputValue === null) return { '0': inputValue }
    if (inputValue instanceof NodeList) return { '0': clone()(inputValue) }
    if (typeof inputValue === 'object') {
      return clone<typeof inputValue>()(inputValue)
    }
    return { '0': inputValue }
  }
}

export default toRecord
