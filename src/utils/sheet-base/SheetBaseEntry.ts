import SheetBaseCollection from './SheetBaseCollection'
import SheetBaseField, { SheetBaseFieldDescriptor, SheetBaseFieldValue } from './SheetBaseField'

interface SheetBaseEntryDescriptor {
  id: string
  parentCollection?: SheetBaseCollection
}

interface SheetBaseEntryValue {
  readonly [key: string]: SheetBaseFieldValue
}

class SheetBaseEntry {
  _id: string
  _parentCollection: SheetBaseCollection
  _fields: SheetBaseField[] = []

  constructor ({ id, parentCollection }: SheetBaseEntryDescriptor) {
    this._id = id
    this._parentCollection = parentCollection ?? new SheetBaseCollection({ name: 'untitled' })
  }

  get id (): string { return this._id }
  get parentCollection (): SheetBaseCollection { return this._parentCollection }

  createField (descriptor: SheetBaseFieldDescriptor): SheetBaseField {
    const field = new SheetBaseField({ ...descriptor, parentEntry: this })
    const alreadyExistingField = this.strictField(field.name)
    if (alreadyExistingField !== undefined) {
      console.warn(`field '${field.name}' already exists and is gonna be overwridden`)
      this.dropField(field.name)
    }
    this._fields.push(field)
    return field
  }

  dropField (name: string): boolean {
    const newFields = this._fields.filter(field => field.name !== name)
    if (newFields.length === this._fields.length) return false
    this._fields.splice(0, this._fields.length, ...newFields)
    return true
  }

  get fields (): SheetBaseField[] {
    return this._fields
  }

  get value (): SheetBaseEntryValue {
    const returned: SheetBaseEntryValue = {}
    Object.defineProperty(returned, 'id', { get: () => this._id })
    for (const fld of this._fields) Object.defineProperty(returned, fld.name, { get: () => fld.value })
    return returned
  }

  strictField (name: string): SheetBaseField|undefined {
    return this._fields.find(field => (field.name === name))
  }

  field (name: string): SheetBaseField {
    const found = this.strictField(name)
    return found ?? new SheetBaseField({ name: '', parentEntry: this })
  }
}

export type { SheetBaseEntryDescriptor, SheetBaseEntryValue }
export default SheetBaseEntry
