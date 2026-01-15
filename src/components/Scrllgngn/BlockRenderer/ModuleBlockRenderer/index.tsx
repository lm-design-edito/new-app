import { Component } from 'preact'
import * as Bem from '@design-edito/tools/agnostic/css/bem';
import { ModuleBlockContext, createModuleBlockContext, diffContexts } from '../../index.js'

type Props = {
  customClass?: string
  url?: string
  context?: ModuleBlockContext
  injectStylesheet?: (url: string) => void
  injectCss?: (css: string) => void
}

type ModuleData = {
  init: (context: ModuleBlockContext) => HTMLElement | Promise<HTMLElement>
  update?: (wrapper: HTMLElement, context: ModuleBlockContext, prevContext: ModuleBlockContext) => void
  destroy?: (wrapper: HTMLElement) => void
  styles?: string[] // DEPRECATED, LEGACY after v1.fuego
  css?: string[]
  styleSheets?: string[]
}

type State = {
  status: null | 'loading' | 'loaded' | 'load-error' | 'initializing' | 'initialized'
  moduleData: ModuleData | null
  moduleLoadError: Error | null
  moduleInitError: Error | null
  moduleTarget: HTMLElement | null
  context: ModuleBlockContext
  prevContext: ModuleBlockContext
  updateIsAllowed: boolean
  localStyleSheets: Set<string>
  localCssStrings: Set<string>
}

type StateSetter = ((s: State) => (State | null)) | Partial<State>

export default class ModuleRenderer extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.aSetState = this.aSetState.bind(this)
    this.injectStylesheet = this.injectStylesheet.bind(this)
    this.injectCss = this.injectCss.bind(this)
    this.loadModule = this.loadModule.bind(this)
    this.initModule = this.initModule.bind(this)
    this.updateModule = this.updateModule.bind(this)
    this.attachModuleTarget = this.attachModuleTarget.bind(this)
    this.detachModuleTarget = this.detachModuleTarget.bind(this)
    this.loadInitAttachUpdateModule = this.loadInitAttachUpdateModule.bind(this)
    this.updateAttachModule = this.updateAttachModule.bind(this)
  }

  state: State = {
    status: null,
    moduleData: null,
    moduleLoadError: null,
    moduleInitError: null,
    moduleTarget: null,
    context: createModuleBlockContext(),
    prevContext: createModuleBlockContext(),
    updateIsAllowed: false,
    localStyleSheets: new Set(),
    localCssStrings: new Set()
  }

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    const propsContext = props.context ?? createModuleBlockContext()
    const stateContext = state.context
    const diff = diffContexts(stateContext, propsContext)
    const contextHasChanged = Object.keys(diff).length > 0
    if (!contextHasChanged) return null
    return {
      ...state,
      context: propsContext ?? createModuleBlockContext(),
      prevContext: state.context,
      updateIsAllowed: true
    }
  }

  componentDidMount(): void {
    const { loadInitAttachUpdateModule } = this
    loadInitAttachUpdateModule()
  }

  updateIsPending: boolean = false
  componentDidUpdate(prevProps: Readonly<Props>): void {
    const {
      props,
      state,
      detachModuleTarget,
      loadInitAttachUpdateModule,
      updateAttachModule
    } = this
    const { status } = state
    if (prevProps.url !== props.url) {
      detachModuleTarget()
      loadInitAttachUpdateModule()
    } else {
      if (status === null) loadInitAttachUpdateModule()
      else if (status === 'loading') { this.updateIsPending = true }
      else if (status === 'loaded') { this.updateIsPending = true }
      else if (status === 'load-error') return
      else if (status === 'initializing') { this.updateIsPending = true }
      else updateAttachModule()
    }
  }

  componentWillUnmount(): void {
    const { moduleTarget, moduleData } = this.state
    if (moduleTarget === null) return
    const destroy = moduleData?.destroy
    if (destroy === undefined) return
    destroy(moduleTarget)
  }

  async aSetState (stateSetter: StateSetter): Promise<StateSetter> {
    return new Promise(resolve => {
      const resolver = () => resolve(stateSetter)
      return this.setState(stateSetter, resolver)
    })
  }

  injectStylesheet (url: string): void {
    const { injectStylesheet } = this.props
    if (injectStylesheet !== undefined) return injectStylesheet(url)
    this.setState(curr => ({
      ...curr,
      localStyleSheets: new Set(
        ...curr.localStyleSheets,
        url
      )
    }))
  }

  injectCss (css: string): void {
    const { injectCss } = this.props
    if (injectCss !== undefined) return injectCss(css)
    this.setState(curr => ({
      ...curr,
      localCssStrings: new Set(
        ...curr.localCssStrings,
        css
      )
    }))
    // DEFAULT HERE
  
  }

  async loadModule () {
    const { props, aSetState, injectStylesheet, injectCss } = this
    const { url } = props
    if (url === undefined) return await aSetState({
      status: null,
      moduleData: null,
      moduleLoadError: null
    });
    await aSetState({
      status: 'loading',
      moduleData: null,
      moduleLoadError: null
    })
    try {
      const importedData = (await import(url)) as unknown
      const importedIsNotObject = typeof importedData !== 'object'
      const importedIsNullish = importedData === null || importedData === undefined
      if (importedIsNotObject || importedIsNullish) throw new Error('Imported module is not an object')
      const importedDataAsAny = importedData as any
      const importedHasInitFunc = 'init' in importedData && typeof importedDataAsAny.init === 'function'
      const importedHasStyles = 'styles' in importedData
        && Array.isArray(importedDataAsAny.styles)
        && (importedDataAsAny?.styles as unknown[] | undefined)?.every(url => typeof url === 'string')
      const importedHasCss = 'css' in importedData
        && Array.isArray(importedDataAsAny.css)
        && (importedDataAsAny?.css as unknown[] | undefined)?.every(url => typeof url === 'string')
      const importedHasStyleSheets = 'styleSheets' in importedData
        && Array.isArray(importedDataAsAny.styleSheets)
        && (importedDataAsAny?.styleSheets as unknown[] | undefined)?.every(url => typeof url === 'string')
      if (!importedHasInitFunc) throw new Error('Imported module must export a function named init')
      const moduleData = importedData as ModuleData
      if (injectStylesheet !== undefined) {
        if (importedHasStyleSheets) {
          const styleSheets = (importedDataAsAny.styleSheets as string[])
          styleSheets.forEach(url => injectStylesheet(url))
        }
        if (importedHasStyles) {
          console.warn('DEPRECATED: styles is deprecated, use styleSheets instead (remote style sheets), or css for direct css injection')
          const styles = (importedDataAsAny.styles as string[])
          styles.forEach(url => injectStylesheet(url))
        }
      }
      if (injectCss !== undefined && importedHasCss) {
        const css = (importedDataAsAny.css as string[])
        css.forEach(css => injectCss(css))
      }
      await aSetState({
        status: 'loaded',
        moduleLoadError: null,
        moduleData
      })
    } catch (err) {
      console.error(`Loading error - ${url}`)
      console.error(err)
      let moduleLoadError: Error = new Error('Unknown error')
      if (err instanceof Error) moduleLoadError = err
      else if (typeof err === 'string') moduleLoadError = new Error(err)
      await aSetState({
        status: 'load-error',
        moduleData: null,
        moduleLoadError
      })
    }
  }

  async initModule () {
    const { props, state, aSetState } = this
    const { url } = props
    const { context, status, moduleData } = state
    if (status === null || status === 'loading') return;
    if (moduleData === null) return;
    await aSetState({ status: 'initializing' })
    try {
      const moduleTarget = await moduleData.init(context ?? createModuleBlockContext()) as unknown
      const targetIsHTMLElement = moduleTarget instanceof HTMLElement
      if (!targetIsHTMLElement) throw new Error('Module\'s init exported function should return a HTMLElement object')
      return await aSetState({
        status: 'initialized',
        moduleInitError: null,
        moduleTarget,
        updateIsAllowed: false
      })
    } catch (err) {
      console.error(`Init error - ${url}`)
      console.error(err)
      let moduleInitError: Error = new Error('Unknown error')
      if (err instanceof Error) moduleInitError = err
      else if (typeof err === 'string') moduleInitError = new Error(err)
      return await aSetState({
        status: 'loaded',
        moduleInitError,
        moduleTarget: null
      })
    }
  }

  updateModule () {
    const { state } = this
    const { status, updateIsAllowed, context, prevContext } = state
    if (status !== 'initialized') return;
    if (!updateIsAllowed) return;
    const { moduleData, moduleTarget } = state
    if (moduleData === null
      || moduleTarget === null
      || moduleData.update === undefined) return;
    moduleData.update(
      moduleTarget,
      context ?? createModuleBlockContext({}),
      prevContext ?? createModuleBlockContext({})
    )
    this.updateIsPending = false
    this.setState(curr => {
      if (!curr.updateIsAllowed) return null
      return {
        ...curr,
        updateIsAllowed: false
      }
    })
  }

  attachModuleTarget () {
    const { state, $moduleWrapper } = this
    const { moduleTarget } = state
    if ($moduleWrapper === null) return;
    if (moduleTarget === null) return;
    const wrapperChildren = [...$moduleWrapper.children]
    const targetIsInWrapper = wrapperChildren.includes(moduleTarget)
    if (!targetIsInWrapper) $moduleWrapper.replaceChildren(moduleTarget)
  }

  detachModuleTarget () {
    const { $moduleWrapper } = this
    if ($moduleWrapper === null) return;
    $moduleWrapper.replaceChildren()
  }

  async loadInitAttachUpdateModule () {
    const {
      loadModule,
      initModule,
      updateModule,
      attachModuleTarget,
      updateIsPending
    } = this
    await loadModule()
    await initModule()
    attachModuleTarget()
    if (updateIsPending) updateModule()
  }

  async updateAttachModule () {
    const { updateModule, attachModuleTarget } = this
    updateModule()
    attachModuleTarget()
  }

  $moduleWrapper: HTMLDivElement | null = null

  render () {
    const { props, state } = this
    const { status } = state
    if (status !== 'initialized') return null
    const bemClss = Bem.bem('lm-module-renderer').mod({ [status]: true })
    const deprecatedBemClss = Bem.bem('lm-module-block-renderer')
    const classNames: string[] = [
      bemClss.val,
      deprecatedBemClss.val,
      props.customClass
    ].filter((e): e is string => e !== undefined && e !== '')
    const className = classNames.join(' ')
    return <>
        { /* [WIP] Maybe some security needed here ? */ }
        {[...state.localStyleSheets].map(url => <link rel='stylesheet' href={url} />)}
        {[...state.localCssStrings].map(cssString => <style>{cssString}</style>)}
        <div className={className} ref={n => { this.$moduleWrapper = n }} />
    </>
  }
}
