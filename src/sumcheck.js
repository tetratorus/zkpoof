const BN = require('bn.js')

function H (g, v, prime) {
  let sum = new BN(0)
  for (let i = new BN(0); i.cmp(new BN(2).pow(new BN(v))) !== 0; i = i.add(new BN(1))) {
    sum = sum.add(
      g(
        i
          .toString(2)
          .padStart(v, '0')
          .split('')
          .map((s) => parseInt(s))
      )
    ).mod(new BN(prime))
  }
  return sum
}

// circuits can have fan-out more than 1
// formulas have fan-out exactly 1
// function getArithmeticCircuitDAG (bfTree) {
//   const nodes = { '-1': { nodeIndex: -1, value: 1, output: [] } }
//   const queue = []
//   let nodeIndex = -1
//   const leafs = [{ nodeIndex: -1, value: 1 }]
//   queue.push(bfTree.root)

//   delete nodes[0].input
//   // remove node[-1] if no output
// }

module.exports = {
  H
  // getArithmeticCircuitDAG
}
