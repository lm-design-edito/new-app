import { Component, VNode } from 'preact'

export type Props = {
  targetUrl?: string
  imageSrc?: string
  imageAlt?: string
  contentAbove?: string | VNode
  contentBelow?: string | VNode
  contentLeft?: string | VNode
  contentRight?: string | VNode
  contentOverlay?: string | VNode
  onClick?: (e: Event) => void
}

export default class Thumb extends Component<Props> {
  render () {
    const {
      targetUrl,
      imageSrc,
      imageAlt,
      contentAbove,
      contentBelow,
      contentLeft,
      contentRight,
      contentOverlay,
      onClick
    } = this.props

    return <a
      className="lm-thumbnail"
      href={targetUrl}
      onClick={onClick}>
      <div className="lm-thumbnail__content lm-thumbnail__content--above">{contentAbove}</div>
      <div className="lm-thumbnail__content lm-thumbnail__content--left">{contentLeft}</div>
      <div className="lm-thumbnail__image-wrapper">
        <img className="lm-thumbnail__image" src={imageSrc} alt={imageAlt} />
        <div className="lm-thumbnail__opacifier"></div>
        <div className="lm-thumbnail__content lm-thumbnail__content--overlay">{contentOverlay}</div>
      </div>
      <div className="lm-thumbnail__content lm-thumbnail__content--right">{contentRight}</div>
      <div className="lm-thumbnail__content lm-thumbnail__content--below">{contentBelow}</div>
    </a>
  }
}


/*
This CSS is assumed to be provided by the consumer app for now:

a.lm-thumbnail {
  display: grid;
  width: fit-content;
  grid-template-areas: 
    "topleft above topright"
    "left image right"
    "botleft below botright";
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
  color: inherit;
  text-decoration: none;
}

lm-thumbnail__content lm-thumbnail__content--above {
  grid-area: above;
}

lm-thumbnail__content lm-thumbnail__content--left {
  grid-area: left;
  display: flex;
  justify-content: flex-end;
}

lm-thumbnail__content lm-thumbnail__content--right {
  grid-area: right;
  display: flex;
}

lm-thumbnail__content lm-thumbnail__content--below {
  grid-area: below;
}

.lm-thumbnail__image-wrapper {
  position: relative;
  width: fit-content;
  grid-area: image;
}

.lm-thumbnail__image {
  display: block;
}

.lm-thumbnail__opacifier {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  user-select: none;
}

lm-thumbnail__content lm-thumbnail__content--overlay {
  position: absolute;
  top: 0;
}


*/