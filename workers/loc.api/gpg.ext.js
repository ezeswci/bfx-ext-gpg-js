'use strict'

const { Api } = require('bfx-wrk-api')

const {
  checkArgs,
  checkFile,
  responder
} = require('./helpers')
const {
  getDigitalSignature,
  verifyDigitalSignature
} = require('./sign-report')

class ExtGpg extends Api {
  getDigitalSignature (space, file, args, cb) {
    return responder(async () => {
      await checkArgs(args, 'getDigitalSignatureArgsSchema')
      checkFile(file, args)

      return getDigitalSignature(this, file, args)
    }, 'getDigitalSignature', cb)
  }

  verifyDigitalSignature (space, file, args, cb) {
    return responder(async () => {
      await checkArgs(args, 'verifyDigitalSignatureArgsSchema')
      checkFile(file, args)

      return verifyDigitalSignature(this, file, args)
    }, 'verifyDigitalSignature', cb)
  }

  _initialize (db) {
    this.logger = this.ctx.grc_bfx.caller.logger
    this.db = db || this.ctx.dbMongo_m0.db

    responder.inject({ logger: this.logger })

    return this.db
      .collection('signatures')
      .createIndex({ fileHash: 1 })
  }
}

module.exports = ExtGpg
