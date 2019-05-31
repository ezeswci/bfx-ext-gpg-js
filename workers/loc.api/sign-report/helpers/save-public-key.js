'use strict'

module.exports = (
  db,
  fileHash,
  publicKeyArmored,
  userId
) => {
  return db
    .collection('signatures')
    .insertOne({
      userId,
      fileHash,
      publicKeyArmored
    })
}
