import { FunctionalComponent } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import ModuleRenderer from '../Scrllgngn/BlockRenderer/ModuleBlockRenderer/index.js'

export type Props = {
  customClass?: string
  url?: string
}

const SvelteApp: FunctionalComponent<Props> = ({ customClass, url }: Props) => {
  const bemClss = Bem.bem('lm-svelte-app')
  const wrapperClasses = [bemClss.value]
  if (customClass !== undefined) wrapperClasses.push(customClass)
  return <div className={wrapperClasses.join(' ')}>
    <ModuleRenderer
      url={url}
      context={{
        width: null,
        height: null,
        page: null,
        progression: null,
        pageProgression: null
      }}
    />
  </div>
}

export default SvelteApp
