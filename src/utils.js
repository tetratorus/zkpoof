const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const keccak = require('keccak')
const BN = require('bn.js')
const crypto = require('crypto')

class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
  }
}

function randomScalar () {
  return new BN(crypto.randomBytes(32)).umod(ec.curve.p)
}
function randomPoint () {
  return pointFromX(randomScalar())
}
function pointFromX (x) {
  try {
    return new Point(x, getY(x))
  } catch (e) {
    return pointFromX(new BN(1).add(x).umod(ec.curve.p))
  }
}
function getY (x) {
  const xCubed = new BN(x).pow(new BN(3)).umod(ec.curve.p)
  const ySquared = xCubed.add(new BN(7)).umod(ec.curve.p)
  const y = ySquared.toRed(ec.curve.red).redSqrt().fromRed()
  // check that its on the curve
  if (new BN(x).pow(new BN(3)).umod(ec.curve.p).add(new BN(7)).umod(ec.curve.p).cmp(y.pow(new BN(2)).umod(ec.curve.p)) !== 0) {
    throw new Error('point not on curve')
  }
  return y
}
module.exports = {
  pointFromX,
  keccak,
  Point,
  randomScalar,
  randomPoint,
  ec
}
