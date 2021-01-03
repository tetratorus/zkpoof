// boolean formula

class BooleanFormulaNode {
  constructor (parentIndex, children, operator, index, tag) {
    this.parent = parentIndex
    this.children = children
    this.operator = operator || 'INPUT'
    this.index = index
    if (tag !== undefined) {
      this.tag = tag
    }
  }
}
class BooleanFormula {
  constructor (binaryTree) {
    this.nodes = {}
    this.inputs = []
    this.maxDepth = 0
    const queue = []
    const depth = []
    const parent = []
    const indexes = []
    let nextNodeIndex = 1
    queue.push(binaryTree.root)
    depth.push(1)
    parent.push(-1)
    indexes.push(0)
    while (queue.length > 0) {
      const currentNode = queue.shift()
      const currentDepth = depth.shift()
      const currentParent = parent.shift()
      const currentIndex = indexes.shift()
      if (currentDepth > this.maxDepth) {
        this.maxDepth = currentDepth
      }
      const children = []
      if (currentNode.l) {
        queue.push(currentNode.l)
        depth.push(currentDepth + 1)
        parent.push(currentIndex)
        children.push(nextNodeIndex)
        indexes.push(nextNodeIndex)
        nextNodeIndex++
      }
      if (currentNode.r) {
        queue.push(currentNode.r)
        depth.push(currentDepth + 1)
        parent.push(currentIndex)
        children.push(nextNodeIndex)
        indexes.push(nextNodeIndex)
        nextNodeIndex++
      }
      if (!currentNode.r && !currentNode.l) {
        this.inputs.push(currentIndex)
      }
      this.nodes[currentIndex] = new BooleanFormulaNode(currentParent, children, currentNode.o, currentIndex, currentNode.tag)
    }
  }

  evaluate (inputs) {
    if (!Array.isArray(inputs) || inputs.length !== this.inputs.length) {
      throw new Error('evaluation on unexpected values')
    }

    // reset values
    for (const index in this.nodes) {
      delete this.nodes[index].val
    }

    // set input gates
    for (let i = 0; i < inputs.length; i++) {
      this.nodes[this.inputs[i]].val = inputs[i]
    }

    // run evaluation from root
    const queue = []
    queue.push(this.nodes[0])
    const stack = []
    while (queue.length > 0) {
      const currentNode = queue.shift()
      if (currentNode.operator === 'INPUT') {
        continue
      } else if (currentNode.operator === 'IS') { // for layered form
        if (this.nodes[currentNode.children[0]].val === undefined) {
          queue.push(this.nodes[currentNode.children[0]])
          stack.push(currentNode.index)
        } else {
          this.nodes[currentNode.index].val = this.nodes[currentNode.children[0]].val
        }
      } else if (currentNode.operator === 'NOT') {
        if (this.nodes[currentNode.children[0]].val === undefined) {
          queue.push(this.nodes[currentNode.children[0]])
          stack.push(currentNode.index)
        } else {
          this.nodes[currentNode.index].val = this.nodes[currentNode.children[0]].val === 0 ? 1 : 0
        }
      } else if (currentNode.operator === 'OR') {
        if (this.nodes[currentNode.children[0]].val === undefined) {
          queue.push(this.nodes[currentNode.children[0]])
        }
        if (this.nodes[currentNode.children[1]].val === undefined) {
          queue.push(this.nodes[currentNode.children[1]])
        }
        if (this.nodes[currentNode.children[0]].val === 1 || this.nodes[currentNode.children[1]].val === 1) {
          this.nodes[currentNode.index].val = 1
        } else if (this.nodes[currentNode.children[0]].val === 0 && this.nodes[currentNode.children[1]].val === 0) {
          this.nodes[currentNode.index].val = 0
        } else {
          stack.push(currentNode.index)
        }
      } else if (currentNode.operator === 'AND') {
        if (this.nodes[currentNode.children[0]].val === undefined) {
          queue.push(this.nodes[currentNode.children[0]])
        }
        if (this.nodes[currentNode.children[1]].val === undefined) {
          queue.push(this.nodes[currentNode.children[1]])
        }
        if (this.nodes[currentNode.children[0]].val === 0 || this.nodes[currentNode.children[1]].val === 0) {
          this.nodes[currentNode.index].val = 0
        } else if (this.nodes[currentNode.children[0]].val === 1 && this.nodes[currentNode.children[1]].val === 1) {
          this.nodes[currentNode.index].val = 1
        } else {
          stack.push(currentNode.index)
        }
      } else {
        throw new Error('operator not recognised')
      }
    }
    while (stack.length) {
      const currentNodeIndex = stack.pop()
      const operator = this.nodes[currentNodeIndex].operator
      if (operator === 'INPUT') {
        continue
      } else if (operator === 'IS') { // for layered form
        const children = this.nodes[currentNodeIndex].children
        this.nodes[currentNodeIndex].val = this.nodes[children[0]].val
      } else if (operator === 'NOT') {
        const children = this.nodes[currentNodeIndex].children
        this.nodes[currentNodeIndex].val = this.nodes[children[0]].val === 0 ? 1 : 0
      } else if (operator === 'OR') {
        const children = this.nodes[currentNodeIndex].children
        if (this.nodes[children[0]].val === 1 || this.nodes[children[1]].val === 1) {
          this.nodes[currentNodeIndex].val = 1
        } else if (this.nodes[children[0]].val === 0 && this.nodes[children[1]].val === 0) {
          this.nodes[currentNodeIndex].val = 0
        }
      } else if (operator === 'AND') {
        const children = this.nodes[currentNodeIndex].children
        if (this.nodes[children[0]].val === 0 || this.nodes[children[1]].val === 0) {
          this.nodes[currentNodeIndex].val = 0
        } else if (this.nodes[children[0]].val === 1 && this.nodes[children[1]].val === 1) {
          this.nodes[currentNodeIndex].val = 1
        }
      } else {
        throw new Error('operator not recognised')
      }
    }
    return this.nodes[0].val
  }

  toArithmeticCircuit () {
    const queue = []
    const parents = []
    const indexes = []
    const depth = []
    const ac = new ArithmeticCircuit({}, [], 0)

    // start conversion from the root
    queue.push(this.nodes[0])
    indexes.push(0)
    parents.push([-1]) // parents are arrays, fan-out can be more than 1 for circuits
    depth.push(1)
    let nextNodeIndex = 1
    while (queue.length > 0) {
      const currentNode = queue.shift()
      const currentIndex = indexes.shift()
      const currentDepth = depth.shift()
      if (currentDepth > ac.maxDepth) {
        ac.maxDepth = currentDepth
      }
      const currentParents = parents.shift()
      if (currentNode.operator === 'INPUT') {
        ac.inputs.push(currentIndex)
        ac.nodes[currentIndex] = new ArithmeticCircuitNode(currentParents, [], '_', currentIndex, currentNode.tag)
      } else if (currentNode.operator === 'IS') { // for layered form
        ac.nodes[currentIndex] = new ArithmeticCircuitNode(currentParents, [nextNodeIndex], '=', currentIndex, currentNode.tag)
        queue.push(this.nodes[currentNode.children[0]])
        parents.push([currentIndex])
        indexes.push(nextNodeIndex)
        depth.push(currentDepth + 1)
        nextNodeIndex++
      } else if (currentNode.operator === 'NOT') {
        ac.nodes[currentIndex] = new ArithmeticCircuitNode(currentParents, [nextNodeIndex, nextNodeIndex + 1], '-', currentIndex, currentNode.tag)
        // 1 - y
        ac.nodes[nextNodeIndex] = new ArithmeticCircuitNode([currentIndex], [], '1', nextNodeIndex, 'one')
        nextNodeIndex++
        queue.push(this.nodes[currentNode.children[0]])
        parents.push([currentIndex])
        indexes.push(nextNodeIndex)
        depth.push(currentDepth + 1)
        nextNodeIndex++
      } else if (currentNode.operator === 'AND') {
        // x.y
        ac.nodes[currentIndex] = new ArithmeticCircuitNode(currentParents, [nextNodeIndex, nextNodeIndex + 1], '*', currentIndex, currentNode.tag)
        queue.push(this.nodes[currentNode.children[0]])
        parents.push([currentIndex])
        indexes.push(nextNodeIndex)
        depth.push(currentDepth + 1)
        nextNodeIndex++
        queue.push(this.nodes[currentNode.children[1]])
        parents.push([currentIndex])
        indexes.push(nextNodeIndex)
        depth.push(currentDepth + 1)
        nextNodeIndex++
      } else if (currentNode.operator === 'OR') {
        // x+y-x.y
        ac.nodes[currentIndex] = new ArithmeticCircuitNode(currentParents, [nextNodeIndex, nextNodeIndex + 1], '-', currentIndex, currentNode.tag)
        ac.nodes[nextNodeIndex] = new ArithmeticCircuitNode([currentIndex], [nextNodeIndex + 2, nextNodeIndex + 3], '+', nextNodeIndex, 'add')
        ac.nodes[nextNodeIndex + 1] = new ArithmeticCircuitNode([currentIndex], [nextNodeIndex + 2, nextNodeIndex + 3], '*', nextNodeIndex + 1, 'mul')

        queue.push(this.nodes[currentNode.children[0]])
        parents.push([nextNodeIndex, nextNodeIndex + 1])
        indexes.push(nextNodeIndex + 2)
        depth.push(currentDepth + 2)

        queue.push(this.nodes[currentNode.children[1]])
        parents.push([nextNodeIndex, nextNodeIndex + 1])
        indexes.push(nextNodeIndex + 3)
        depth.push(currentDepth + 2)

        nextNodeIndex += 4
      } else {
        throw new Error('operator not recognised')
      }
    }
    return ac
  }
}

class ArithmeticCircuitNode {
  constructor (parents, children, operator, index, tag) {
    if (!Array.isArray(parents)) {
      throw new Error('parents must be an array, fan-out may be more than 1 for circuits')
    }
    this.parents = parents
    this.children = children
    this.operator = operator
    this.index = index
    if (tag !== undefined) {
      this.tag = tag
    }
  }
}

class ArithmeticCircuit {
  constructor (nodes, inputs, maxDepth) {
    this.nodes = nodes
    this.inputs = inputs
    this.maxDepth = maxDepth
  }

  evaluate (inputs) {
    if (!Array.isArray(inputs) || inputs.length !== this.inputs.length) {
      throw new Error('evaluation on unexpected values')
    }

    // reset values
    for (const index in this.nodes) {
      delete this.nodes[index].val
      if (this.nodes[index].tag === 'one') {
        this.nodes[index].val = 1
      }
    }

    // set input gates
    for (let i = 0; i < this.inputs.length; i++) {
      this.nodes[this.inputs[i]].val = inputs[i]
    }

    // run evaluation from root
    const queue = []
    queue.push(this.nodes[0])
    const stack = []
    while (queue.length > 0) {
      const currentNode = queue.shift()
      if (currentNode.operator === '_' || currentNode.operator === '1') {
        continue
      } else if (currentNode.operator === '=') { // for layered form
        if (this.nodes[currentNode.children[0]].val !== undefined) {
          this.nodes[currentNode.index].val = this.nodes[currentNode.children[0]].val
        } else {
          queue.push(this.nodes[currentNode.children[0]])
          stack.push(currentNode.index)
        }
      } else if (currentNode.operator === '+') {
        if (this.nodes[currentNode.children[0]].val !== undefined && this.nodes[currentNode.children[1]].val !== undefined) {
          this.nodes[currentNode.index].val = this.nodes[currentNode.children[0]].val + this.nodes[currentNode.children[1]].val
        } else {
          stack.push(currentNode.index)
          if (this.nodes[currentNode.children[0]].val === undefined) {
            queue.push(this.nodes[currentNode.children[0]])
          }
          if (this.nodes[currentNode.children[1]].val === undefined) {
            queue.push(this.nodes[currentNode.children[1]])
          }
        }
      } else if (currentNode.operator === '-') {
        if (this.nodes[currentNode.children[0]].val !== undefined && this.nodes[currentNode.children[1]].val !== undefined) {
          this.nodes[currentNode.index].val = this.nodes[currentNode.children[0]].val - this.nodes[currentNode.children[1]].val
        } else {
          stack.push(currentNode.index)
          if (this.nodes[currentNode.children[0]].val === undefined) {
            queue.push(this.nodes[currentNode.children[0]])
          }
          if (this.nodes[currentNode.children[1]].val === undefined) {
            queue.push(this.nodes[currentNode.children[1]])
          }
        }
      } else if (currentNode.operator === '*') {
        if (this.nodes[currentNode.children[0]].val !== undefined && this.nodes[currentNode.children[1]].val !== undefined) {
          this.nodes[currentNode.index].val = this.nodes[currentNode.children[0]].val * this.nodes[currentNode.children[1]].val
        } else {
          stack.push(currentNode.index)
          if (this.nodes[currentNode.children[0]].val === undefined) {
            queue.push(this.nodes[currentNode.children[0]])
          }
          if (this.nodes[currentNode.children[1]].val === undefined) {
            queue.push(this.nodes[currentNode.children[1]])
          }
        }
      } else {
        throw new Error('operator not recognised')
      }
    }

    while (stack.length) {
      const currentNodeIndex = stack.pop()
      const operator = this.nodes[currentNodeIndex].operator
      if (operator === '_' || operator === '1') {
        continue
      } else if (operator === '=') { // for layered form
        const children = this.nodes[currentNodeIndex].children
        this.nodes[currentNodeIndex].val = this.nodes[children[0]].val
      } else if (operator === '+') {
        const children = this.nodes[currentNodeIndex].children
        this.nodes[currentNodeIndex].val = this.nodes[children[0]].val + this.nodes[children[1]].val
      } else if (operator === '-') {
        const children = this.nodes[currentNodeIndex].children
        this.nodes[currentNodeIndex].val = this.nodes[children[0]].val - this.nodes[children[1]].val
      } else if (operator === '*') {
        const children = this.nodes[currentNodeIndex].children
        this.nodes[currentNodeIndex].val = this.nodes[children[0]].val * this.nodes[children[1]].val
      } else {
        throw new Error('operator not recognised')
      }
    }
    return this.nodes[0].val
  }
}

module.exports = {
  BooleanFormula,
  ArithmeticCircuit
}
