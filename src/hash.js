const BN = require('bn.js')
const utils = require('./utils')
class Hash {
  constructor (coefficients) {
    if (!Array.isArray(coefficients)) {
      throw new Error('coefficients should be array')
    }
    this.length = coefficients.length
    this.coefficients = coefficients.map(coeff => new BN(coeff))
  }

  evaluate (r) {
    let sum = new BN(0)
    const length = this.coefficients.length
    for (let count = 0; count < length; count++) {
      const i = count + 1
      sum = sum.add(
        this.coefficients[count].mul(
          new BN(r).pow(new BN(i)).umod(utils.ec.curve.p)
        ).umod(utils.ec.curve.p)
      ).umod(utils.ec.curve.p)
    }
    return sum
  }
}

function stringToCoefficients (str) {
  const arr = []
  for (let i = 0; i < str.length; i++) {
    arr.push(new BN(str.charCodeAt(i)))
  }
  return arr
}

module.exports = {
  Hash,
  stringToCoefficients
}
