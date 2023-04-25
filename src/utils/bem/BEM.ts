import getNamesArr from './getNamesArr'

export interface Block {
  name: string
  modifiers: string[]
}

class BEM {
  constructor () {
    this.findBlockByName = this.findBlockByName.bind(this)
    this.addBlock = this.addBlock.bind(this)
    this.addElement = this.addElement.bind(this)
    this.addModifier = this.addModifier.bind(this)
    this.copy = this.copy.bind(this)
    this.block = this.block.bind(this)
    this.element = this.element.bind(this)
    this.modifier = this.modifier.bind(this)
    this.blk = this.blk.bind(this)
    this.elt = this.elt.bind(this)
    this.mod = this.mod.bind(this)
    this.cp = this.cp.bind(this)
    this.addSingleBlock = this.addSingleBlock.bind(this)
    this.addSingleElement = this.addSingleElement.bind(this)
    this.addSingleModifier = this.addSingleModifier.bind(this)
    this.setCurrentBlockByName = this.setCurrentBlockByName.bind(this)
    this.createBlockByName = this.createBlockByName.bind(this)
    this.getCurrentBlock = this.getCurrentBlock.bind(this)
  }

  addBlock (blockNameArg: any): BEM {
    const blocksNames = getNamesArr(blockNameArg)
    blocksNames.forEach(this.addSingleBlock)
    return this
  }

  addElement (elementNameArg: any): BEM {
    const elementsNames = getNamesArr(elementNameArg)
    elementsNames.forEach(this.addSingleElement)
    return this
  }

  addModifier (modifierNameArg: any): BEM {
    const currentBlock = this.getCurrentBlock()
    if (currentBlock === undefined) return this
    const modifiersNames = getNamesArr(modifierNameArg)
    modifiersNames.forEach(this.addSingleModifier)
    return this
  }

  copy (): BEM {
    const copy = new BEM()
    this.blocks.forEach(block => {
      copy.addBlock(block.name)
      block.modifiers.forEach(copy.addModifier)
    })
    return copy
  }

  block (blockNameArg: any): BEM { return this.copy().addBlock(blockNameArg) }
  element (elementNameArg: any): BEM { return this.copy().addElement(elementNameArg) }
  modifier (modifierNameArg: any): BEM { return this.copy().addModifier(modifierNameArg) }
  blk (blockNameArg: any): BEM { return this.block(blockNameArg) }
  elt (elementNameArg: any): BEM { return this.element(elementNameArg) }
  mod (modifierNameArg: any): BEM { return this.modifier(modifierNameArg) }
  cp (): BEM { return this.copy() }

  get value (): string {
    return this.blocks.map(block => {
      return [block.name, ...block.modifiers.map(modifier => {
        return `${block.name}_${modifier}`
      })].join(' ')
    }).join(' ')
  }

  get val (): string { return this.value }

  private blocks: Block[] = []

  private findBlockByName (name: string): Block|undefined {
    return this.blocks.find(block => block.name === name)
  }

  private addSingleBlock (blockName: string): BEM {
    if (this.findBlockByName(blockName) !== undefined) {
      this.setCurrentBlockByName(blockName)
    } else {
      const block = this.createBlockByName(blockName)
      this.blocks.push(block)
    }
    return this
  }

  private addSingleElement (elementName: string): BEM {
    const currentBlock = this.getCurrentBlock()
    if (currentBlock === undefined) this.addBlock(elementName)
    else { currentBlock.name = currentBlock.name + '__' + elementName }
    return this
  }

  private addSingleModifier (modifierName: string): BEM {
    const currentBlock = this.getCurrentBlock()
    if (currentBlock !== undefined) {
      currentBlock.modifiers.push(modifierName)
    }
    return this
  }

  private setCurrentBlockByName (blockName: string): BEM {
    const block = this.findBlockByName(blockName)
    if (block !== undefined) {
      const blockPos = this.blocks.indexOf(block)
      this.blocks = [
        ...this.blocks.slice(0, blockPos),
        ...this.blocks.slice(blockPos + 1),
        block
      ]
    }
    return this
  }

  private createBlockByName (blockName: string): Block {
    return { name: blockName, modifiers: [] }
  }

  private getCurrentBlock (): Block|undefined {
    return this.blocks.slice(-1)[0]
  }
}

export default BEM
