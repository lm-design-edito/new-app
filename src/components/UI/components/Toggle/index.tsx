import { VNode, FunctionalComponent } from 'preact'
import { useState } from 'preact/hooks'
import * as Bem from '@design-edito/tools/agnostic/css/bem';
import { randomUUID } from '@design-edito/tools/agnostic/random/uuid'

export type Props = {
  customClass?: string
  labelContent?: string | VNode
  size?: 'medium' | 'small',
  defaultChecked?: boolean,
  onToggle?: (checked: boolean) => void
}

const Toggle: FunctionalComponent<Props> = function (props: Props) {
  const [randomId] = useState(randomUUID().split('-')[0] ?? '')
  const rootClass = 'lmui-toggle'
  const bemClss = Bem.bem(rootClass).mod({
    s: props.size === 'small',
    'with-label': props.labelContent !== undefined
  })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const labelClasses = Bem.bem(rootClass).elt('label')
  const inputClasses = Bem.bem(rootClass).elt('input')
  const fakeClasses = Bem.bem(rootClass).elt('fake')
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
