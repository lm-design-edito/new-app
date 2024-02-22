const _getRandomColor = () => {
  const colors = ['coral', 'palegoldenrod', 'orange', 'palevioletred', 'pink', 'cadetblue', 'aquamarine', 'orange'];
  return colors[Math.floor(Math.random() * (colors.length - 1))];
}

const onResizeObserver = (payload) => {
  if (!payload.details.entries || !payload.details.entries[0]) {
    return;
  }
  const resizeObserverDiv = payload.details.entries[0].target.getRootNode().host
  if (!resizeObserverDiv) {
    return;
  }
  const resizeObserverSpanToUpdate = resizeObserverDiv.shadowRoot.querySelector('span')
  resizeObserverSpanToUpdate.innerHTML = 'Width onResizeObserver : ' + payload.details.entries[0].target.clientWidth + 'px'
}

const onIntersectionObserver = (payload) => {
  if (!payload.details.ioEntry || !payload.details.ioEntry.target) {
    return;
  }
  const intersectinObserverDivToUpdate = payload.details.ioEntry.target.querySelector('div')
  let color = 'coral';
  if ( payload.details.ioEntry.intersectionRatio >= 0.25) {
    color = 'palegoldenrod';
  } 
  if ( payload.details.ioEntry.intersectionRatio >= 0.5) {
    color = 'pink';
  }
  if ( payload.details.ioEntry.intersectionRatio >= 0.75) {
    color = 'palevioletred';
  }
  intersectinObserverDivToUpdate.style.setProperty('--intersection-background',color);
}

const onEventListenerClick = (payload) => {
  if (!payload.details.e.currentTarget) {
    return;
  }

  payload.details.e.currentTarget.style.setProperty('--button-color', _getRandomColor());
  
  const transformValue = getComputedStyle(payload.details.e.currentTarget).getPropertyValue('--button-transform');
  payload.details.e.currentTarget.style.setProperty('--button-transform', parseInt(transformValue) > 0 ? 0 : 1);
}

const onEventListenerClickUpdateResizeWidth = (payload) => {
  if (!payload.details.e.target) {
    return;
  }
  const resizeObserverDiv = payload.details.e.target.getRootNode().host
  if (!resizeObserverDiv) {
    return;
  }
  const resizeObserverDivToUpdate = resizeObserverDiv.shadowRoot.querySelector('.lm-resize-observer')
  if (!resizeObserverDivToUpdate) {
    return;
  }
  resizeObserverDivToUpdate.style.setProperty('--resize-width', Math.floor(Math.random() * 100) + '%');
}

const onEventListenerClickUpdateResizeColor = (payload) => {
  if (!payload.appId) {
    return;
  }

  const app = payload.globals.Apps.getAppById(payload.appId);
  if (!app) {
    return;
  }

  if (!payload.details.e.target) {
    return;
  }
  const resizeObserverDiv = payload.details.e.target.getRootNode().host
  if (!resizeObserverDiv) {
    return;
  }
  const resizeObserverDivToUpdate = resizeObserverDiv.shadowRoot.querySelector('.lm-resize-observer')
  if (!resizeObserverDivToUpdate) {
    return;
  }
  resizeObserverDivToUpdate.style.setProperty('--resize-color', _getRandomColor());
}

export {
  onResizeObserver,
  onIntersectionObserver,
  onEventListenerClick,
  onEventListenerClickUpdateResizeWidth,
  onEventListenerClickUpdateResizeColor
}
