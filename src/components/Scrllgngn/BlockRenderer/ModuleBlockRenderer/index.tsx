import { Component } from 'preact'
import { BlockContext, createBlockContext, diffContexts } from '../../'

type Props = {
  url?: string
  cssLoader?: (url: string) => Promise<void>
  context?: BlockContext
}

type ModuleData = {
  init: (props: BlockContext) => HTMLElement|Promise<HTMLElement>
  update: (wrapper: HTMLElement, context: BlockContext, prevContext: BlockContext) => void
  styles?: string[]
}

type State = {
  status: null|'loading'|'loaded'|'load-error'|'initializing'|'initialized'
  moduleData: ModuleData|null
  moduleLoadError: Error|null
  moduleInitError: Error|null
  moduleTarget: HTMLElement|null
  context: BlockContext
  prevContext: BlockContext
  updateIsAllowed: boolean
}

type StateSetter = ((s: State) => (State|null))|Partial<State>

export default class ModuleBlockRenderer extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.aSetState = this.aSetState.bind(this)
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
    context: createBlockContext(),
    prevContext: createBlockContext(),
    updateIsAllowed: false
  }

  static getDerivedStateFromProps(props: Props, state: State): State|null {
    const propsContext = props.context ?? createBlockContext()
    const stateContext = state.context
    const diff = diffContexts(stateContext, propsContext)
    const contextHasChanged = Object.keys(diff).length > 0
    if (!contextHasChanged) return null
    return {
      ...state,
      context: propsContext ?? createBlockContext(),
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

  async aSetState (stateSetter: StateSetter): Promise<StateSetter> {
    return new Promise(resolve => {
      const resolver = () => resolve(stateSetter)
      return this.setState(stateSetter, resolver)
    })
  }

  async loadModule () {
    const { props, aSetState } = this
    const { url, cssLoader } = props
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
      const importedData = (await import(/* vite-ignore */ url)) as unknown
      const importedIsNotObject = typeof importedData !== 'object'
      const importedIsNullish = importedData === null || importedData === undefined
      if (importedIsNotObject || importedIsNullish) throw new Error('Imported module is not an object')
      const importedDataAsAny = importedData as any
      const importedHasInitFunc = 'init' in importedData && typeof importedDataAsAny.init === 'function'
      const importedHasUpdateFunc = 'update' in importedData && typeof importedDataAsAny.update === 'function'
      const importedHasStyles = 'styles' in importedData
        && Array.isArray(importedDataAsAny.styles)
        && (importedDataAsAny?.styles as unknown[]|undefined)?.every(url => typeof url === 'string')
      if (!importedHasInitFunc) throw new Error('Imported module must export a function named init')
      if (!importedHasUpdateFunc) throw new Error('Imported module must export a function named update')
      const moduleData = importedData as ModuleData
      if (cssLoader !== undefined && importedHasStyles) {
        const styles = (importedDataAsAny.styles as string[])
        styles.forEach(url => cssLoader(url))
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
      const moduleTarget = await moduleData.init(context ?? createBlockContext()) as unknown
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
    if (moduleData === null || moduleTarget === null) return;
    moduleData.update(
      moduleTarget,
      context ?? createBlockContext({}),
      prevContext ?? createBlockContext({})
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

  $moduleWrapper: HTMLDivElement|null = null

  render () {
    const { state } = this
    const { status } = state
    if (status !== 'initialized') return null
    return <div
      className={`lm-module-block-renderer`}
      ref={n => { this.$moduleWrapper = n }} />
  }
}
