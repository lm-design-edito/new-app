const onResizeObserver = (payload) => {
  console.log('on Resize', payload)
}

const onIntersectionObserver = (payload) => {
  // console.log('on Intersection Observer', payload)
}

const onEventListenerClick = (payload) => {
  // console.log('on Click', payload)
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
  const colors = ['coral', 'palegoldenrod', 'palevioletred', 'pink', 'aliceblue', 'aquamarine'];
  resizeObserverDivToUpdate.style.setProperty('--resize-color', colors[Math.floor(Math.random() * (colors.length - 1))]);
}



export {
  onResizeObserver,
  onIntersectionObserver,
  onEventListenerClick,
  onEventListenerClickUpdateResizeWidth,
  onEventListenerClickUpdateResizeColor
}
