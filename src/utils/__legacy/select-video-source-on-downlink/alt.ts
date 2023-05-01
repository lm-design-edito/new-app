type SourceObj = {
  source: string
  height: number
}

type SourceWithBitRateObj = SourceObj & {
  bitRate: number
}

type Options = {
  downlink?: number
  imageRatio?: number
  framePxToMbps?: number
}

const downlink = (window as any)?.navigator?.connection?.downlink ?? 2.5
const VIDEO_RATIO = 1920 / 1080
const FRAME_PIXELS_TO_MBPS_HACKY_CONSTANT = 3 / (1000 * 1000)

function estimateBitRate (videoHeight: number, options?: Options) {
  const nbPxPerFrame = videoHeight * videoHeight * (options?.imageRatio ?? VIDEO_RATIO)
  const mbps = nbPxPerFrame * (options?.framePxToMbps ?? FRAME_PIXELS_TO_MBPS_HACKY_CONSTANT)
  return mbps
}

export default function chooseVideoSource (sourcesObj: SourceObj[], options?: Options) {
  const sourcesWithBitRate: SourceWithBitRateObj[] = sourcesObj.map(sourceObj => ({
    ...sourceObj,
    bitRate: estimateBitRate(sourceObj.height, options)
  }))
  const underDownlink = sourcesWithBitRate.filter(sourceObj => sourceObj.bitRate <= (options?.downlink ?? downlink))
  const overDownlink = sourcesWithBitRate.filter(sourceObj => sourceObj.bitRate > (options?.downlink ?? downlink))
  const highestUnder = underDownlink.reduce((acc: SourceWithBitRateObj|null, curr: SourceWithBitRateObj) => {
    if (acc === null) return curr
    if (curr.bitRate > acc.bitRate) return curr
    return acc
  }, null)
  const lowestOver = overDownlink.reduce((acc: SourceWithBitRateObj|null, curr: SourceWithBitRateObj) => {
    if (acc === null) return curr
    if (curr.bitRate < acc.bitRate) return curr
    return acc
  }, null)
  if (highestUnder !== undefined && highestUnder !== null) return highestUnder.source
  if (lowestOver !== undefined && lowestOver !== null) return lowestOver.source
  return null
}
