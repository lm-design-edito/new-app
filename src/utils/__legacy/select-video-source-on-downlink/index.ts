export interface Source {
  height: number
  url?: string
}

export interface Options {
  ratio?: number
  bitSize?: number
  fps?: number
  compressionRatio?: number
  availableDownlinkRatio?: number
}

export default function selectVideoSourceOnDownLink (
  _sources: Source[],
  downlink: number,
  _options: Options = {}): string|undefined {
  const options = {
    ratio: 1.78,
    bitSize: 3,
    fps: 25,
    compressionRatio: 0.0065,
    availableDownlinkRatio: 1,
    ..._options
  }
  const sources = _sources.filter(source => source.url !== 'undefined')
  const sourcesWithMeta = sources.map(source => {
    const sourceWidth = source.height * options.ratio
    const pixelCount = source.height * sourceWidth
    const uncompressedFrameSize = pixelCount * options.bitSize
    const compressedFrameSize = uncompressedFrameSize * options.compressionRatio
    const compressedSecondSize = compressedFrameSize * options.fps
    return {
      ...source,
      second_bit_size: compressedSecondSize
    }
  })
  const availableDownlink = downlink * options.availableDownlinkRatio * 10e5
  const underLimitSources = sourcesWithMeta.filter(source => source.second_bit_size <= availableDownlink)
  const overLimitSources = sourcesWithMeta.filter(source => source.second_bit_size > availableDownlink)
  const maxUnderLimitSecondBitSize = Math.max(...underLimitSources.map(source => source.second_bit_size))
  const minOverLimitSecondBitSize = Math.min(...overLimitSources.map(source => source.second_bit_size))
  const bestUnderLimitSource = underLimitSources.find(source => source.second_bit_size === maxUnderLimitSecondBitSize)
  const bestOverLimitSource = overLimitSources.find(source => source.second_bit_size === minOverLimitSecondBitSize)
  const returned = bestUnderLimitSource?.url ?? bestOverLimitSource?.url
  return returned
}
