import { logEvent, EventNames, LogResult } from '~/shared/lm-analytics'
import getHeaderElements from '~/shared/lm-get-header-element'
import { toBoolean, toNull, toNumber, toString } from '~/utils/cast'
import { injectCssRule } from '~/utils/dynamic-css'
import interpolate, { ratio } from '~/utils/interpolate'
import roundNumbers from '~/utils/round-numbers'
import { Collection } from '~/utils/txt-base'

/* Config object */
export enum Options {
  ID = 'id',
  APPX_PUBLICATION_DATE = 'approxPublicationDate',
  DATA_SOURCES = 'dataSources',
  HIDE_HEADER = 'hideHeader',
  TRACKING = 'tracking',
  CSS = 'css',
  SCALES = 'scales'
}

export type ConfigDataSource = {
  type: 'sheet'|'doc'
  url?: string
  content?: string
}

export type Config = {
  [Options.ID]?: string,
  [Options.APPX_PUBLICATION_DATE]?: string
  [Options.DATA_SOURCES]?: Array<ConfigDataSource>
  [Options.HIDE_HEADER]?: boolean
  [Options.TRACKING]?: {
    start?: boolean
    half?: boolean
    end?: boolean
  }
  [Options.CSS]?: string,
  [Options.SCALES]?: Array<string>
}

export const optionsList = Object.values(Options)
export const isValidOptionName = (name: string): name is Options => {
  return optionsList.includes(name as Options)
}

/* Instructions */
export enum InlineOnlyInstructionsNames {
  ID = 'id',
  APPX_PUBLICATION_DATE = 'approxPublicationDate',
  SHEETBASE_URL = 'sheetbaseUrl',
  TEXTBASE_URL = 'textbaseUrl',
  SHEETBASE_INLINE = 'sheetbaseInline',
  TEXTBASE_INLINE = 'textbaseInline'
}

export enum RemoteValidInstructionsNames {
  HIDE_HEADER = 'hideHeader',
  TRACK_FIRST_SCROLL = 'trackFirstScroll',
  TRACK_HALF_REACHED = 'trackHalfReached',
  TRACK_END_REACHED = 'trackEndReached',
  CSS = 'css',
  ADD_SCALE = 'addScale'
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
      const strValue = toString(value)
      const nbrValue = toNumber(value)
      const boolValue = toBoolean(value)
      // ID
      if (name === InlineOnlyInstructionsNames.ID) {
        config[Options.ID] = strValue
      }
      // APPX_PUBLICATION_DATE
      else if (name === InlineOnlyInstructionsNames.APPX_PUBLICATION_DATE) {
        config[Options.APPX_PUBLICATION_DATE] = strValue
      }
      // SHEETBASE_URL
      else if (name === InlineOnlyInstructionsNames.SHEETBASE_URL) {
        const dataSource: ConfigDataSource = { type: 'sheet', url: strValue }
        const dataSources = config[Options.DATA_SOURCES]
        if (dataSources === undefined) config[Options.DATA_SOURCES] = [dataSource]
        else dataSources.push(dataSource)
      }
      // TEXTBASE_URL
      else if (name === InlineOnlyInstructionsNames.TEXTBASE_URL) {
        const dataSource: ConfigDataSource = { type: 'doc', url: strValue }
        const dataSources = config[Options.DATA_SOURCES]
        if (dataSources === undefined) config[Options.DATA_SOURCES] = [dataSource]
        else dataSources.push(dataSource)
      }
      // SHEETBASE_INLINE
      else if (name === InlineOnlyInstructionsNames.SHEETBASE_INLINE) {
        const dataSource: ConfigDataSource = { type: 'sheet', content: strValue }
        const dataSources = config[Options.DATA_SOURCES]
        if (dataSources === undefined) config[Options.DATA_SOURCES] = [dataSource]
        else dataSources.push(dataSource)
      }
      // TEXTBASE_INLINE
      else if (name === InlineOnlyInstructionsNames.TEXTBASE_INLINE) {
        const dataSource: ConfigDataSource = { type: 'doc', content: strValue }
        const dataSources = config[Options.DATA_SOURCES]
        if (dataSources === undefined) config[Options.DATA_SOURCES] = [dataSource]
        else dataSources.push(dataSource)
      }
      // HIDE_HEADER
      else if (name === RemoteValidInstructionsNames.HIDE_HEADER) {
        config[Options.HIDE_HEADER] = boolValue
      }
      // TRACK_FIRST_SCROLL
      else if (name === RemoteValidInstructionsNames.TRACK_FIRST_SCROLL) {
        if (config[Options.TRACKING] === undefined) config[Options.TRACKING] = {}
        const tracking = config[Options.TRACKING] as NonNullable<Config[Options.TRACKING]>
        tracking.start = boolValue
      }
      // TRACK_HALF_REACHED
      else if (name === RemoteValidInstructionsNames.TRACK_HALF_REACHED) {
        if (config[Options.TRACKING] === undefined) config[Options.TRACKING] = {}
        const tracking = config[Options.TRACKING] as NonNullable<Config[Options.TRACKING]>
        tracking.half = boolValue
      }
      // TRACK_END_REACHED
      else if (name === RemoteValidInstructionsNames.TRACK_END_REACHED) {
        if (config[Options.TRACKING] === undefined) config[Options.TRACKING] = {}
        const tracking = config[Options.TRACKING] as NonNullable<Config[Options.TRACKING]>
        tracking.end = boolValue
      }
      // CSS
      else if (name === RemoteValidInstructionsNames.CSS) {
        const currentCss = config[Options.CSS] ?? ''
        config[Options.CSS] = currentCss + toString(value)
      }
      // ADD_SCALE
      else if (name === RemoteValidInstructionsNames.ADD_SCALE) {
        const currentScales = config[Options.SCALES] ?? []
        currentScales.push(toString(value))
        config[Options.SCALES] = currentScales
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
    const optionValue = configTag.innerHTML.trim()
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

type ApplyConfigHooks = {
  onHeaderHidden?: (headerElements: Element[]|null) => void
  onScrollStarted?: (logResult: LogResult) => void
  onHalfReached?: (logResult: LogResult) => void
  onEndReached?: (logResult: LogResult) => void
  onCssInjected?: (key: string, css: string) => void
  onScalesAdded?: (/* [WIP] */) => void
  onScaleAdditionFailure?: (reason: string, scaleDescriptor: Record<string, string>) => void
}

export function applyConfig (config: Config, hooks?: ApplyConfigHooks) {
  const {
    [Options.HIDE_HEADER]: hideHeader,
    [Options.TRACKING]: tracking,
    [Options.CSS]: css,
    [Options.SCALES]: scales
  } = config
  
  // HIDE_HEADER
  if (hideHeader) {
    const { onHeaderHidden } = hooks ?? {}
    const headers = getHeaderElements()
    if (headers !== null) headers.forEach(headerElt => headerElt.remove())
    if (onHeaderHidden !== undefined) onHeaderHidden(headers)
  }
  
  // TRACKING
  if (tracking !== undefined) {
    const { start, half, end } = tracking
    if (start === false
      && half === false
      && end === false) return;
    let hasStarted = false
    let hasReachedHalf = false
    let hasReachedEnd = false
    const {
      onScrollStarted,
      onHalfReached,
      onEndReached
    } = hooks ?? {}
    const scrollListener = () => {
      if (hasStarted === start
        && hasReachedHalf === half
        && hasReachedEnd === end) return;
      if (start === true && hasStarted === false) {
        const logResult = logEvent(EventNames.SCROLL_STARTED)
        if (onScrollStarted !== undefined) onScrollStarted(logResult)
        hasStarted = true
      }
      const documentHeight = document.body.scrollHeight
      const viewportHeight = window.innerHeight
      const scrolled = window.scrollY
      const scrollPercent = scrolled / (documentHeight - viewportHeight)
      if (half === true
        && hasReachedHalf === false
        && scrollPercent > .5) {
        const logResult = logEvent(EventNames.SCRLLGNGN_HALF_REACHED)
        if (onHalfReached !== undefined) onHalfReached(logResult)
        hasReachedHalf = true
      }
      if (end === true
        && hasReachedEnd === false
        && scrollPercent > .97) {
        const logResult = logEvent(EventNames.SCRLLGNGN_END_REACHED)
        if (onEndReached !== undefined) onEndReached(logResult)
        hasReachedEnd = true
      }
    }
    window.addEventListener('scroll', scrollListener)
  }

  // CSS
  if (css !== undefined) {
    const { onCssInjected } = hooks ?? {}
    const key = injectCssRule(css, 'css-from-config')
    if (onCssInjected !== undefined) onCssInjected(key, css)
  }

  // SCALES
  if (scales !== undefined) {
    const {
      onScalesAdded,
      onScaleAdditionFailure
    } = hooks ?? {}
    
    const scalesData = scales.map(scaleDescriptorStr => {
      return scaleDescriptorStr
        .split(',')
        .map(e => e.trim())
        .map(scaleInstructionStr => {
          const [name, strValue] = scaleInstructionStr
            .split(':')
            .map(e => e.trim())
          return { name, strValue }
        }).reduce((acc, curr) => {
          const { name, strValue } = curr
          acc[name] = strValue
          return acc
        }, {} as Record<string, string>)
    })
    
    const scaleDescriptors = scalesData.map(scaleDescriptorPartial => {
      // name
      const name = scaleDescriptorPartial['name'] as string|undefined
      if (name === undefined || !name.match(/^[a-z]([a-z0-9\-\_]*[a-z0-9])?$/)) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Name property is missing or invalid in scale descriptor (${name})`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }

      // root
      const root = scaleDescriptorPartial['root'] as string|undefined ?? '.lm-app'
      
      // bounds
      const [lowBoundStr, highBoundStr] = (scaleDescriptorPartial['bounds'] ?? '')
        .split(/\s+/)
        .map(e => e.trim())
      if (lowBoundStr === undefined || highBoundStr === undefined) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: low and high bounds should be specified. Found: ${lowBoundStr} and ${highBoundStr}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }
      const lowBound = toNumber(lowBoundStr)
      const highBound = toNumber(highBoundStr)
      if (Number.isNaN(lowBound) || Number.isNaN(highBound)) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: low and high bounds should be valid numbers. Found: ${lowBound} and ${highBound}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }

      // breakpoints
      const breakpointsStr = (scaleDescriptorPartial['breakpoints'] ?? '').trim()
      const breakpoints = toNumber(breakpointsStr)
      if (Number.isNaN(breakpoints)
        || !Number.isInteger(breakpoints)
        || breakpoints < 2) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: breakpoints should be specified and a valid, greater than 1 integer. Found: ${breakpointsStr}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }

      // lowLevel
      const [lowLevelMinStr, lowLevelMaxStr] = (scaleDescriptorPartial['low'] ?? '')
        .split(/\s+/)
        .map(e => e.trim())
      if (lowLevelMinStr === undefined || lowLevelMaxStr === undefined) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: low level values should be specified. Found: ${lowLevelMinStr} and ${lowLevelMaxStr}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }
      const lowLevelMin = toNumber(lowLevelMinStr)
      const lowLevelMax = toNumber(lowLevelMaxStr)
      if (Number.isNaN(lowLevelMin) || Number.isNaN(lowLevelMax)) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: low level values should be valid numbers. Found: ${lowLevelMin} and ${lowLevelMax}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }

      // highLevel
      const [highLevelMinStr, highLevelMaxStr] = (scaleDescriptorPartial['high'] ?? '')
        .split(/\s+/)
        .map(e => e.trim())
      if (highLevelMinStr === undefined || highLevelMaxStr === undefined) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: low level values should be specified. Found: ${highLevelMinStr} and ${highLevelMaxStr}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }
      const highLevelMin = toNumber(highLevelMinStr)
      const highLevelMax = toNumber(highLevelMaxStr)
      if (Number.isNaN(highLevelMin) || Number.isNaN(highLevelMax)) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: low level values should be valid numbers. Found: ${highLevelMin} and ${highLevelMax}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }

      // levels
      const levelsStr = (scaleDescriptorPartial['levels'] ?? '').trim()
      const levels = toNumber(levelsStr)
      if (Number.isNaN(levels)
        || !Number.isInteger(levels)
        || levels < 2) {
        if (onScaleAdditionFailure !== undefined) {
          const message = `Scale ${name}: levels should be specified and a valid, greater than 1 integer. Found: ${levelsStr}`
          onScaleAdditionFailure(message, scaleDescriptorPartial)
        }
        return
      }

      return {
        name, root,
        lowBound, highBound, breakpoints,
        lowLevelMin, lowLevelMax,
        highLevelMin, highLevelMax,
        levels
      }
    })

    // [WIP] this should probably be in ~/utils/responsive-harmonics
    const scalesDetails = scaleDescriptors.map(scaleDescriptor => {
      if (scaleDescriptor === undefined) return
      const {
        name, root,
        lowBound, highBound, breakpoints,
        lowLevelMin, lowLevelMax,
        highLevelMin, highLevelMax,
        levels
      } = scaleDescriptor
      const breakpointSize = (highBound - lowBound) / (breakpoints - 1)
      return {
        name,
        root,
        breakpoints: new Array(breakpoints)
          .fill(null)
          .map((_, breakpointNbr) => breakpointNbr)
          .map(breakpointNbr => {
            const breakpoint = Math.round(lowBound + breakpointNbr * breakpointSize)
            const breakpointRatio = ratio(breakpoint, lowBound, highBound)
            const lowLevel = interpolate(breakpointRatio, lowLevelMin, lowLevelMax)
            const highLevel = interpolate(breakpointRatio, highLevelMin, highLevelMax)
            const highOverLow = highLevel / lowLevel
            const oneOverLevels = 1 / (levels - 1)
            const factor = Math.pow(highOverLow, oneOverLevels)
            return {
              width: breakpoint,
              levels: new Array(levels)
                .fill(null)
                .map((_, level) => level)
                .map(level => {
                  const value = roundNumbers(lowLevel * Math.pow(factor, level), 2)
                  return value
              })
            }
          })
      }
    })

    const scalesCss = scalesDetails.map(scaleDetail => {
      if (scaleDetail === undefined) return
      const { name, root, breakpoints } = scaleDetail
      let outputCss = ``
      const identifier = `--${name}`
      breakpoints.forEach(({ width, levels }, breakpointPos) => {
        if (breakpointPos === 0) { outputCss += `${root} {\n` }
        else { outputCss += `@media (min-width: ${width}px) {\n  ${root} {\n` }
        levels.forEach((value, levelPos) => {
          if (breakpointPos === 0) { outputCss += `  ${identifier}-level-${levelPos + 1}: ${value}px;\n` }
          else { outputCss += `    ${identifier}-level-${levelPos + 1}: ${value}px;\n` }
        })
        if (breakpointPos === 0) { outputCss += `}\n` }
        else { outputCss += `  }\n}\n` }
      })
      return outputCss
    })
    if (onScalesAdded !== undefined) onScalesAdded(/* [WIP] */)
    injectCssRule(scalesCss.join(''), 'lm-scales')
  }
}
