// boolean circuit
// layered representation, where first layer is always leafs

class BooleanCircuitNode {
  constructor (parentIndex, children, operator, index) {
    this.parent = parentIndex
    this.children = children
    this.operator = operator || 'INPUT'
  }
}

class BooleanCircuit {
  constructor (binaryTree) {
    this.output = binaryTree.root
    this.nodes = {}
    const queue = []
    const depth = []
    const parent = []
    this.leafs = []
    this.maxDepth = 0
    let nodeIndex = 0
    queue.push(binaryTree.root)
    depth.push(1)
    parent.push(-1)
    while (queue.length > 0) {
      const currentNode = queue.shift()
      const currentDepth = depth.shift()
      const currentParent = parent.shift()
      if (currentDepth > this.maxDepth) {
        this.maxDepth = currentDepth
      }
      let currentIndex = nodeIndex
      const children = []
      if (currentNode.l) {
        queue.push(currentNode.l)
        depth.push(currentDepth + 1)
        parent.push(nodeIndex)
        currentIndex++
        children.push(currentIndex)
      }
      if (currentNode.r) {
        queue.push(currentNode.r)
        depth.push(currentDepth + 1)
        parent.push(nodeIndex)
        currentIndex++
        children.push(currentIndex)
      }
      if (!currentNode.r && !currentNode.l) {
        this.leafs.push(nodeIndex)
      }
      this.nodes[nodeIndex] = new BooleanCircuitNode(currentParent, children, currentNode.o, nodeIndex)
      nodeIndex++
    }
  }

  evaluate (inputs) {

  }
}

module.exports = {
  BooleanCircuit
}
