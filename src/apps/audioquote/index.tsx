import { Apps } from '~/apps'
import { Events } from '~/shared/events'
import { toString, toBoolean, toNumberArr } from '~/utils/cast'
import isRecord from '~/utils/is-record'
import AudioQuote, { Props, State } from '~/components/AudioQuote'
import recordFormat from '~/utils/record-format'

export { Props, State }

export default async function renderer (unknownProps: unknown, id: string): ReturnType<Apps.AsyncRendererModule<Props>> {
  const props = await toProps(unknownProps, id)
  return { props, Component: AudioQuote }
}
 
async function toProps (input: unknown, id: string): Promise<Props> {
  if (!isRecord(input)) return {}
  const props: Props = await recordFormat(input, {
    customClass: (i: unknown) => i !== undefined ? toString(i) : undefined,
    audioSrc: (i: unknown) => i !== undefined ? toString(i) : undefined,
    subsSrc: (i: unknown) => i !== undefined ? toString(i) : undefined,
    subsGroups: (i: unknown) => i !== undefined ? toNumberArr(i) : undefined,
    autoPlayWhenVisible: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    autoPauseWhenVisible: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    autoLoudWhenVisible: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    autoMuteWhenHidden: (i: unknown) => i !== undefined ? toBoolean(i) : undefined,
    title: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    playButton: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    pauseButton: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    loudButton: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    muteButton: (i: unknown) => i !== undefined ? Apps.toStringOrVNodeHelper(i) : undefined,
    hidePauseButton: toBoolean,
    // Handlers
    onSubsLoad: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, subs?: string) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, subs },
          type: Events.Type.AUDIOQUOTE_ON_SUBS_LOAD,
          appId: id
        })
      }
    },
    onSubsError: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_SUBS_ERROR,
          appId: id
        })
      }
    },
    onAudioLoad: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_AUDIO_LOAD,
          appId: id
        })
      }
    },
    onAudioError: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_AUDIO_ERROR,
          appId: id
        })
      }
    },
    onTimeUpdate: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_TIME_UPDATE,
          appId: id
        })
      }
    },
    onStart: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_START,
          appId: id
        })
      }
    },
    onPlay: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_PLAY,
          appId: id
        })
      }
    },
    onStop: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_STOP,
          appId: id
        })
      }
    },
    onEnd: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_END,
          appId: id
        })
      }
    },
    onPause: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_PAUSE,
          appId: id
        })
      }
    },
    onLoud: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component },
          type: Events.Type.AUDIOQUOTE_ON_LOUD,
          appId: id
        })
      }
    },
    onMute: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component },
          type: Events.Type.AUDIOQUOTE_ON_MUTE,
          appId: id
        })
      }
    },
    onPlayClick: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_PLAY_CLICK,
          appId: id
        })
      }
    },
    onPauseClick: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_PAUSE_CLICK,
          appId: id
        })
      }
    },
    onLoudClick: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_LOUD_CLICK,
          appId: id
        })
      }
    },
    onMuteClick: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, error?: any) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, error },
          type: Events.Type.AUDIOQUOTE_ON_MUTE_CLICK,
          appId: id
        })
      }
    },
    onVisible: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, event?: IntersectionObserverEntry) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, event },
          type: Events.Type.AUDIOQUOTE_ON_VISIBLE,
          appId: id
        })
      }
    },
    onHidden: (i: unknown) => {
      if (!Array.isArray(i)) return undefined
      const handlers = i
        .map(e => Events.getRegisteredHandler(toString(e)))
        .filter((handler): handler is Events.HandlerFunc => handler !== undefined)
      return async (component?: AudioQuote, event?: IntersectionObserverEntry) => {
        Events.sequentialHandlersCall(handlers, {
          details: { component, event },
          type: Events.Type.AUDIOQUOTE_HIDDEN,
          appId: id
        })
      }
    }
  })
  return props
}
