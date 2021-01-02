// boolean circuit

class BooleanCircuitNode {
  constructor (parentIndex, children, operator, index, tag) {
    this.parent = parentIndex
    this.children = children
    this.operator = operator || 'INPUT'
    this.index = index
    if (tag) {
      this.tag = tag
    }
  }
}
class BooleanCircuit {
  constructor (binaryTree) {
    this.output = binaryTree.root
    this.nodes = {}
    const queue = []
    const depth = []
    const parent = []
    const indexes = []
    this.inputs = []
    this.maxDepth = 0
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
      this.nodes[currentIndex] = new BooleanCircuitNode(currentParent, children, currentNode.o, currentIndex, currentNode.tag)
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
      const leafIndex = this.inputs[i]
      const input = inputs[i]
      this.nodes[leafIndex].val = input
    }

    // run evaluation from root
    const queue = []
    queue.push(this.nodes[0])
    const stack = []
    while (queue.length > 0) {
      const currentNode = queue.shift()
      if (currentNode.operator === 'INPUT') {
        continue
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
}

module.exports = {
  BooleanCircuit
}
