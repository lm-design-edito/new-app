import { nullishValues } from '~/utils/is-nullish'

const falsyValues = [...nullishValues, false, '', 0, -0, NaN] as (string | number | bigint | boolean | null | undefined)[]
if (window.BigInt !== undefined) falsyValues.push(window.BigInt(0))
const isFalsy = (val: any): boolean => falsyValues.includes(val)

export { falsyValues }
export default isFalsy
