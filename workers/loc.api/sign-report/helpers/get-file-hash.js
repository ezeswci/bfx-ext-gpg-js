'use strict'

const { isBuffer } = require('../../helpers')

const {
  crypto: { hash },
  util: { Uint8Array_to_hex: uint8ArrayToHex }
} = require('openpgp')

module.exports = async (file) => {
  const buffer = isBuffer(file)
    ? Buffer.from(file)
    : Buffer.from(file, 'hex')
  const fileUint8Array = new Uint8Array(buffer)

  const hashUint8Array = await hash.sha256(fileUint8Array)

  return uint8ArrayToHex(hashUint8Array)
}
