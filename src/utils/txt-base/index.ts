import { VNode, isValidElement } from 'preact'
import { masterTransformer, PrimitiveValue as TransformerPrimitiveValue } from './transformers'

type FieldPrimitiveValue = Exclude<TransformerPrimitiveValue, Base|Collection|Entry|Field>
  |EntryValue
  |CollectionValue
  |BaseValue
type FieldValue = FieldPrimitiveValue|FieldValue[]

type EntryValue = {
  [fieldName: string]: FieldValue
}

type CollectionValue = {
  [entryName: string]: EntryValue
}

type BaseValue = {
  [collectionName: string]: CollectionValue
}

export const valueIsString = (v: unknown): v is string => (typeof v === 'string')
export const valueIsNumber = (v: unknown): v is number => (typeof v === 'number')
export const valueIsBoolean = (v: unknown): v is boolean => (typeof v === 'boolean')
export const valueIsNull = (v: unknown): v is null => (v === null)
export const valueIsHTMLElement = (v: unknown): v is HTMLElement => (v instanceof HTMLElement)
export const valueIsVNode = (v: unknown): v is VNode => isValidElement(v)
export const valueIsBaseValue = (v: unknown): v is BaseValue => {
  if (typeof v !== 'object') return false
  if (v === null) return false
  const isColl = valueIsCollectionValue
  return Object.values(v).every(value => isColl(value))
}
export const valueIsCollectionValue = (v: unknown): v is CollectionValue => {
  if (typeof v !== 'object') return false
  if (v === null) return false
  const isEntry = valueIsEntryValue
  return Object.values(v).every(value => isEntry(value))
}
export const valueIsEntryValue = (v: unknown): v is EntryValue => {
  if (typeof v !== 'object') return false
  if (v === null) return false
  const isValid = valueIsValid
  return Object.values(v).every(value => isValid(value))
}
export const valueIsValidArray = (v: unknown): v is Array<FieldPrimitiveValue> => {
  if (!Array.isArray(v)) return false
  return v.every(item => !valueIsValidArray(item) && valueIsValid(item))
}
export const valueIsValid = (v: unknown): v is FieldValue => {
  return valueIsString(v)
    || valueIsNumber(v)
    || valueIsBoolean(v)
    || valueIsNull(v)
    || valueIsHTMLElement(v)
    || valueIsVNode(v)
    || valueIsBaseValue(v)
    || valueIsCollectionValue(v)
    || valueIsEntryValue(v)
    || valueIsValidArray(v)
}

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
    this.clone = this.clone.bind(this)
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

  clone () {
    const newBase = new Base()
    this.collections.forEach(collection => {
      collection.entries.forEach(entry => {
        entry.fields.forEach(field => {
          newBase
            .create(collection.name)
            .create(entry.name)
            .create(field.name)
            .updateRaw(field.raw)
        })
      })
    })
    return newBase
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
      console.warn('Own descendants references are forbidden, at', root.path)
      return undefined
    } else if (currentItem === root) {
      console.warn('Self references are forbidden, at', root.path)
      return undefined
    }
    // [WIP] why does TS think currentItem cannot be undefined ?
    return currentItem
  }

  get value (): BaseValue {
    const returned = {}
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
  label = 'COLLECTION'
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

  get value (): CollectionValue {
    const returned = {}
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
  label = 'ENTRY'
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

  create (name: Field['name'], raw: Field['raw'] = '') {
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

  get value (): EntryValue {
    const returned = {}
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
  label = 'FIELD'
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

  updateRaw (updater: string|((curr: string) => string)) {
    if (typeof updater === 'string') {
      this.raw = updater
      return
    }
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

  get value (): FieldValue {
    const { transformed } = this
    if (transformed instanceof Field
      || transformed instanceof Entry
      || transformed instanceof Collection
      || transformed instanceof Base) {
      return transformed.value
    }
    if (Array.isArray(transformed)) return transformed.map(item => {
      if (item instanceof Field) return item.value
      if (item instanceof Entry) return item.value
      if (item instanceof Collection) return item.value
      if (item instanceof Base) return item.value
      return item
    })
    return transformed
  }

  get path () {
    return `${this.parent.path}${this.name}/`
  }
}

type ParsingActionResult = {
  success: Collection|Entry|Field|string
  error?: undefined
}|{
  success?: undefined
  error: string
}

export type ParserErrorLog = { line: number, message: string }

export default function parse (str: string): { result: Base, errors?: ParserErrorLog[] } {
  const base = new Base()
  let currentCollection: Collection|null = null
  let currentEntry: Entry|null = null
  let currentField: Field|null = null
  const lines = str.split('\n')
  const newCollectionRegexp = new RegExp('^\\s*#\\s*' + Collection.nameRegexp.source)
  const newEntryRegexp = new RegExp('^\\s*##\\s*' + Entry.nameRegexp.source)
  const newFieldRegexp = new RegExp('^\\s*_\\s*' + Field.nameRegexp.source + '\\s*:')
  const newCommentRegexp = /^\s*\/\//
  const errorLogs: ParserErrorLog[] = []

  lines.forEach((line, linePos) => {
    line = line.replace(/^\s*/, '')
    const isComment = newCommentRegexp.test(line)
    if (isComment) return
    if (newCollectionRegexp.test(line)) {
      const newCollectionLineMatch = line.match(newCollectionRegexp)?.[0]
      if (newCollectionLineMatch !== undefined) {
        const addCollectionResult = addCollection(newCollectionLineMatch)
        if (addCollectionResult.error !== undefined) errorLogs.push({
          line: linePos,
          message: addCollectionResult.error
        })
      }
    } else if (newEntryRegexp.test(line)) {
      const newEntryLineMatch = line.match(newEntryRegexp)?.[0]
      if (newEntryLineMatch !== undefined) {
        const addEntryResult = addEntry(newEntryLineMatch)
        if (addEntryResult.error !== undefined) errorLogs.push({
          line: linePos,
          message: addEntryResult.error
        })
      }
    } else if (newFieldRegexp.test(line)) {
      const newFieldLineMatch = line.match(newFieldRegexp)?.[0]
      if (newFieldLineMatch !== undefined) {
        const addFieldResult = addField(newFieldLineMatch)
        if (addFieldResult.error !== undefined) errorLogs.push({
          line: linePos,
          message: addFieldResult.error
        })
        const content = line.replace(newFieldLineMatch, '')
        const addContentResult = addContent(content)
        if (addContentResult.error !== undefined) errorLogs.push({
          line: linePos,
          message: addContentResult.error
        })
      }
    } else {
      const addContentResult = addContent(line)
      if (addContentResult.error !== undefined) errorLogs.push({
        line: linePos,
        message: addContentResult.error
      })
    }
  })

  if (errorLogs.length === 0) return { result: base }
  return { result: base, errors: errorLogs }

  /* Hoisted helper functions */

  function addCollection (matched: string): ParsingActionResult {
    const collectionName = matched.trim().replace(/^#\s*/, '')
    currentCollection = base.create(collectionName.trim())
    if (currentCollection !== null) return { success: currentCollection }
    return { error: `Cannot not create a collection from '${matched}'` }
  }

  function addEntry (matched: string): ParsingActionResult {
    // [WIP] silent log here
    const entryName = matched.trim().replace(/^##\s*/, '')
    if (currentCollection === null) return { error: `Cannot create entry from '${matched}' since there is no current collection` }
    currentEntry = currentCollection.create(entryName.trim())
    if (currentEntry !== null) return { success: currentEntry }
    return { error: `Cannot not create an entry from '${matched}'` }
  }

  function addField (matched: string): ParsingActionResult {
    if (currentEntry === null) return { error: `Cannot create field from '${matched}' since there is no current entry` }
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
    if (currentField !== null) return { success: currentField }
    return { error: `Cannot not create a field from '${matched}'` }
  }

  function addContent (content: string): ParsingActionResult {
    if (currentField === null) return { error: `Cannot add content from '${content}' since there is no current field` }
    currentField.updateRaw(curr => `${curr}${content.trim()}`)
    if (currentField !== null) return { success: content }
    return { error: `Cannot not add content from '${content}'` }
  }
}
