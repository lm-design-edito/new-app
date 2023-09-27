import { Darkdouille } from './utils/darkdouille'

//console.group('shared/index')
  const darkdouilles = document.body.querySelectorAll('data.lm-page-config')
  //console.log('darkdouilles\n', darkdouilles)
  //console.group('shared/index - creating the tree')
    const tree = Darkdouille.tree(...darkdouilles)
  //console.groupEnd()
  //console.log('tree\n', tree)
  ;(window as any).tree = tree
  //console.group('shared/index => getting tree value')
    const value = tree.value
  //console.groupEnd()
  console.log('value\n', value)
//console.groupEnd()
