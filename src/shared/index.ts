import { Darkdouille } from './utils/darkdouille'

const darkdouilles = document.body.querySelectorAll('data.lm-page-config')
const tree = Darkdouille.tree(...darkdouilles)
;(window as any).tree = tree
// console.log(tree.value)
