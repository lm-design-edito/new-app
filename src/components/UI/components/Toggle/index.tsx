import { VNode, FunctionalComponent } from 'preact'
import { useState } from 'preact/hooks'
import bem from '~/utils/bem'
import randomUUID from '~/utils/random-uuid'

export type Props = {
  customClass?: string
  labelContent?: string | VNode
  size?: 'medium' | 'small',
  onToggle?: (checked: boolean) => void
  defaultChecked?: boolean
}

const Toggle: FunctionalComponent<Props> = function (props: Props) {
  const [randomId] = useState(randomUUID().split('-')[0] ?? '')
  const rootClass = 'lmui-toggle'
  const bemClss = bem(rootClass).mod({
    s: props.size === 'small',
    'with-label': props.labelContent !== undefined
  })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const labelClasses = bem(rootClass).elt('label')
  const inputClasses = bem(rootClass).elt('input')
  const fakeClasses = bem(rootClass).elt('fake')
  return <div className={wrapperClasses.join(' ')}>
    <label className={labelClasses.value}>{props.labelContent}</label>
    <input
      className={inputClasses.value}
      id={randomId}
      type='checkbox'
      defaultChecked={props.defaultChecked}
      onChange={e => {
        if (props.onToggle === undefined) return;
        const input = e.target as HTMLInputElement
        const { checked } = input
        props.onToggle(checked)
      }} />
    <label className={fakeClasses.value} for={randomId}></label>
  </div>
}

export default Toggle
