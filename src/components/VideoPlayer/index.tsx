import { Component, VNode } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import Icon, { Icons } from '../Icon';

export type Props = {
    source?: string,
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
    sensitive_content?: boolean
    disclaimer_text?: string | VNode
    disclaimer_button?: string | VNode
}

export type State = {
    isPlaying: boolean,
    isDisclaimerVisible: boolean,
    isMuted: boolean,
}

export default class VideoPlayer extends Component<Props, State> {
    static clss: string = 'lm-video'
    $video: HTMLVideoElement|null = null
    $root: HTMLElement|null = null
    $timeline: HTMLElement|null = null
    $playPauseControl: HTMLElement|null = null
    $soundControl: HTMLElement|null = null
    $disclaimerButton: HTMLElement|null = null

    clss = VideoPlayer.clss
    bemClss = Bem.bem('lm-video')

    state: State = {
        isPlaying: false,
        isMuted: true,
        isDisclaimerVisible: this.props.sensitive_content || false
    }

    componentDidMount(): void {
        this.addListeners();

        this.toggleIsPlaying();
        this.toggleIsMuted();
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
        if (this.$disclaimerButton) {
            this.$disclaimerButton.addEventListener('click', this.dismissDisclaimer)
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
        if (this.$disclaimerButton) {
            this.$disclaimerButton.removeEventListener('click', this.dismissDisclaimer)
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

    dismissDisclaimer = () => {
        this.setState({
            isDisclaimerVisible: false
        })
        
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
        const displaySensitiveContent = props.sensitive_content;
        const displayBottomBar = props.play_controls || props.time_controls;
        
        const wrapperClasses = [bemClss.elt('wrapper').value]
        const videoClasses = [bemClss.elt('video').value]
        const captionClasses = [bemClss.elt('caption').value]
        const creditsClasses = [bemClss.elt('credits').value]
        
        const lmClasses = [bemClss.mod(state.isPlaying ? 'playing' : '').mod(state.isMuted ? 'muted' : '').mod(state.isDisclaimerVisible ? 'disclaimer-visible' : '').value]
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
        
        const disclaimerClasses = [bemClss.elt('disclaimer-overlay').value]
        const disclaimerTextClasses = [bemClss.elt('disclaimer-text').value]
        const disclaimerButtonClasses = [bemClss.elt('disclaimer-button').value]

        const videoProps = {
            ...(props.sound ? {} : { muted: true }),
            ...(props.autoplay ? { autoplay: props.autoplay } : {}),
            ...(props.loop ? { loop: props.loop } : {}),
        };
        
        return (
            <figure className={lmClasses.join(' ')} ref={n => { this.$root = n }}>
                <div className={wrapperClasses.join(' ')}>
                    <video poster={props.poster_url} className={videoClasses.join(' ')} ref={n => { this.$video = n }} {...videoProps}>
                        {props.source && <source src={props.source} />}
                    </video>
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
                    {displaySensitiveContent && 
                        <div className={disclaimerClasses.join(' ')}>
                            <div className={disclaimerTextClasses.join(' ')}>{props.disclaimer_text}</div>
                            <button className={disclaimerButtonClasses.join(' ')} ref={n => { this.$disclaimerButton = n }}>{props.disclaimer_button}</button>
                        </div>
                    }
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
