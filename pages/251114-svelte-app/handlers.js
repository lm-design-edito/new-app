/*
  context: BlockContext = {
  width: number | null,
  height: number | null,
  page: number | null,
  progression: number | null,
  pageProgression: number | null
} */

export function init (context) {
  console.log('Initing with context...', context)
  const div = document.createElement('div')
  div.classList.add('ma-super-div')
  div.style.width = '400px'
  div.style.height = '600px'
  div.style.backgroundColor = 'red'
  return div
}
