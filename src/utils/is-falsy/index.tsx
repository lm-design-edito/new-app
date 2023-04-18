import { nullishValues } from '../is-nullish'

const falsyValues = [...nullishValues, false, '', 0, -0, BigInt(0), NaN]
const isFalsy = (val: any): boolean => falsyValues.includes(val)

export { falsyValues }
export default isFalsy
