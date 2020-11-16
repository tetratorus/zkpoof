const assert = require('assert')
const BN = require('bn.js')
const utils = require('../utils')
const ec = utils.ec
describe('Basic', function () {
  describe('randomScalar', function () {
    it('should return random field element in the range of secp256k1 field order', function () {
      assert(utils.randomScalar().cmp(ec.curve.p) !== 1)
    })
    it('should return random group element in the range of secp256k1 group order', function () {
      const pt = utils.randomPoint()
      // secp256k1 equation: y^3 = x^2 + 7
      assert(pt.x.pow(new BN(3)).umod(ec.curve.p).add(new BN(7)).umod(ec.curve.p).cmp(pt.y.pow(new BN(2)).umod(ec.curve.p)) === 0)
    })
  })
})
