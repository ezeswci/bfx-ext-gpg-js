'use strict'

const {
  verify,
  key,
  cleartext: { fromText },
  signature: { readArmored }
} = require('openpgp')

const {
  getFileHash,
  findPublicKeys
} = require('./helpers')

module.exports = async (
  extGpg,
  file,
  { signature, fileHash } = {}
) => {
  try {
    const _fileHash = typeof fileHash === 'string'
      ? fileHash
      : await getFileHash(file)
    const { db } = extGpg
    const publicKeysArmored = await findPublicKeys(
      db,
      _fileHash
    )

    for (const { publicKeyArmored } of publicKeysArmored) {
      const {
        keys: [pubKeyObj]
      } = await key.readArmored(publicKeyArmored)

      const {
        signatures: [sign]
      } = await verify({
        message: fromText(_fileHash),
        signature: await readArmored(signature),
        publicKeys: pubKeyObj
      })

      if (!sign.valid) {
        continue
      }

      return !!sign.valid
    }

    return false
  } catch (err) {
    extGpg.logger.error(err.stack || err)

    return false
  }
}
