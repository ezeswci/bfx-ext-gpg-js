'use strict'

module.exports = (
  db,
  fileHash
) => {
  return db
    .collection('signatures')
    .find(
      { fileHash },
      { projection: { _id: 0 } }
    )
    .toArray()
}
