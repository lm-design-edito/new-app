import { Darkdouille } from './utils/darkdouille'

const darkdouilles = document.body.querySelectorAll('data.lm-page-config')
const tree = Darkdouille.tree(...darkdouilles)
console.log(tree.value)
