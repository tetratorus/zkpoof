const assert = require('assert')
const BN = require('bn.js')
const utils = require('../src/utils')
const { Hash, stringToCoefficients } = require('../src/hash')
const { multilinearExtension } = require('../src/mle')
const { getDAG } = require('../src/boolean')
const { H } = require('../src/sumcheck')
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
      const BobFile = AliceFile
      assert(BobFile === AliceFile)
      const BobHash = new Hash(stringToCoefficients(BobFile))
      const BobV = BobHash.evaluate(r)
      assert(AliceV.cmp(BobV) === 0)
    })
    it('should check that Alice and Bob dont have the same hash if file differs by just one char', function () {
      // 128 char file
      const AliceFile = 'asdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnm'
      const AliceHash = new Hash(stringToCoefficients(AliceFile))
      // select random value
      const r = utils.randomScalar()
      const AliceV = AliceHash.evaluate(r)
      const randomIndex = Math.floor(Math.random() * AliceFile.length)
      const BobFile = AliceFile.split('').map((char, i) => i === randomIndex ? String.fromCharCode(char.charCodeAt(0) + 1) : char).join('')
      assert(BobFile !== AliceFile)
      const BobHash = new Hash(stringToCoefficients(BobFile))
      const BobV = BobHash.evaluate(r)
      assert(AliceV.cmp(BobV) !== 0)
    })
  })
})
describe('Chapter 3', function () {
  describe('multilinear extension', function () {
    it('should return a multilinear extension', function () {
      const fn = function (arrOfBooleans) {
        return new BN(arrOfBooleans.join(''), 2)
      }
      const rand = Math.floor(Math.random() * 10000)
      const booleanInput = new BN(rand).toString(2).split('')
      const fTilda = multilinearExtension(fn, booleanInput.length)
      const mleEval = fTilda(booleanInput)
      const fnEval = fn(booleanInput)
      assert(mleEval.cmp(fnEval) === 0)
    })
  })
})
describe('Chapter 4', function () {
  describe('sum-check protocol', function () {
    it('should sum', function () {
      const prime = Math.floor(Math.random() * 100000)
      const randomFE = new BN(Math.floor(Math.random() * prime))
      const g = function (booleanArr) {
        // if input is even, return 1, else 0
        if (booleanArr[booleanArr.length - 1] === 0) {
          return randomFE
        } else {
          return new BN(0)
        }
      }

      const rand = Math.floor(Math.random() * 10) + 1
      // sumcheck should be equal to exactly half of range respresented by the boolean array
      // multiplied by the random selected field element randomFE
      const summation = new BN(2).pow(new BN(rand - 1)).mul(randomFE).mod(new BN(prime))
      const res = H(g, rand, prime)
      // console.log(res, summation)
      assert(res.cmp(summation) === 0)
    })
  })
  // describe('DAG', function () {
  //   it('should create a DAG from a tree', function () {
  //     const tree = {
  //       root: { gate: 'AND', input: [{ gate: 'NOT', input: [{}] }, { gate: 'OR', input: [{}, {}] }] }
  //     }
  //     const dag = getDAG(tree)
  //     assert(dag.leafs[0].output === 1)
  //     const notGate = dag.nodes[dag.leafs[0].output]
  //     assert(notGate.gate === 'NOT')
  //     const rootGate = dag.nodes[notGate.output]
  //     assert(rootGate.gate === 'AND' && rootGate.nodeIndex === 0)
  //     // console.log(JSON.stringify(dag, null, 2))
  //   })
  // })
  describe('full sum-check', function () {

  })
})
