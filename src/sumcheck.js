const BN = require('bn.js')

function vecFill (len, inputs, padLeft = false) {
  const arr = Array.from(new Array(len)).map(x => null)
  if (padLeft) {
    for (let i = 0; i < inputs.length; i++) {
      arr[arr.length - 1 - i] = inputs[inputs.length - 1 - i]
    }
  } else {
    for (let i = 0; i < inputs.length; i++) {
      arr[i] = inputs[i]
    }
  }
  return arr
}

function x () {
  return Array.prototype.slice.call(arguments)
}

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
    ).umod(new BN(prime))
  }
  return sum
}

function s (g, v, prime) {
  return function (variableArray) { // takes in a v-length array with nulls for nonvariates
    const variates = variableArray.filter(x => x !== null)
    // console.log('variateslength', variates.length, 'v', v)
    let subsum = new BN(0)
    for (let c = new BN(0); c.cmp(new BN(2).pow(new BN(v - variates.length))) !== 0; c = c.add(new BN(1))) {
      const nonVariates = c.toString(2)
        .split('')
        .map((s) => parseInt(s))

      // console.log('nonVariates', nonVariates)
      const allVars = []
      for (let d = 0; d < v; d++) {
        if (variableArray[d] !== null) {
          allVars.push(variableArray[d])
          // console.log('pushing variate', variableArray, variableArray[d])
        } else {
          const nonVariate = nonVariates.shift()
          // console.log('pushing nonvariate', nonVariate)
          allVars.push(nonVariate)
        }
      }
      // console.log(allVars, 'allvars')
      subsum = subsum.add(
        g(
          allVars
        )
      ).umod(new BN(prime))
    }
    return subsum
  }
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
  H,
  s,
  x,
  vecFill
  // getArithmeticCircuitDAG
}
