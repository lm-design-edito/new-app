import { VNode, FunctionalComponent } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
  type?: 'checkbox' | 'radio'
  labelContent?: string | VNode
  disabled?: boolean
  error?: boolean
}

const Checkbox: FunctionalComponent<Props> = (props: Props) => {
  const [randomId, setRandomId] = useState('')
  useEffect(() => {
    const fullId = window.crypto.randomUUID()
    const shortId = fullId.split('-')[0] ?? ''
    setRandomId(shortId)
  }, [])
  const rootClass = props.type === 'radio' ? 'lmui-radio' : 'lmui-checkbox'
  const bemClss = bem(rootClass).mod({ error: props.error === true })
  const wrapperClasses = [bemClss.value]
  if (props.customClass !== undefined) wrapperClasses.push(props.customClass)
  const inputClasses = bem(rootClass).elt('input')
  const fakeClasses = bem(rootClass).elt('fake')
  const type = props.type ?? 'checkbox'
  return <div class={wrapperClasses.join(' ')}>
    <input id={randomId} class={inputClasses.value} type={type} disabled={props.disabled} />
    <label for={randomId} class={fakeClasses.value}>{props.labelContent}</label>
  </div>
}

export default Checkbox
