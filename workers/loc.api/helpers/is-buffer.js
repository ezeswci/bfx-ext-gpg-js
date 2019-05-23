'use strict'

module.exports = (obj) => (
  Buffer.isBuffer(obj) ||
  (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'Buffer'
  )
)
