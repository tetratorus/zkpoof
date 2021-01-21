const BN = require('bn.js')

// Multilinear extension: Any f: {0, 1}^v -> F has a unique MLE, fTilda, over F
function multilinearExtension (f, v) {
  // f: {0, 1}^v -> F
  return function (x) {
    let sum = new BN(0)
    for (let w = new BN(0); w.cmp(new BN(2).pow(new BN(v))) === -1; w = w.add(new BN(1))) {
      sum = sum.add(f(bnToBoolArr(w, v)).mul(Xw(bnToBoolArr(w, v), x, v)))
    }
    return sum
  }
}

function bnToBoolArr (bn, boolArrLength) {
  if (boolArrLength) {
    return bn.toString(2).padStart(boolArrLength, '0').split('').map(s => parseInt(s))
  } else {
    return bn.toString(2).split('').map(s => parseInt(s))
  }
}

function Xw (w, x, V) {
  let mul = new BN(1)
  for (let v = 1; v <= V; v++) {
    const xi = new BN(x[v - 1])
    const wi = new BN(w[v - 1])
    const term = xi.mul(wi).add(new BN(1).sub(xi).mul(new BN(1).sub(wi)))
    mul = mul.mul(term)
  }
  return mul
}

// TODO: memoization, O(n) instead of O(n log n)

module.exports = {
  bnToBoolArr,
  multilinearExtension
}
