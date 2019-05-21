
'use strict'

const { Api } = require('bfx-wrk-api')

class ExtGpg extends Api {
  async _initialize (db) {
    this.db = db || this.ctx.dbMongo_m0.db
    const signsColl = this.db.collection('signatures')

    await signsColl.createIndex({ fileHash: 1 })
  }
}

module.exports = ExtGpg
