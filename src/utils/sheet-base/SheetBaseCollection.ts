import SheetBase from './SheetBase'
import SheetBaseEntry, {
  SheetBaseEntryDescriptor,
  SheetBaseEntryValue
} from './SheetBaseEntry'

interface SheetBaseCollectionDescriptor {
  name: string
  description?: string
  parentBase?: SheetBase
}

type SheetBaseCollectionValue = SheetBaseEntryValue[]

class SheetBaseCollection {
  _name: string
  _description: string
  _parentBase: SheetBase
  _entries: SheetBaseEntry[] = []

  constructor ({ name, description, parentBase }: SheetBaseCollectionDescriptor) {
    this._name = name
    this._description = description ?? ''
    this._parentBase = parentBase ?? new SheetBase()
  }

  get name (): string { return this._name }
  get description (): string { return this._description }
  get parentBase (): SheetBase { return this._parentBase }

  createEntry (descriptor: SheetBaseEntryDescriptor): SheetBaseEntry {
    const entry = new SheetBaseEntry({ ...descriptor, parentCollection: this })
    const alreadyExistingEntry = this.strictEntry(entry.id)
    if (alreadyExistingEntry !== undefined) {
      console.warn(`entry '${entry.id}' already exists and is gonna be overwridden`)
      this.dropEntry(entry.id)
    }
    this._entries.push(entry)
    return entry
  }

  dropEntry (id: string): boolean {
    const newEntries = this._entries.filter(entry => entry.id !== id)
    if (newEntries.length === this._entries.length) return false
    this._entries.splice(0, this._entries.length, ...newEntries)
    return true
  }

  get entries (): SheetBaseEntry[] {
    return this._entries
  }

  get value (): SheetBaseCollectionValue {
    const returned: SheetBaseCollectionValue = []
    this._entries.forEach((entry, entryPos) => {
      Object.defineProperty(
        returned,
        entryPos,
        { get: () => entry.value }
      )
    })
    return returned
  }

  strictEntry (id: string): SheetBaseEntry|undefined {
    return this._entries.find(entry => (entry.id === id))
  }

  entry (id: string): SheetBaseEntry {
    const found = this.strictEntry(id)
    return found ?? new SheetBaseEntry({ id: '', parentCollection: this })
  }
}

export type { SheetBaseCollectionDescriptor, SheetBaseCollectionValue }
export default SheetBaseCollection
