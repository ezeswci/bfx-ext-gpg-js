'use strict'

const {
  generateKey,
  sign,
  key,
  cleartext: { fromText }
} = require('openpgp')

const {
  getFileHash,
  savePublicKey
} = require('./helpers')

module.exports = async (
  { db },
  file,
  {
    userId,
    name,
    email
  } = {}
) => {
  const fileHash = await getFileHash(file)

  const {
    privateKeyArmored,
    publicKeyArmored
  } = await generateKey({
    userIds: [{ name, email }],
    curve: 'ed25519'
  })

  const {
    keys: [privKeyObj]
  } = await key.readArmored(privateKeyArmored)

  const { signature } = await sign({
    message: fromText(fileHash),
    privateKeys: [privKeyObj],
    detached: true
  })

  await savePublicKey(
    db,
    fileHash,
    publicKeyArmored,
    userId
  )

  return signature
}
