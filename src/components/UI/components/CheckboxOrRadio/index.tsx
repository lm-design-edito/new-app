import { VNode, FunctionalComponent } from 'preact'
import { useState } from 'preact/hooks'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import { randomUUID } from '@design-edito/tools/agnostic/random/uuid'

export type Props = {
  customClass?: string
  type?: 'checkbox' | 'radio'
  labelContent?: string | VNode
  disabled?: boolean
  error?: boolean
  defaultChecked?: boolean
  onChange?: (e: Event) => void
}

const Checkbox: FunctionalComponent<Props> = (props: Props) => {
  const shortId = randomUUID().split('-')[0] ?? ''
  const [randomId] = useState(shortId)
  const rootClass = props.type === 'radio' ? 'lmui-radio' : 'lmui-checkbox'
  const bemClss = Bem.bem(rootClass).mod({ error: props.error === true })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const inputClasses = Bem.bem(rootClass).elt('input')
  const fakeClasses = Bem.bem(rootClass).elt('fake')
  const type = props.type ?? 'checkbox'
  return <div className={wrapperClasses.join(' ')}>
    <input
      id={randomId}
      className={inputClasses.value}
      type={type}
      disabled={props.disabled}
      defaultChecked={props.defaultChecked}
      onChange={props.onChange} />
    <label
      for={randomId}
      className={fakeClasses.value}>
      {props.labelContent}
    </label>
  </div>
}

export default Checkbox
