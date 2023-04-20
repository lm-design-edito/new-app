import { Collection } from '../txt-base'

export enum Options {
  ID = 'id',
  DATA_SOURCES = 'dataSources',
  HIDE_HEADER = 'hideHeader'
}

export const optionsList = Object.values(Options)
export const isValidOptionName = (name: string): name is Options => {
  return optionsList.includes(name as Options)
}

export type ConfigDataSource = { type: 'sheet'|'doc', url: string }
export type Config = {
  [Options.ID]?: string,
  [Options.DATA_SOURCES]?: Array<ConfigDataSource>
  [Options.HIDE_HEADER]?: boolean
}

export enum InlineOnlyInstructionsNames {
  ID = 'id',
  SHEETBASE_URL = 'sheetbaseUrl',
  TEXTBASE_URL = 'textbaseUrl'
}

export enum RemoteValidInstructionsNames {
  HIDE_HEADER = 'hideHeader'
}

export type InstructionName = InlineOnlyInstructionsNames|RemoteValidInstructionsNames

export class Instructions {
  static merge (...instructionsObjs: Instructions[]) {
    const returned = new Instructions()
    instructionsObjs.forEach(instructionObj => {
      instructionObj
        .getAll()
        .forEach(({ name, value }) => returned.set(name, value))
    })
    return returned
  }

  instructionsList: Array<{
    name: InstructionName,
    value: unknown
  }> = []
  
  constructor () {
    this.set = this.set.bind(this)
  }
  
  set (name: InstructionName, value: unknown) {
    this.instructionsList.push({ name, value })
  }

  getAll () {
    return [...this.instructionsList]
  }
  
  toConfig (): Config {
    const config: Config = {}
    this.instructionsList.forEach(({ name, value }) => {
      switch (name) {
        case InlineOnlyInstructionsNames.ID:
          if (typeof value === 'string') { config[Options.ID] = value }
          break;
        case InlineOnlyInstructionsNames.SHEETBASE_URL:
          if (typeof value === 'string') {
            const dataSource: ConfigDataSource = { type: 'sheet', url: value }
            if (config[Options.DATA_SOURCES] === undefined) config[Options.DATA_SOURCES] = [dataSource]
            else config[Options.DATA_SOURCES].push(dataSource)
          }
          break;
        case InlineOnlyInstructionsNames.TEXTBASE_URL:
          if (typeof value === 'string') {
            const dataSource: ConfigDataSource = { type: 'doc', url: value }
            if (config[Options.DATA_SOURCES] === undefined) config[Options.DATA_SOURCES] = [dataSource]
            else config[Options.DATA_SOURCES].push(dataSource)
          }
          break;
        case RemoteValidInstructionsNames.HIDE_HEADER:
          if (value === false) config[Options.HIDE_HEADER] = false
          else config[Options.HIDE_HEADER] = true
          default: break;
      }
    })
    return config
  }
}

export const isValidRemoteInstructionName = (name: string): name is RemoteValidInstructionsNames => {
  const validNames = Object.values(RemoteValidInstructionsNames)
  return validNames.includes(name as RemoteValidInstructionsNames)
}

export const isValidInlineInstructionName = (name: string): name is InlineOnlyInstructionsNames|RemoteValidInstructionsNames => {
  const isValidRemote = isValidRemoteInstructionName(name)
  if (isValidRemote) return true
  const validNames = Object.values(InlineOnlyInstructionsNames)
  return validNames.includes(name as InlineOnlyInstructionsNames)
}

export const isValidInstructionName = isValidInlineInstructionName

export function getInlineConfigInstructrions () {
  const configTags = [...document.querySelectorAll('.lm-page-config')]
  const pageConfigInstructions = new Instructions()
  configTags.forEach(configTag => {
    const optionName = configTag.getAttribute('value')
    if (optionName === null) return
    if (!isValidInlineInstructionName(optionName)) return
    const optionValue = configTag.innerHTML
    pageConfigInstructions.set(optionName, optionValue)
  })
  return pageConfigInstructions
}

export function getRemoteConfigInstructions (configCollection?: Collection) {
  const returned = new Instructions()
  if (configCollection === undefined) return returned
  configCollection.entries.forEach(entry => {
    entry.fields.forEach(field => {
      const { name, value } = field
      if (!isValidRemoteInstructionName(name)) return
      returned.set(name, value)
    })
  })
  return returned
}

export function applyConfig (config: Config) {
  // [WIP] do this
  return true
}
