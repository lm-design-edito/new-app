import isProduction from '~/shared-utils/lm-production-env-detect'

if (!isProduction) console.warn('[message hidden in production] This detection is likely to break some day, use it sparingly')

const regexp = /apps.([a-z]+\-)?lemonde.(fr|io)/

export default function isInAec() {
  return window
    .location
    .href
    .match(regexp)
}
