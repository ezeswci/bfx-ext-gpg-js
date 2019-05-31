'use strict'

const { FileValidationError } = require('../errors')
const isBuffer = require('./is-buffer')

const _isHex = (h) => (
  typeof h === 'string' &&
  (h.match(/([0-9]|[a-fA-F])/gm) || []).length === h.length
)

module.exports = (file, { fileHash } = {}) => {
  if (fileHash) {
    return
  }
  if (!isBuffer(file) && !_isHex(file)) {
    throw new FileValidationError()
  }
}
