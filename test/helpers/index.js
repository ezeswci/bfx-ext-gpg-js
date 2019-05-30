'use strict'

const crypto = require('crypto')
const { assert } = require('chai')

const isValidSignature = (signature) => {
  assert.isString(signature)
  assert.match(
    signature,
    /^-----BEGIN PGP SIGNATURE-----(\s*)|(.*)-----END PGP SIGNATURE-----$/
  )
}

const getHashFromBuffer = (buffer) => {
  const hash = crypto.createHash('sha256')
  hash.update(buffer, 'utf8')

  return hash.digest('hex')
}

module.exports = {
  isValidSignature,
  getHashFromBuffer
}
