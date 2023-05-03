import { ConfigDataSource, Config as PageConfig } from '~/shared/lm-page-config'
import parseTextbase, { Base, ParserErrorLog, valueIsString } from '~/utils/txt-base'
import { SheetBase, SheetBaseEntry, tsvToSheetBase as parseSheetbase } from '~/utils/sheet-base'

const { isArray } = Array

/* * * * * * * * * * * * * * * * * * * *
 * MAKE PAGE DATABASE
 * * * * * * * * * * * * * * * * * * * */
export async function makePageDatabase (dataSources: PageConfig['dataSources'] = []) {
  const dataset = dataSources.map(dataSource => ({
    type: dataSource.type,
    url: dataSource.url,
    content: dataSource.content,
    data: null as string|null
  }))
  await Promise.all(dataset.map(async dataSource => {
    if (dataSource.content !== undefined) { dataSource.data = dataSource.content ?? null }
    else if (dataSource.url === undefined) { dataSource.data = null }
    else {
      try {
        const response = await window.fetch(dataSource.url)
        const data = await response.text()
        dataSource.data = data
      } catch (err) {
        // [WIP] silent log error here
        return
      }
    }
  }))
  const pageDatabase = new Base()
  const parsingErrors: Array<ParserErrorLog & { dataSource: ConfigDataSource }> = []
  dataset.forEach(dataSource => {
    if (dataSource.data === null) return
    const parsingResult = dataSource.type === 'sheet'
      ? parseSheetbase(dataSource.data)
      : parseTextbase(dataSource.data)
    const currentBase = parsingResult instanceof SheetBase
      ? parsingResult
      : parsingResult.result
    if (!(parsingResult instanceof SheetBase)) {
      const errors = parsingResult.errors
      if (errors !== undefined) parsingErrors.push(...errors.map(error => ({
        line: error.line,
        message: error.message,
        dataSource
      })))
    }
    currentBase.collections.forEach(collection => {
      const pageCollection = pageDatabase.create(collection.name)
      collection.entries.forEach(entry => {
        const entryIsSBEntry = entry instanceof SheetBaseEntry
        const entryName = entryIsSBEntry ? entry.id : entry.name
        const pageEntry = pageCollection.create(entryName)
        entry.fields.forEach(field => {
          const pageField = pageEntry.create(field.name)
          pageField.updateRaw(field.raw)
        })
      })
    })
  })
  return { result: pageDatabase, errors: parsingErrors }
}

/* * * * * * * * * * * * * * * * * * * *
 * FILTER DATABASE
 * * * * * * * * * * * * * * * * * * * */
export function filterPageDatabase (
  db: Base,
  _ids: string|string[]) {
  const ids = isArray(_ids) ? _ids : [_ids]
  db.collections.forEach(collection => {
    collection.entries.forEach(entry => {
      const filter = entry.get('FILTER')
      if (filter === undefined) return
      entry.delete('FILTER')
      const filterValue = filter.value
      const isString = valueIsString(filterValue)
      const isStringArr = isArray(filterValue) && filterValue.every(valueIsString)
      if (!isString && !isStringArr) return
      const filters = isArray(filterValue) ? filterValue : [filterValue]
      if (ids.some(id => filters.includes(id))) return
      collection.delete(entry.name)
    })
  })
  return db
}
