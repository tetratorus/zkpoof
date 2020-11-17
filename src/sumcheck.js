const BN = require('bn.js')

function H (g, v) {
  let sum = new BN(0)
  for (let i = new BN(0); i.cmp(new BN(2).pow(new BN(v))) !== 0; i = i.add(new BN(1))) {
    sum = sum.add(g(i.toString(2).padStart(v, '0').split('').map(s => parseInt(s))))
  }
  return sum
}

module.exports = {
  H
}
