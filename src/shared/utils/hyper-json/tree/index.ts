import { Window } from '@design-edito/tools/agnostic/misc/crossenv/window'
import { Cast } from '../cast'
import { Generators } from '../generators'
import { Merge } from '../merge'
import { SmartTags } from '../smart-tags'
import { Utils } from '../utils'
import { Types } from '../types'
import { Outcome } from '@design-edito/tools/agnostic/misc/outcome'

/* * * * * * * * * * * * * * * * * * * * *
 *
 * TREE
 * 
 * * * * * * * * * * * * * * * * * * * * */

export namespace Tree {

  const defaultOptions: Types.Tree.Options = {
    ...Merge.defaultOptions,
    globalObj: {},
    smartTags: new Map(),
    modeAttribute: '_mode'
  }

  function fillOptions (partial: Partial<Types.Tree.Options>): Types.Tree.Options {
    return {
      ...defaultOptions,
      ...partial
    }
  }

  export function from (
    nodes: Array<Element | Text>,
    options?: Partial<Types.Merge.Options & Types.Tree.Options>): Tree {
    const merged = Merge.mergeRoots(nodes, options)
    return new Tree(merged, null, null, options)
  }

  export class Tree<T extends Element | Text = Element | Text> {
    readonly node: T
    readonly parent: Tree | null
    readonly pathFromParent: string | number | null
    readonly root: Tree
    readonly isRoot: boolean
    readonly path: Array<string | number>
    readonly pathString: string
    readonly isMethod: boolean
    readonly tagName: string | null
    readonly smartTagName: string | null
    readonly attributes: T extends Element ? ReadonlyArray<Readonly<Attr>> : null
    readonly mode: 'coalescion' | 'isolation'
    readonly smartTags: Types.SmartTags.Register
    readonly smartTagData: Types.SmartTags.Data | null
    readonly subtrees: ReadonlyMap<string | number, Tree> = new Map()
    readonly options: Types.Tree.Options

    constructor (node: T, parent: null, pathFromParent: null, options?: Partial<Types.Tree.Options>)
    constructor (node: T, parent: Tree, pathFromParent: string | number, options?: Partial<Types.Tree.Options>)
    constructor (node: T, parent: Tree | null, pathFromParent: string | number | null, options: Partial<Types.Tree.Options> = defaultOptions) {
      const { Element, Text } = Window.get()
      const filledOptions = fillOptions(options)

      // Bounds
      this.getInitialValue = this.getInitialValue.bind(this)
      this.getCoalescedValue = this.getCoalescedValue.bind(this)
      this.getWrappedValue = this.getWrappedValue.bind(this)
      this.getTransformedValue = this.getTransformedValue.bind(this)
      this.evaluate = this.evaluate.bind(this)
      this.getPerfCounters = this.getPerfCounters.bind(this)
      this.printPerfCounters = this.printPerfCounters.bind(this)
      
      // node
      this.node = node

      // parent, pathFromParent, root, isRoot
      if (parent !== null && pathFromParent !== null) {
        this.isRoot = false
        this.parent = parent
        this.pathFromParent = pathFromParent
        this.root = this.parent.root
      } else {
        this.isRoot = true
        this.parent = null
        this.pathFromParent = null
        this.root = this
      }

      // path, pathString
      this.path = this.isRoot ? [] : [...this.parent!.path, this.pathFromParent!]
      this.pathString = `/${this.path.join('/')}`

      // isMethod, tagName, smartTagName
      if (node instanceof Element) {
        const rawTagName = node.tagName.trim().toLowerCase()
        const hasTrailingUnderscore = rawTagName.endsWith('_')
        if (!hasTrailingUnderscore) {
          this.tagName = rawTagName
          this.smartTagName = rawTagName
          this.isMethod = false
        } else {
          this.tagName = rawTagName
          this.smartTagName = rawTagName.replace(/_+$/g, '')
          this.isMethod = true
        }
      }
      else {
        this.tagName = null
        this.smartTagName = null
        this.isMethod = false
      }

      // attributes
      this.attributes = (node instanceof Element ? Array.from(node.attributes) : null) as T extends Element ? Attr[] : null
      
      // mode
      const hasIsolationModeAttribute = this.attributes?.find(({ name, value }) => {
        return name === filledOptions.modeAttribute
          && value === 'isolation'
      }) ?? false
      this.mode = hasIsolationModeAttribute ? 'isolation' : 'coalescion'

      // smartTags, smartTagData
      this.smartTags = new Map([...SmartTags.defaultRegister, ...filledOptions.smartTags])
      this.smartTagData = this.smartTags.get(this.smartTagName as string) ?? null

      // subtrees
      const { childNodes } = node
      let positionnedChildrenCount = 0
      const mutableSubtrees = new Map<string | number, Tree>()
      Array
        .from(childNodes)
        .filter((node, _, nodes): node is Element | Text => {
          if (node instanceof Element) return true
          if (!(node instanceof Text)) return false
          const hasContent = (node.textContent ?? '').trim() !== ''
          if (hasContent) return true
          if (nodes.some(n => n instanceof Element)) return false
          return true
        })
        .forEach(childNode => {
          if (childNode instanceof Text) {
            childNode.textContent = childNode.textContent?.trim() ?? ''
            mutableSubtrees.set(
              positionnedChildrenCount,
              new Tree(childNode, this, positionnedChildrenCount, filledOptions)
            )
            positionnedChildrenCount += 1
          } else {
            const propertyName = childNode.getAttribute(filledOptions.keyAttribute)
            if (propertyName === null) {
              mutableSubtrees.set(
                positionnedChildrenCount,
                new Tree(childNode, this, positionnedChildrenCount, filledOptions)
              )
              positionnedChildrenCount += 1
            } else {
              mutableSubtrees.set(
                propertyName,
                new Tree(childNode, this, propertyName, filledOptions)
              )
            }
          }
        })
      this.subtrees = mutableSubtrees

      // options
      this.options = filledOptions
    }

    getInitialValue (): Types.Tree.Value {
      const { node, smartTagData } = this
      const { Text, document } = Window.get()
      if (node instanceof Text) return document.createTextNode(node.textContent ?? '')
      if (smartTagData === null) {
        const frag = document.createDocumentFragment()
        return frag.childNodes as NodeListOf<Element | Text>
      }
      const { initializer } = smartTagData
      return initializer !== undefined ? initializer(this) : []
    }

    getCoalescedValue (): Types.Tree.Value {
      const { subtrees, getInitialValue } = this
      const initialValue = getInitialValue()
      const coalesced = Array
        .from(subtrees)
        .reduce((currentValue, [subpath, subtree]) => Utils.reduceValues(
          currentValue,
          subpath,
          subtree.evaluate()
        ), initialValue)
      return coalesced
    }

    getWrappedValue (): Types.Tree.Value {
      const { node, smartTagData, getCoalescedValue } = this
      const { Text } = Window.get()
      const coalescedValue = getCoalescedValue()
      if (node instanceof Text) return Cast.toText(coalescedValue)
      if (smartTagData === null) {
        const innerNodeList = Cast.toNodeList(coalescedValue)
        const clone = node.cloneNode() as Element
        clone.append(...Utils.clone(innerNodeList))
        return clone
      }
      const { wrapper } = smartTagData
      if (wrapper === undefined) return coalescedValue
      return wrapper(coalescedValue, this)
    }

    getTransformedValue (): Types.Tree.Value {
      const { getWrappedValue, smartTagData, isMethod } = this
      const wrappedValue = getWrappedValue()
      if (smartTagData === null || smartTagData.generator === undefined) {
        if (!isMethod) return wrappedValue
        const name = this.smartTagName ?? '<anonymous>'
        const args = wrappedValue
        const func = () => Outcome.makeSuccess(wrappedValue)
        const sourceTree = this
        const options = {}
        const transformer = new Generators.Transformer(name, args, func, sourceTree, options)
        return new Generators.Method(transformer)
      }
      const { generator } = smartTagData
      const { transformer, method } = generator(wrappedValue, this)
      if (isMethod) return method
      return transformer
    }

    evaluate (): Types.Tree.Value {
      const { getTransformedValue, pathString } = this
      console.group(pathString)
      const transformedValue = getTransformedValue()
      console.log('!!!', this.smartTagName, transformedValue)
      // [WIP] sécurité si isRoot et évalué comme un Transformer ou une Function ?
      console.groupEnd()
      return transformedValue
    }

    /* * * * * * * * * * * * * * * * * * * *
     *
     * PERF COUNTERS
     * 
     * * * * * * * * * * * * * * * * * * * */

    perfCounters = {
      computed: 0,
      computeTime: 0,
      computeTimeAvg: 0,
      cached: 0,
      cacheTime: 0,
      cacheTimeAvg: 0,
      totalTime: 0
    }

    getPerfCounters () {
      // const { subtrees } = this
      // const subCounters: Array<[string, typeof this['perfCounters']]> = []
      // subCounters.push([this.pathString, this.perfCounters])
      // subtrees.forEach(subtree => subCounters.push(...subtree.getPerfCounters()))
      // return subCounters
    }

    printPerfCounters () {
      console.log('PRINT PERF COUNTERS')
      // const perfCounters = this.getPerfCounters()
      //   .sort((a, b) => {
      //     const aCalls = a[1].computed + a[1].cached
      //     const bCalls = b[1].computed + b[1].cached
      //     // return b[1].totalTime - a[1].totalTime
      //     return bCalls - aCalls
      //   })
      //   .map(e => ({
      //     path: e[0],
      //     totalMs: e[1].totalTime,
      //     computeMs: e[1].computeTime,
      //     cacheMs: e[1].cacheTime,
      //     ops: `${e[1].computed}/${e[1].cached}`
      //   }))
      // console.table(perfCounters)
    }
  }
}
