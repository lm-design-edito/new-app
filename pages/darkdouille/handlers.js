const myHandler = (payload) => {
  console.log('i am a handler', payload)
}

const onAudioquotePlayClick = (payload) => {
  console.log(payload.globals.Apps.rendered)

  const app = payload.globals.Apps.getAppById(payload.appId);
  if (!app) {
    return;
  }
  console.log(payload.globals.Apps.updatePropsOf([app], curr => ({ ...curr, content: 'updated mamène' })))
}

export {
  myHandler,
  onAudioquotePlayClick,
  onResizeTest,
  onIntersectionObserverTest
}
