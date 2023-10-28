import { VNode, FunctionalComponent } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import bem from '~/utils/bem'

export type Props = {
  customClass?: string
  labelContent?: string | VNode
  size?: 'large' | 'small'
}

const Toggle: FunctionalComponent<Props> = function (props: Props) {
  const [randomId, setRandomId] = useState('')
  useEffect(() => {
    const fullId = window.crypto.randomUUID()
    const shortId = fullId.split('-')[0] ?? ''
    setRandomId(shortId)
  }, [])
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
    <input className={inputClasses.value} id={randomId} type="checkbox" />
    <label className={fakeClasses.value} for={randomId}></label>
  </div>
}

export default Toggle
