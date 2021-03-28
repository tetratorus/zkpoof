const BN = require('bn.js')
const utils = require('./utils')

function matrixMultiply (A, B, { prime } = {}) {
  const C = []
  // construct output matrix dimensions
  for (let i = 0; i < A.length; i++) {
    C.push([])
  }

  function getRow (matrix, num) {
    return matrix[num]
  }

  function getCol (matrix, num) {
    const c = []
    // TODO: cache this
    for (let i = 0; i < matrix.length; i++) {
      c.push(matrix[i][num])
    }
    return c
  }

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      let Cij = new BN(0)
      const row = getRow(A, j)
      const col = getCol(B, i)
      if (row.length !== col.length) throw new Error('row and col not equal length')
      for (let k = 0; k < row.length; k++) {
        let temp = row[k].mul(col[k])
        if (prime) temp = temp.umod(prime)
        Cij = Cij.add(temp)
        if (prime) Cij = Cij.umod(prime)
      }
      C[i][j] = Cij
    }
  }

  return C
}

function matrixGen (n) {
  const m = []
  for (let i = 0; i < n; i++) {
    m.push([])
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      m[j][i] = utils.randomScalar()
    }
  }
  return m
}

module.exports = {
  matrixMultiply,
  matrixGen,
}
