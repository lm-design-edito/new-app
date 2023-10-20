import * as Cast from '~/utils/cast'
import getHeaderElements from '~/shared/lm-get-header-element'
import { Darkdouille } from '../darkdouille'
import { Analytics } from '../lm-analytics'
import { injectCssRule } from '~/utils/dynamic-css'
import interpolate, { ratio } from '~/utils/interpolate'
import roundNumbers from '~/utils/round-numbers'
import Logger from '~/utils/silent-log'

export namespace PageConfig {
  export enum InlineOnlyInstructionName {
    ID = 'id',
    PUBLISHED_ON = 'publishedOn',
    SOURCE = 'source'
  }
  
  export enum RemoteInstructionName {
    HIDE_HEADER = 'hideHeader',
    TRACKING = 'tracking',
    CSS = 'css',
    SCALE = 'scale',
    ADD_SLOTS = 'addSlot', // [WIP] remove from config, move in SLOTS
    CUSTOM_FONTS = 'customFonts' // [WIP] remove this too
  }

  export type ConfigInstruction = {
    name: string,
    [key: string]: Darkdouille.TreeValue
  }

  export function apply (instructions: ConfigInstruction[], logger?: Logger) {
    instructions.forEach(({ name, value }) => {
      // ID
      if (name === InlineOnlyInstructionName.ID) return document.body.classList.add(Cast.toString(value))
      // HIDE_HEADER
      if (name === RemoteInstructionName.HIDE_HEADER) {
        const headerElements = getHeaderElements() ?? []
        const shouldHide = Cast.toBoolean(value)
        headerElements.forEach(elt => {
          const element = elt as HTMLElement
          if (!shouldHide) {
            element.style.opacity = ''
            element.style.visibility = ''
            element.style.display = ''
            element.style.pointerEvents = ''
            element.style.userSelect = ''
          } else {
            element.style.opacity = '0'
            element.style.visibility = 'collapse'
            element.style.display = 'none'
            element.style.pointerEvents = 'none'
            element.style.userSelect = 'none'
          }
        })
        if (shouldHide) logger?.log('Apply config', 'Header hidden', headerElements)
        else logger?.log('Apply config', 'Header displayed', headerElements)
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
          .map(item => Cast.toString(item).trim())
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
            logger?.log('Apply config', 'Tracking / scroll started')
          }
          const documentHeight = document.body.scrollHeight
          const viewportHeight = window.innerHeight
          const scrolled = window.scrollY
          const scrollPercent = scrolled / (documentHeight - viewportHeight)
          if (trackHalf && !hasReachedHalf && scrollPercent > .5) {
            const event = Analytics.EventNames.SCRLLGNGN_HALF_REACHED
            Analytics.logEvent(event)
            hasReachedHalf = true
            logger?.log('Apply config', 'Tracking / half reached')
          }
          if (trackEnd && !hasReachedEnd && scrollPercent > .9) {
            // [WIP] better way to detect end than > .9 ?
            const event = Analytics.EventNames.SCRLLGNGN_END_REACHED
            Analytics.logEvent(event)
            hasReachedEnd = true
            logger?.log('Apply config', 'Tracking / end reached')
          }
        }
        logger?.log('Apply config', 'Tracking / scroll listener attached')
        return window.setTimeout(
          () => window.addEventListener('scroll', scrollListener),
          200
        )
      }
      // CSS
      if (name === RemoteInstructionName.CSS) {
        let injected = '\n'
        if (value instanceof NodeList) {
          const styleElements = [...value].filter((node): node is HTMLStyleElement => {
            if (!(node instanceof HTMLElement)) return false;
            const element = node
            if (element.tagName.toLowerCase() !== 'style') return false;
            return true
          })
          const styleStr = styleElements
            .map(elt => elt.textContent?.trim())
            .join('\n')
          injected += styleStr
        }
        injectCssRule(injected, 'lm-page-config-css')
        logger?.log('Apply config', 'CSS / injected', injected)
      }
      // SCALE
      if (name === RemoteInstructionName.SCALE) {
        const valueIsRecord = Darkdouille.valueIsRecord(value)
        if (!valueIsRecord) return
        const name = Cast.toString(value.name)
        const root = value.root !== undefined ? Cast.toString(value.root) : ':root'
        const bounds = Array.isArray(value.bounds)
          ? value.bounds.map(val => Cast.toNumber(val))
          : undefined
        const breakpoints = Cast.toNumber(value.breakpoints)
        const low = Array.isArray(value.low)
          ? value.low.map(val => Cast.toNumber(val))
          : undefined
        const high = Array.isArray(value.high)
          ? value.high.map(val => Cast.toNumber(val))
          : undefined
        const levels = Cast.toNumber(value.levels)
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
            const oneOverLevels = 1 / (levels - 1)
            const factor = Math.pow(highOverLow, oneOverLevels)
            return {
              minWidth: threshold,
              levels: new Array(levels)
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
              thisBreakpointCss += `${scaleIdentifier}-level-${levelPos + 1}:${value}px;`
            })
            if (isFirstBreakpoint) { thisBreakpointCss += `}` }
            else { thisBreakpointCss += `}}` }
            return thisBreakpointCss
          }).join('')
          injectCssRule(scaleCss, 'lm-page-scale')
          logger?.log('Apply config', `Scale / created: ${name}`, `\n${scaleCss.trim()}`)
      }
    })
  }
}
