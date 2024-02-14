const myHandler = (payload) => {
  console.log('i am a handler', payload)
}

const onAudioquotePlayClick = (payload) => {
  console.log(payload.globals.Apps.rendered)
  console.log(payload.globals.Apps.updatePropsOf('mon-super-id', curr => ({ ...curr, content: 'updated mamène' })))
}

const onResizeTest = (payload) => {
  console.log('i am a resize handler', payload)
}

export {
  myHandler,
  onAudioquotePlayClick,
  onResizeTest,
}
