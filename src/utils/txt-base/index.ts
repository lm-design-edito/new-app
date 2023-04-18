import {
  masterTransformer,
  PrimitiveValue as TransformerPrimitiveValue
} from './transformers'

export class Base {
  collections: Collection[]
  parent: this
  parents: []
  constructor () {
    this.collections = []
    this.parent = this
    this.parents = []
    this.get = this.get.bind(this)
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.resolver = this.resolver.bind(this)
  }

  get (name: Collection['name']) {
    return this.collections.find(col => col.name === name)
  }

  create (name: Collection['name']) {
    const alreadyExists = this.get(name)
    if (alreadyExists !== undefined) return alreadyExists
    const newCollection = new Collection(name, this)
    this.collections.push(newCollection)
    return newCollection
  }

  delete (name: Collection['name']) {
    const collection = this.get(name)
    if (collection === undefined) return
    const collectionIndex = this.collections.indexOf(collection)
    if (collectionIndex === -1) return
    this.collections = [
      ...this.collections.slice(0, collectionIndex),
      ...this.collections.slice(collectionIndex + 1)
    ]
    return true
  }

  resolver (root: Field|Entry|Collection|Base, path: string): Field|Entry|Collection|Base|undefined {
    const [firstChunk, ...lastChunks] = path.split('/')    
    let currentItem: Field|Entry|Collection|Base|undefined = undefined
    if (firstChunk === '..') currentItem = root.parent
    else if (firstChunk === '.') currentItem = root
    else {
      currentItem = this
      lastChunks.unshift(firstChunk)
    }
    lastChunks.forEach(chunk => {
      if (currentItem === undefined) return
      if (chunk === '..') currentItem = currentItem.parent
      else if (chunk === '.') currentItem = currentItem
      else {
        if (currentItem instanceof Field) { currentItem = undefined }
        else { currentItem = currentItem.get(chunk) }
      }
    })
    const currentItemParents = currentItem?.parents as Array<Base|Collection|Entry|Field>
    if (currentItemParents?.includes(root)) {
      // [WIP] silent log here
      console.warn('Own descendants references are forbidden, at', root.path)
      return undefined
    } else if (currentItem === root) {
      // [WIP] silent log here
      console.warn('Self references are forbidden, at', root.path)
      return undefined
    }
    // [WIP] why does TS think currentItem cannot be undefined ?
    return currentItem
  }

  get value () {
    const returned: { [key: string]: Collection['value'] } = {}
    this.collections.forEach(collection => {
      Object.defineProperty(
        returned,
        collection.name,
        { get: () => collection.value }
      )
    })
    return returned
  }

  get path () {
    return `/`
  }
}

export class Collection {
  static nameRegexp = /[a-zA-Z0-9\-\_]+/
  name: string
  parent: Base
  parents: [Base]
  entries: Entry[]
  constructor (name: Collection['name'], parent: Base) {
    this.name = name
    this.parent = parent
    this.parents = [this.parent]
    this.entries = []
    this.get = this.get.bind(this)
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.resolver = this.resolver.bind(this)
  }

  get (name: Entry['name']) {
    return this.entries.find(entry => entry.name === name)
  }

  create (name: Entry['name']) {
    const alreadyExists = this.get(name)
    if (alreadyExists !== undefined) return alreadyExists
    const newEntry = new Entry(name, this)
    this.entries.push(newEntry)
    return newEntry
  }
  
  delete (name: Entry['name']) {
    const entry = this.get(name)
    if (entry === undefined) return
    const entryIndex = this.entries.indexOf(entry)
    if (entryIndex === -1) return
    this.entries = [
      ...this.entries.slice(0, entryIndex),
      ...this.entries.slice(entryIndex + 1)
    ]
    return true
  }

  resolver (...args: Parameters<Base['resolver']>) {
    return this.parent.resolver(...args)
  }

  get value () {
    const returned: { [key: string]: Entry['value'] } = {}
    this.entries.forEach(entry => {
      Object.defineProperty(
        returned,
        entry.name,
        { get: () => entry.value }
      )
    })
    return returned
  }

  get path () {
    return `${this.parent.path}${this.name}/`
  }
}

export class Entry {
  static nameRegexp = /[a-zA-Z0-9\-\_]+/
  name: string
  parent: Collection
  parents: [Base, Collection]
  fields: Field[]
  constructor (name: Entry['name'], parent: Collection) {
    this.name = name
    this.parent = parent
    this.parents = [...this.parent.parents, this.parent]
    this.fields = []
    this.get = this.get.bind(this)
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
    this.resolver = this.resolver.bind(this)
  }

  get (name: Field['name']) {
    return this.fields.find(field => field.name === name)
  }

  create (name: Field['name'], raw: Field['raw']) {
    const alreadyExists = this.get(name)
    if (alreadyExists !== undefined) return alreadyExists
    const newField = new Field(name, this, raw)
    this.fields.push(newField)
    return newField
  }
  
  delete (name: Field['name']) {
    const field = this.get(name)
    if (field === undefined) return
    const fieldIndex = this.fields.indexOf(field)
    if (fieldIndex === -1) return
    this.fields = [
      ...this.fields.slice(0, fieldIndex),
      ...this.fields.slice(fieldIndex + 1)
    ]
    return true
  }

  resolver (...args: Parameters<Base['resolver']>) {
    return this.parent.resolver(...args)
  }

  get value () {
    const returned: { [key: string]: Field['value'] } = {}
    this.fields.forEach(field => {
      Object.defineProperty(
        returned,
        field.name,
        { get: () => field.value }
      )
    })
    return returned
  }
  
  get path () {
    return `${this.parent.path}${this.name}/`
  }
}

export class Field {
  static nameRegexp = /[a-zA-Z0-9\-\_]+/
  name: string
  parent: Entry
  parents: [Base, Collection, Entry]
  raw: string
  constructor (
    name: Field['name'],
    parent: Entry,
    raw: Field['raw']) {
    this.name = name
    this.parent = parent
    this.parents = [...this.parent.parents, this.parent]
    this.raw = raw
    this.updateRaw = this.updateRaw.bind(this)
    this.resolver = this.resolver.bind(this)
    this.resolve = this.resolve.bind(this)
  }

  updateRaw (updater: (curr: string) => string) {
    const newraw = updater(this.raw)
    this.raw = newraw
  }

  resolver (...args: Parameters<Base['resolver']>) {
    return this.parent.resolver(...args)
  }

  resolve (path: string) {
    return this.resolver(this, path)
  }

  get transformed () {
    const raw = this.raw
    const [initialValue, ...transformersDescriptors] = raw
      .split('>>>')
      .map(chunk => chunk.trim())
    const transformed: TransformerPrimitiveValue|TransformerPrimitiveValue[] = transformersDescriptors.reduce((
      value: TransformerPrimitiveValue|TransformerPrimitiveValue[],
      transformerDescriptor: string) => {
      // [WIP] do better for args, maybe args:string[] to transformers
      const [transformerName, ..._transformerStrArgs] = transformerDescriptor.split(' ')
      const transformerStrArgs = _transformerStrArgs.join(' ')
      return masterTransformer(
        value,
        transformerName,
        transformerStrArgs,
        this.resolve
      )
    }, initialValue)
    return transformed
  }

  get value (): any {
    const { transformed } = this
    if (transformed instanceof Field
      || transformed instanceof Entry
      || transformed instanceof Collection
      || transformed instanceof Base) {
      return transformed.value
    }
    return transformed
  }

  get path () {
    return `${this.parent.path}${this.name}/`
  }
}

function parse (str: string) {
  const base = new Base()
  let currentCollection: Collection|null = null
  let currentEntry: Entry|null = null
  let currentField: Field|null = null

  const lines = str.split('\n')

  const newCollectionRegexp = new RegExp('^\\s*#\\s*' + Collection.nameRegexp.source)
  const newEntryRegexp = new RegExp('^\\s*##\\s*' + Entry.nameRegexp.source)
  const newFieldRegexp = new RegExp('^\\s*_\\s*' + Field.nameRegexp.source + '\\s*:')
  const newCommentRegexp = /^\s*\/\//

  lines.forEach(line => {
    line = line.replace(/^\s*/, '')
    const isComment = newCommentRegexp.test(line)
    if (isComment) return
    if (newCollectionRegexp.test(line)) {
      const newCollectionLineMatch = line.match(newCollectionRegexp)?.[0]
      if (newCollectionLineMatch !== undefined) addCollection(newCollectionLineMatch)
    } else if (newEntryRegexp.test(line)) {
      const newEntryLineMatch = line.match(newEntryRegexp)?.[0]
      if (newEntryLineMatch !== undefined) addEntry(newEntryLineMatch)
    } else if (newFieldRegexp.test(line)) {
      const newFieldLineMatch = line.match(newFieldRegexp)?.[0]
      if (newFieldLineMatch !== undefined) {
        addField(newFieldLineMatch)
        const content = line.replace(newFieldLineMatch, '')
        addContent(content)
      }
    } else {
      addContent(line)
    }
  })

  return base

  /* Hoisted helper functions */

  function addCollection (matched: string) {
    const collectionName = matched.trim().replace(/^#\s*/, '')
    currentCollection = base.create(collectionName.trim())
  }

  function addEntry (matched: string) {
    // [WIP] silent log here
    if (currentCollection === null) return console.warn('Cannot create entry since there is no current collection')
    const entryName = matched.trim().replace(/^##\s*/, '')
    currentEntry = currentCollection.create(entryName.trim())
  }

  function addField (matched: string) {
    if (currentEntry === null) return console.warn('Cannot create field since there is no current entry')
    const fieldNameWithType = matched
      .trim()
      .replace(/^_/, '')
      .replace(/:$/, '')
    const fieldType = fieldNameWithType
      .match(/:[a-z]+$/)?.[0]
      .replace(/^:/, '')
    const fieldName = fieldType === undefined
      ? fieldNameWithType
      : fieldNameWithType.replace(/:[a-z]+$/, '')
    currentField = currentEntry.create(fieldName.trim(), '')
  }

  function addContent (content: string) {
    if (currentField === null) return console.warn('Cannot create content since there is no current field')
    currentField.updateRaw(curr => `${curr}${content.trim()}`)
  }
}

export default parse
