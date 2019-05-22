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
  { signature } = {}
) => {
  try {
    const fileHash = await getFileHash(file)
    const { db } = extGpg
    const publicKeysArmored = await findPublicKeys(
      db,
      fileHash
    )

    for (const { publicKeyArmored } of publicKeysArmored) {
      const {
        keys: [pubKeyObj]
      } = await key.readArmored(publicKeyArmored)

      const {
        signatures: [sign]
      } = await verify({
        message: fromText(fileHash),
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
    const logger = extGpg.ctx.grc_bfx.caller.logger
    logger.error(err.stack || err)

    return false
  }
}
