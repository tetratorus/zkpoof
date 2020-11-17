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
    if (current.inputs === undefined) {
      leafs.push(current)
    } else {
      for (let i = 0; i < current.inputs.length; i++) {
        nodeIndex++
        const node = {
          ...current.inputs[i],
          output: current.nodeIndex,
          nodeIndex
        }
        nodes[nodeIndex] = node
        queue.push(node)
      }
      delete current.inputs
    }
  }
  delete nodes[0].inputs
  return { leafs, nodes }
}

module.exports = {
  BooleanCircuit,
  getDAG
}
