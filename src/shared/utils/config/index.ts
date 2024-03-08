import { Analytics } from '~/shared/analytics'
import { Darkdouille } from '~/shared/darkdouille'
import { Events } from '~/shared/events'
import { Externals } from '~/shared/externals'
import { Globals } from '~/shared/globals'
import { Slots } from '~/shared/slots'
import { toString, toNumber, toBoolean } from '~/utils/cast'
import interpolate, { ratio } from '~/utils/interpolate'
import roundNumbers from '~/utils/round-numbers'

export namespace Config {
  export enum InlineOnlyInstructionName {
    ID = 'id',
    PUBLISHED_ON = 'publishedOn',
    SOURCE = 'source'
  }
  
  export enum RemoteInstructionName {
    HIDE_HEADER = 'hideHeader',
    TRACKING = 'tracking',
    CSS = 'css',
    STYLESHEET = 'stylesheet',
    SCALE = 'scale',
    HANDLERS_FILE = 'handlersFile'
  }

  export type ConfigInstruction = {
    name: string,
    [key: string]: Darkdouille.TreeValue
  }

  export function apply (instructions: ConfigInstruction[]) {
    const logger = Globals.retrieve(Globals.GlobalKey.LOGGER)
    logger?.log('Apply config', '%cInput', 'font-weight: 800;', instructions)
    instructions.forEach(({ name, value }) => {
      // ID
      if (name === InlineOnlyInstructionName.ID) {
        return Externals.setPageIdAttribute(toString(value))
      }
      
      // HIDE_HEADER
      if (name === RemoteInstructionName.HIDE_HEADER) {
        const shouldHide = toBoolean(value)
        const headerElements = Externals.setLeMondeHeaderVisibility(shouldHide)
        logger?.log('Apply config', shouldHide ? '%cHeader hidden' : '%cHeader displayed', 'font-weight: 800', headerElements)
        return
      }
      
      // TRACKING
      if (name === RemoteInstructionName.TRACKING) {
        // [WIP] if multiple tracking instructions, this logic
        // does not stand (listeners gonna stack on top of each other)
        const valueIsArray = Array.isArray(value)
        if (!valueIsArray) return;
        enum TrackingOptions {
          START_SCROLL = 'start-scroll',
          HALF_REACHED = 'half-reached',
          END_REACHED = 'end-reached'
        }
        const validValues = value
          .map(item => toString(item).trim())
          .filter(item => Object.values(TrackingOptions).includes(item as any))
        let hasStarted = false
        let hasReachedHalf = false
        let hasReachedEnd = false
        const trackStart = validValues.includes(TrackingOptions.START_SCROLL)
        const trackHalf = validValues.includes(TrackingOptions.HALF_REACHED)
        const trackEnd = validValues.includes(TrackingOptions.END_REACHED)
        const scrollListener = () => {
          if (trackStart && !hasStarted) {
            const event = Analytics.EventNames.SCRLLGNGN_HALF_REACHED
            Analytics.logEvent(event)
            hasStarted = true
            logger?.log('Tracking', 'Scroll started')
          }
          const documentHeight = document.body.scrollHeight
          const viewportHeight = window.innerHeight
          const scrolled = window.scrollY
          const scrollPercent = scrolled / (documentHeight - viewportHeight)
          if (trackHalf && !hasReachedHalf && scrollPercent > .5) {
            const event = Analytics.EventNames.SCRLLGNGN_HALF_REACHED
            Analytics.logEvent(event)
            hasReachedHalf = true
            logger?.log('Tracking', 'Half reached')
          }
          if (trackEnd && !hasReachedEnd && scrollPercent > .9) {
            // [WIP] better way to detect end than > .9 ?
            const event = Analytics.EventNames.SCRLLGNGN_END_REACHED
            Analytics.logEvent(event)
            hasReachedEnd = true
            logger?.log('Tracking', 'End reached')
          }
        }
        logger?.log('Apply config', '%cTracking', 'font-weight: 800;', '– scroll listener attached')
        return window.setTimeout(() => window.addEventListener('scroll', scrollListener), 200) // [WIP] maybe throttle this ?
      }
      
      // CSS
      if (name === RemoteInstructionName.CSS) {
        let injected = '\n'
        if (value instanceof NodeList) {
          const styleElements = [...value].filter((node): node is HTMLStyleElement => {
            if (!(node instanceof HTMLElement)) return false;
            if (node.tagName.toLowerCase() !== 'style') return false;
            return true
          })
          injected += styleElements.map(elt => elt.textContent?.trim()).join('\n')
        } else {
          injected += toString(value)
        }
        Slots.injectStyles('css', injected, {
          name: 'lm-page-config-css',
          position: Slots.StylesPositions.CUSTOM
        })
        return logger?.log('Apply config', '%cCSS injected\n', 'font-weight: 800;', injected)
      }

      // STYLESHEET
      if (name === RemoteInstructionName.STYLESHEET) {
        const strValue = toString(value)
        Slots.injectStyles('url', strValue, {
          name: 'lm-page-config-stylesheet',
          position: Slots.StylesPositions.CUSTOM
        })
        return logger?.log('Apply config', '%cStylesheet injected\n', 'font-weight: 800;', strValue)
      }
      
      // SCALE
      if (name === RemoteInstructionName.SCALE) {
        const valueIsRecord = Darkdouille.valueIsRecord(value)
        if (!valueIsRecord) return
        const name = toString(value.name)
        const root = value.root !== undefined ? toString(value.root) : ':host'
        const bounds = Array.isArray(value.bounds)
          ? value.bounds.map(val => toNumber(val))
          : undefined
        const breakpoints = toNumber(value.breakpoints)
        const low = Array.isArray(value.low)
          ? value.low.map(val => toNumber(val))
          : undefined
        const high = Array.isArray(value.high)
          ? value.high.map(val => toNumber(val))
          : undefined
        const levels = toNumber(value.levels)
        const nameRegexp = /^[a-z]([a-z0-9\-\_]*[a-z0-9])?$/
        const isValid = nameRegexp.test(name)
          && bounds !== undefined
          && low !== undefined
          && high !== undefined
        if (!isValid) return;
        const [lowBound, highBound] = bounds
        const [lowLevelMin, lowLevelMax] = low
        const [highLevelMin, highLevelMax] = high
        if (lowBound === undefined
          || highBound === undefined
          || lowLevelMin === undefined
          || lowLevelMax === undefined
          || highLevelMin === undefined
          || highLevelMax === undefined) return;
        const scaleIdentifier = `--${name}`
        const breakpointSize = (highBound - lowBound) / (breakpoints - 1)
        const scaleCss = new Array(breakpoints)
          .fill(null)
          .map((_, breakpointPos) => breakpointPos)
          .map(breakpointPos => {
            const threshold = Math.round(lowBound + breakpointPos * breakpointSize)
            const thresholdRatio = ratio(threshold, lowBound, highBound)
            const lowLevel = interpolate(thresholdRatio, lowLevelMin, lowLevelMax)
            const highLevel = interpolate(thresholdRatio, highLevelMin, highLevelMax)
            const highOverLow = highLevel / lowLevel
            const oneOverLevels = 1 / levels
            const factor = Math.pow(highOverLow, oneOverLevels)
            return {
              minWidth: threshold,
              levels: new Array(levels + 1)
                .fill(null)
                .map((_, level) => level)
                .map(level => roundNumbers(lowLevel * Math.pow(factor, level), 2))
            }
          })
          .map(({ minWidth, levels }, breakpointPos) => {
            let thisBreakpointCss = ''
            const isFirstBreakpoint = breakpointPos === 0
            if (isFirstBreakpoint) { thisBreakpointCss += `${root}{` }
            else { thisBreakpointCss += `@media (min-width:${minWidth}px){${root}{` }
            levels.forEach((value, levelPos) => {
              thisBreakpointCss += `${scaleIdentifier}-level-${levelPos}:${value}px;`
            })
            if (isFirstBreakpoint) { thisBreakpointCss += `}` }
            else { thisBreakpointCss += `}}` }
            return thisBreakpointCss
          }).join('')
          Slots.injectStyles('css', scaleCss, {
            name: 'lm-page-config-scale',
            position: Slots.StylesPositions.CUSTOM
          })
          logger?.log(
            'Apply config',
            `%cScale created – ${name}\n`,
            'font-weight: 800;',
            `\n${scaleCss.trim()}`
          )
      }
      
      // HANDLERS_FILE
      if (name === RemoteInstructionName.HANDLERS_FILE) Events.fetchAndRegister(toString(value))
    })
  }
}
