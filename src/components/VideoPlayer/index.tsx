import { Component, VNode } from 'preact'
import * as Bem from '@design-edito/tools/agnostic/css/bem';
import Icon, { Icons } from '../Icon';
import MutedVideo from './MutedVideo';
import Disclaimer, { Props as DisclaimerProps } from '../Disclaimer';

export type Props = {
    source?: string,
    sourceMobile?: string,
    mobileDesktopThreshold?: number,
    title?: string | VNode,
    kicker?: string | VNode,
    poster_url?: string,
    legend?: string | VNode,
    credits?: string | VNode,
    loop?: boolean;
    autoplay?: boolean;
    sound?: boolean;
    sound_controls?: boolean
    play_controls?: boolean
    time_controls?: boolean
    disclaimer_text?: DisclaimerProps['text']
    disclaimer_button?: DisclaimerProps['buttonText']
}

export type State = {
    isPlaying: boolean,
    isMuted: boolean,
}

export default class VideoPlayer extends Component<Props, State> {
    static clss: string = 'lm-video'
    $video: HTMLVideoElement|null = null
    $root: HTMLElement|null = null
    $timeline: HTMLElement|null = null
    $playPauseControl: HTMLElement|null = null
    $soundControl: HTMLElement|null = null

    clss = VideoPlayer.clss
    bemClss = Bem.bem('lm-video')

    state: State = {
        isPlaying: false,
        isMuted: true,
    }

    componentDidMount(): void {
        this.addListeners();

        this.toggleIsPlaying();
        this.toggleIsMuted();

        this.handleDisclaimer();
    }

    addListeners() {
        if (this.$video === null) return
        this.$video.addEventListener('timeupdate', this.onTimeUpdate)
        this.$video.addEventListener('play', this.toggleIsPlaying)
        this.$video.addEventListener('pause', this.toggleIsPlaying)
        this.$video.addEventListener('volumechange', this.toggleIsMuted)
        
        if (this.$timeline) {
            this.$timeline.addEventListener('click', this.onClickTimeline)
        }
        if (this.$playPauseControl) {
            this.$playPauseControl.addEventListener('click', this.togglePlay)
        }
        if (this.$soundControl) {
            this.$soundControl.addEventListener('click', this.onClickSound)
        }
    }
    
    removeListeners() {
        if (this.$video === null) return
        this.$video.removeEventListener('timeupdate', this.onTimeUpdate)
        this.$video.removeEventListener('play', this.toggleIsPlaying)
        this.$video.removeEventListener('pause', this.toggleIsPlaying)
        this.$video.removeEventListener('volumechange', this.toggleIsMuted)

        if (this.$timeline) {
            this.$timeline.removeEventListener('click', this.onClickTimeline)
        }
        if (this.$playPauseControl) {
            this.$playPauseControl.removeEventListener('click', this.togglePlay)
        }
        if (this.$soundControl) {
            this.$soundControl.removeEventListener('click', this.onClickSound)
        }
    }

    onTimeUpdate = (e: Event) =>  {
        if (this.$timeline === null || this.$video === null) return
        const progress = (this.$video.currentTime / this.$video.duration)
        this.$timeline.style.setProperty('--progress', progress.toFixed(2));
    }

    toggleIsMuted = () => {
        if (this.$video === null) return
        this.setState({
            isMuted: this.$video.muted
        })
    }

    onClickSound = () => {
        if (this.$video === null) return
        this.$video.muted = !this.$video.muted;
    }

    toggleIsPlaying = () => {
        if (this.$video === null) return
        this.setState({
            isPlaying: !this.$video.paused
        })
    }

    togglePlay = () => {
        if (!this.$video) { return; }
         if (this.$video.paused) {
            this.$video.play();
            return;
        }
        this.$video.pause();
    }

    handleDisclaimer = () => {
        if (!this.$video) { return; }
        if (this.props.disclaimer_text || this.props.disclaimer_button) {
            this.$video.pause();
        }
    }

    onDismissDisclaimer = () => {
        if (!this.$video || !this.props.autoplay || !this.$video.paused) { return; }
        this.$video.currentTime = 0;
        this.$video.play();
    }

    onClickTimeline = (e: MouseEvent) => {
        if (!e || !this.$video) { return; }
        const clientX = e.clientX;
        const position = this.$timeline?.getBoundingClientRect();
        
        if (!position) { return; }
        const progress = Math.min(Math.max(0, (clientX - position.left) / position.width), 1);

        this.$video.currentTime = progress * this.$video.duration;
    }
    
    render() {
        const { props, state, bemClss } = this
        const displayCaption = props.credits !== undefined || props.legend !== undefined;
        const displayBottomBar = props.play_controls || props.time_controls;
        
        const wrapperClasses = [bemClss.elt('wrapper').value]
        const videoClasses = [bemClss.elt('video').value]
        const captionClasses = [bemClss.elt('caption').value]
        const creditsClasses = [bemClss.elt('credits').value]
        
        const lmClasses = [bemClss.mod(state.isPlaying ? 'playing' : '').mod(state.isMuted ? 'muted' : '')]
        const overlayClasses = [bemClss.elt('overlay').value]
        const overlayTextClasses = [bemClss.elt('overlay-text').value]

        const titleClasses = [bemClss.elt('title').value]
        const kickerClasses = [bemClss.elt('kicker').value]
        
        const bottomBarClasses = [bemClss.elt('bottom-bar').value]

        const playControlsClasses = [bemClss.elt('play-controls').value]
        const playControlsPauseButtonClasses = [bemClss.elt('play-controls-pause').value]
        const playControlsPlayButtonClasses = [bemClss.elt('play-controls-play').value]
        const timelineClasses = [bemClss.elt('timeline').value]
        const timelineProgressClasses = [bemClss.elt('timeline-progress-bar').value]

        const soundControlsClasses = [bemClss.elt('sound-controls').value]
        const soundControlMuteButtonClasses = [bemClss.elt('sound-controls-mute').value]
        const soundControlUnmuteButtonClasses = [bemClss.elt('sound-controls-unmute').value]

        const videoProps = {
            ...(props.sound ? {} : { muted: true }),
            ...(props.autoplay ? { autoplay: props.autoplay } : {}),
            ...(props.loop ? { loop: props.loop } : {}),
        };

        const isMobile = window.innerWidth < (props.mobileDesktopThreshold || 768)
        const source = isMobile
            ? (props.sourceMobile ?? props.source)
            : props.source

        return (
            <figure className={lmClasses.join(' ')} ref={n => { this.$root = n }}>
                <div className={wrapperClasses.join(' ')}>
                    <MutedVideo
                        className={videoClasses.join(' ')}
                        playsInline
                        poster={props.poster_url}
                        onRender={n => { this.$video = n }}
                        onClick={this.togglePlay}
                        {...videoProps}>
                        {source && <source src={source} />}
                    </MutedVideo>
                    <div className={overlayClasses.join(' ')}>
                        <div className={overlayTextClasses.join(' ')}>
                            {props.title &&  <div className={titleClasses.join(' ')}>{props.title}</div>}
                            {props.kicker &&  <div className={kickerClasses.join(' ')}>{props.kicker}</div>}
                        </div>

                        {props.sound_controls && 
                            <div className={soundControlsClasses.join(' ')} ref={n => { this.$soundControl = n }}>
                                <Icon file={Icons.SOUND} className={soundControlMuteButtonClasses.join(' ')} />
                                <Icon file={Icons.MUTED} className={soundControlUnmuteButtonClasses.join(' ')} />
                            </div>
                        }

                        { displayBottomBar && 
                            <div className={bottomBarClasses.join(' ')}>
                                {props.play_controls && 
                                    <button className={playControlsClasses.join(' ')} ref={n => { this.$playPauseControl = n }}>
                                        <Icon file={Icons.PLAY} className={playControlsPauseButtonClasses.join(' ')} />
                                        <Icon file={Icons.PAUSE} className={playControlsPlayButtonClasses.join(' ')}  />
                                    </button>
                                }
                                {props.time_controls && 
                                    <div className={timelineClasses.join(' ')} ref={n => { this.$timeline = n }}>
                                        <div className={timelineProgressClasses.join(' ')}></div>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                    <Disclaimer 
                        text={props.disclaimer_text}
                        buttonText={props.disclaimer_button}
                        onDismiss={this.onDismissDisclaimer}
                    />
                </div>

                {displayCaption && 
                    <figcaption className={captionClasses.join(' ')}>
                        <p>
                            {props.legend} <span className={creditsClasses.join(' ')}>{props.credits}</span>
                        </p>
                    </figcaption>
                }
            </figure>
        )
    }
}
