import { Component } from 'preact'
import { BlockContext } from '..'
import HtmlBlockRenderer from './HtmlBlockRenderer'
import ModuleBlockRenderer from './ModuleBlockRenderer'
// [WIP] Scrllgngn should not implement StopMotion like this
import StopMotion from '~/components/StopMotion'

type Props = {
  type?: 'module' | 'html'
  content?: string
  context?: BlockContext
  cssLoader?: (url: string) => Promise<void>
}

export default class BlockRenderer extends Component<Props> {
  render() {
    const { props } = this
    const { type, content, context, cssLoader } = props
    switch (type) {
      case 'html':
      case undefined: return <HtmlBlockRenderer content={content} />
      case 'module':
        const stopMotionDetectionRegexp = /^\[\[STOP-MOTION\]\]/
        if (content?.match(stopMotionDetectionRegexp)) {
          const stopMotionPropsStr = content
            .replace(stopMotionDetectionRegexp, '')
            .trim()
          const stopMotionProps = {
            length: 1,
            startIndex: 0,
            padding: 0,
            mobilePadding: undefined,
            urlTemplate: 'https://lemonde.fr/img-{%}.jpg'
          }
          try {
            const parsed = JSON.parse(stopMotionPropsStr)
            if (parsed === null) break;
            if (typeof parsed !== 'object') break;
            if (Array.isArray(parsed)) break;
            if (typeof parsed.length === 'number') stopMotionProps.length = parsed.length
            if (typeof parsed.padding === 'number') stopMotionProps.padding = parsed.padding
            if (typeof parsed.mobilePadding === 'number') stopMotionProps.mobilePadding = parsed.mobilePadding
            if (typeof parsed.startIndex === 'number') stopMotionProps.startIndex = parsed.startIndex
            if (typeof parsed.urlTemplate === 'string') stopMotionProps.urlTemplate = parsed.urlTemplate
          } catch (err) {
            console.warn(err)
          }

          const progression = context?.progression

          // [WIP] passer padding et mobilePadding en variables css 
          // et assigner une classe au wrapper en fonction de
          // window.innerWidth > 1025 ?
          const padding = window.innerWidth < 1025
            && stopMotionProps.mobilePadding != undefined 
            ? stopMotionProps.mobilePadding 
            : stopMotionProps.padding

          const width = context?.width ? (context?.width - padding * 2) : context?.width
          const height = context?.height ? (context?.height - padding * 2) : context?.height

          const images = new Array(stopMotionProps.length).fill(null).map((e, pos) => {
            const { startIndex, urlTemplate } = stopMotionProps
            return urlTemplate.replace('{%}', `${pos + startIndex}`)
          })

          return <StopMotion
            images={images}
            height={height}
            width={width}
            progression={progression} />
        }
        return <ModuleBlockRenderer
          url={content}
          context={context}
          cssLoader={cssLoader} />
      default: return <></>
    }
  }
}
