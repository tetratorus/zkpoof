const assert = require('assert')
const BN = require('bn.js')
const utils = require('../src/utils')
const { Hash, stringToCoefficients } = require('../src/hash')
const { multilinearExtension } = require('../src/mle')
const ec = utils.ec
describe('Basic', function () {
  describe('utils', function () {
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
describe('Chapter 1', function () {
  describe('reed solomon fingerprinting', function () {
    it('should hash', function () {
      const coefficients = [1, 1, 1, 1, 1, 1, 1, 1, 1]
      const H = new Hash(coefficients)
      assert(H.evaluate(2).toString(16) === new BN(2).pow(new BN(coefficients.length + 1)).sub(new BN(2)).toString(16))
    })
    it('should check that Alice and Bob have the same hash if they have the same file', function () {
      // 128 char file
      const AliceFile = 'asdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnm'
      const AliceHash = new Hash(stringToCoefficients(AliceFile))
      // select random value
      const r = utils.randomScalar()
      const AliceV = AliceHash.evaluate(r)
      const BobFile = 'asdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnm'
      const BobHash = new Hash(stringToCoefficients(BobFile))
      const BobV = BobHash.evaluate(r)
      assert(AliceV.cmp(BobV) === 0)
    })
  })
})
describe('Chapter 3', function () {
  describe('multilinear extension', function () {
    it('should return a multilinear extension', function () {
      const fn = function (arrOfBooleans) {
        return new BN(arrOfBooleans.join(''), 2)
      }
      const rand = Math.floor(Math.random() * 100000)
      const booleanInput = new BN(rand).toString(2).split('')
      const fTilda = multilinearExtension(fn, booleanInput.length)
      const mleEval = fTilda(booleanInput)
      const fnEval = fn(booleanInput)
      // console.log(mleEval, fnEval)
      assert(mleEval.cmp(fnEval) === 0)
    })
  })
})
