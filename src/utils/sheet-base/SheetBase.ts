import SheetBaseCollection, { SheetBaseCollectionDescriptor, SheetBaseCollectionValue } from './SheetBaseCollection'

interface SheetBaseValue {
  readonly [key: string]: SheetBaseCollectionValue
}

class SheetBase {
  _collections: SheetBaseCollection[] = []

  createCollection (descriptor: SheetBaseCollectionDescriptor): SheetBaseCollection {
    const collection = new SheetBaseCollection({ ...descriptor, parentBase: this })
    const alreadyExistingCollection = this.strictCollection(collection.name)
    if (alreadyExistingCollection !== undefined) {
      console.warn(`collection ${collection.name} already exists and is gonna be overwridden`)
      this.dropCollection(collection.name)
    }
    this._collections.push(collection)
    return collection
  }

  dropCollection (name: string): boolean {
    const newCollections = this._collections.filter(collection => collection.name !== name)
    if (newCollections.length === this._collections.length) return false
    this._collections.splice(0, this._collections.length, ...newCollections)
    return true
  }

  get collections (): SheetBaseCollection[] {
    return this._collections
  }

  get value (): SheetBaseValue {
    const returned: SheetBaseValue = {}
    for (const col of this._collections) Object.defineProperty(returned, col.name, { get: () => col.value })
    return returned
  }

  strictCollection (name: string): SheetBaseCollection|undefined {
    return this._collections.find(collection => (collection.name === name))
  }

  collection (name: string): SheetBaseCollection {
    const found = this.strictCollection(name)
    return found ?? new SheetBaseCollection({ name: '', parentBase: this })
  }
}

export type { SheetBaseValue }
export default SheetBase
