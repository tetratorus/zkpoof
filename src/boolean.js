// Boolean circuit

class BooleanCircuit {
  constructor (dag) {
    // directed acyclic graph
    this.dag = dag
  }

  evaluate (inputGates) {

  }
}

function getDAG (tree) {
  // get all leaf nodes
  const queue = []
  const nodes = {}
  const leafs = []
  let nodeIndex = 0
  tree.root.nodeIndex = nodeIndex
  nodes[nodeIndex] = {
    ...tree.root,
    nodeIndex
  }
  queue.push(tree.root)
  while (queue.length > 0) {
    const current = queue.shift()
    if (current.input === undefined) {
      leafs.push(current)
    } else {
      for (let i = 0; i < current.input.length; i++) {
        nodeIndex++
        const node = {
          ...current.input[i],
          output: current.nodeIndex,
          nodeIndex
        }
        nodes[nodeIndex] = node
        queue.push(node)
      }
      delete current.input
    }
  }
  delete nodes[0].input
  return { leafs, nodes }
}

module.exports = {
  BooleanCircuit,
  getDAG
}
