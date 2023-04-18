import { createElement, VNode } from 'preact'
import { SheetBaseValue } from './SheetBase'
import { SheetBaseCollectionValue } from './SheetBaseCollection'
import SheetBaseEntry, { SheetBaseEntryValue } from './SheetBaseEntry'
import StrToVNodes from '../../components/StrToVNodes'

type FieldType = 'string'|'text'|'number'|'bigint'|'boolean'|'null'|'undefined'|'html'|'ref'

interface SheetBaseFieldDescriptor {
  name: string
  description?: string
  type?: FieldType
  raw?: string
  parentEntry?: SheetBaseEntry
}

type SheetBaseFieldValue = string|number|bigint|boolean|null|undefined|VNode|SheetBaseValue|SheetBaseCollectionValue|SheetBaseEntryValue

class SheetBaseField {
  _name: string
  _description: string
  _type: FieldType
  _raw: string
  _parentEntry: SheetBaseEntry

  constructor ({ name, description, type, raw, parentEntry }: SheetBaseFieldDescriptor) {
    this._name = name
    this._description = description ?? ''
    this._type = type ?? 'text'
    this._raw = raw ?? ''
    this._parentEntry = parentEntry ?? new SheetBaseEntry({ id: 'untitled' })
  }

  get name (): string { return this._name }
  get description (): string { return this._description }
  get type (): FieldType { return this._type }
  get raw (): string { return this._raw }
  get parentEntry (): SheetBaseEntry { return this._parentEntry }

  /* eslint-disable getter-return */
  get value (): SheetBaseFieldValue {
    switch (this.type) {
      case 'string':
      case 'text':
        if (this.raw === '') return
        return this.raw
      case 'number':
        if (this.raw === '') return
        return window.parseFloat(this.raw.replace(/,/gm, '.'))
      case 'bigint':
        if (this.raw === '') return
        return window.BigInt(this.raw)
      case 'boolean': {
        if (this.raw === '') return
        const isTrue = this.raw.toLowerCase().trim() === '1'
          || this.raw.toLowerCase().trim() === 'true'
          || this.raw.toLowerCase().trim() === 'vrai'
        return isTrue
      }
      case 'null':
        if (this.raw === '') return
        return null
      case 'undefined':
        return
      case 'html':
        if (this.raw === '') return
        return createElement(StrToVNodes, { content: this.raw }, null)
      case 'ref': {
        if (this.raw === '') return
        const [collection, entry, field] = this.raw.split('.')
        const parentBase = this._parentEntry.parentCollection.parentBase
        if (entry === undefined) return parentBase.collection(collection)?.value
        else if (field === undefined) return parentBase.collection(collection)?.entry(entry)?.value
        else return parentBase.collection(collection)?.entry(entry)?.field(field)?.value
      }
    }
  }
  /* eslint-enable getter-return */
}

export type { SheetBaseFieldDescriptor, SheetBaseFieldValue }
export default SheetBaseField
