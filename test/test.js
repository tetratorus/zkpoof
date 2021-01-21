const assert = require('assert')
const BN = require('bn.js')
const utils = require('../src/utils')
const { Hash, stringToCoefficients } = require('../src/hash')
const { bnToBoolArr, multilinearExtension } = require('../src/mle')
const { H, s, x, vecFill } = require('../src/sumcheck')
const { BooleanFormula } = require('../src/circuit')
const { matrixMultiply, matrixGen } = require('../src/matmult')
const ec = utils.ec
describe('Basic', function () {
  describe('utils', function () {
    it('should return random field element in the range of secp256k1 field order', function () {
      assert(utils.randomScalar().cmp(ec.curve.p) !== 1)
    })
    it('should return random group element in the range of secp256k1 group order', function () {
      const pt = utils.randomPoint()
      // secp256k1 equation: y^3 = x^2 + 7
      assert(
        pt.x
          .pow(new BN(3))
          .umod(ec.curve.p)
          .add(new BN(7))
          .umod(ec.curve.p)
          .cmp(pt.y.pow(new BN(2)).umod(ec.curve.p)) === 0
      )
    })
  })
})
describe('Chapter 1', function () {
  describe('reed solomon fingerprinting', function () {
    it('should hash', function () {
      const coefficients = [1, 1, 1, 1, 1, 1, 1, 1, 1]
      const H = new Hash(coefficients)
      assert(
        H.evaluate(2).toString(16) ===
          new BN(2)
            .pow(new BN(coefficients.length + 1))
            .sub(new BN(2))
            .toString(16)
      )
    })
    it('should check that Alice and Bob have the same hash if they have the same file', function () {
      // 128 char file
      const AliceFile =
        'asdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnm'
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
      const AliceFile =
        'asdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnmasdfghjklzxcvbnm'
      const AliceHash = new Hash(stringToCoefficients(AliceFile))
      // select random value
      const r = utils.randomScalar()
      const AliceV = AliceHash.evaluate(r)
      const randomIndex = Math.floor(Math.random() * AliceFile.length)
      const BobFile = AliceFile.split('')
        .map((char, i) => (i === randomIndex ? String.fromCharCode(char.charCodeAt(0) + 1) : char))
        .join('')
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
      const summation = new BN(2)
        .pow(new BN(rand - 1))
        .mul(randomFE)
        .mod(new BN(prime))
      const res = H(g, rand, prime)
      // console.log(res, summation)
      assert(res.cmp(summation) === 0)
    })
  })
  it('should subsum, H = s_1(0) + s_1(1)', function () {
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
    const res = H(g, rand, prime)

    const s1 = s(g, rand, prime)
    assert(res.cmp(s1(vecFill(rand, x(0), true)).add(s1(vecFill(rand, x(1), true))).umod(new BN(prime))) === 0)
  })
  it('should simulate sum-check protocol', function () {
    const prime = Math.floor(Math.random() * 100000)
    const dimensions = 5
    const g = function (inputArr) {
      let sum = new BN(0)
      inputArr.map(elem => {
        sum = sum.add(new BN(elem))
        return null
      })
      return sum
    }

    // Round 1
    // prover
    const sum = H(g, dimensions, prime)
    const s1 = s(g, dimensions, prime)

    // verifier
    const g1 = s1
    assert(
      g1(x(0, null, null, null, null))
        .add(g1(x(1, null, null, null, null)))
        .umod(new BN(prime))
        .cmp(sum) === 0)
    const r1 = new BN(Math.floor(Math.random() * 100000)).umod(new BN(prime))

    // Round 2
    // prover
    const s2 = function (variableArray) {
      const fixedValues = [r1.toNumber()]
      return s(g, dimensions, prime).call(this, fixedValues.concat(variableArray))
    }

    // verifier
    const g2 = s2
    assert(
      g2(x(0, null, null, null))
        .add(g2(x(1, null, null, null)))
        .umod(new BN(prime))
        .cmp(g1(x(r1, null, null, null, null))) === 0
    )
    const r2 = new BN(Math.floor(Math.random() * 100000)).umod(new BN(prime))

    // Round 3
    // prover
    const s3 = function (variableArray) {
      const fixedValues = [r1.toNumber(), r2.toNumber()]
      return s(g, dimensions, prime).call(this, fixedValues.concat(variableArray))
    }

    // verifier
    const g3 = s3
    assert(
      g3(x(0, null, null))
        .add(g3(x(1, null, null)))
        .umod(new BN(prime))
        .cmp(g2(x(r2, null, null, null))) === 0
    )
    const r3 = new BN(Math.floor(Math.random() * 100000)).umod(new BN(prime))

    // Round 4
    // prover
    const s4 = function (variableArray) {
      const fixedValues = [r1.toNumber(), r2.toNumber(), r3.toNumber()]
      return s(g, dimensions, prime).call(this, fixedValues.concat(variableArray))
    }

    // verifier
    const g4 = s4
    assert(
      g4(x(0, null))
        .add(g4(x(1, null)))
        .umod(new BN(prime))
        .cmp(g3(x(r3, null, null))) === 0
    )
    const r4 = new BN(Math.floor(Math.random() * 100000)).umod(new BN(prime))

    // Round 5 (final round)
    // prover
    const s5 = function (variableArray) {
      const fixedValues = [r1.toNumber(), r2.toNumber(), r3.toNumber(), r4.toNumber()]
      return s(g, dimensions, prime).call(this, fixedValues.concat(variableArray))
    }

    // verifier
    const g5 = s5
    assert(
      g5(x(0))
        .add(g5(x(1)))
        .umod(new BN(prime))
        .cmp(g4(x(r4, null))) === 0
    )
    const r5 = new BN(Math.floor(Math.random() * 100000)).umod(new BN(prime))

    // oracle check
    const oracle = function (variableArray) {
      return g(variableArray)
    }

    assert(
      oracle([r1.toNumber(), r2.toNumber(), r3.toNumber(), r4.toNumber(), r5.toNumber()])
        .umod(new BN(prime))
        .cmp(g5(x(r5)).umod(new BN(prime))) === 0
    )
  })
  it('should construct boolean formula from a tree', function () {
    const booleanFormula = new BooleanFormula({
      root: { // binary tree root
        o: 'AND', // operator
        l: { // left
          o: 'NOT',
          r: { // right
            o: 'OR',
            l: {}, // node 4
            r: {
              o: 'NOT',
              l: {} // node 6
            }
          }
        },
        r: {} // node 2
      }
    })
    // console.log(JSON.stringify(booleanFormula, null, 2))
    assert(booleanFormula.maxDepth === 5)
    assert(booleanFormula.nodes[0].children[0] === 1)
    assert(booleanFormula.nodes[0].children[1] === 2)
    assert.deepStrictEqual(booleanFormula.inputs, [2, 4, 6])
  })
  it('should evaluate boolean formula', function () {
    const booleanFormula = new BooleanFormula({
      root: {
        o: 'AND',
        l: {
          o: 'NOT',
          r: {
            o: 'OR',
            l: {},
            r: {
              o: 'NOT',
              l: {}
            }
          }
        },
        r: {}
      }
    })
    assert(booleanFormula.evaluate([1, 0, 1]) === 1)
    assert(booleanFormula.evaluate([0, 0, 0]) === 0)
    assert(booleanFormula.evaluate([1, 1, 1]) === 0)
    assert(booleanFormula.evaluate([1, 0, 0]) === 0)
  })
  it('should convert boolean formula to arithmetic circuit', function () {
    const booleanFormula = new BooleanFormula({
      root: {
        o: 'AND',
        l: {
          o: 'NOT',
          r: {
            o: 'OR',
            l: {},
            r: {
              o: 'NOT',
              l: {}
            }
          }
        },
        r: {}
      }
    })
    const arithmeticCircuit = booleanFormula.toArithmeticCircuit()
    const testCases = [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
      [0, 1, 1],
      [1, 0, 0],
      [1, 0, 1],
      [1, 1, 0],
      [1, 1, 1]
    ]

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      assert.strictEqual(arithmeticCircuit.evaluate(testCase), booleanFormula.evaluate(testCase))
    }
  })
  it('should matrix multiply normally', function () {
    const Amatrix = matrixGen(5)
    const Bmatrix = matrixGen(5)
    const Cmatrix = matrixMultiply(Amatrix, Bmatrix)
    assert.strictEqual(Cmatrix.length, 5)
    Cmatrix.forEach(row => {
      assert.strictEqual(row.length, 5)
    })
  })
  it.only('should simulate MATMULT', function () {
    const n = 16
    const Amatrix = matrixGen(n)
    // const Bmatrix = matrixGen(n)
    function genF(matrix) {
      return function (xBoolArr, yBoolArr) {
        const x = new BN(xBoolArr.join(''), 2).toNumber()
        const y = new BN(yBoolArr.join(''), 2).toNumber()
        return matrix[y][x]
      }
    }
    const fA = genF(Amatrix)
    // const fB = genF(Bmatrix)
    const rand1 = new BN(Math.floor(Math.random() * 16))
    const randBoolArr1 = bnToBoolArr(rand1, Math.log2(n))
    const rand2 = new BN(Math.floor(Math.random() * 16))
    const randBoolArr2 = bnToBoolArr(rand2, Math.log2(n))
    assert.strictEqual(fA(randBoolArr1, randBoolArr2).cmp(Amatrix[rand2.toNumber()][rand1.toNumber()]), 0)
  })
})
