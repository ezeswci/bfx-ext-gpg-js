'use strict'

const { Api } = require('bfx-wrk-api')

const {
  checkArgs,
  checkFile
} = require('./helpers')
const {
  getDigitalSignature,
  verifyDigitalSignature
} = require('./sign-report')

class ExtGpg extends Api {
  getDigitalSignature (space, file, args, cb) {
    return this._responser(async () => {
      checkFile(file)
      await checkArgs(args, 'getDigitalSignatureArgsSchema')

      return getDigitalSignature(this, file, args)
    }, 'getDigitalSignature', cb)
  }

  verifyDigitalSignature (space, file, args, cb) {
    return this._responser(async () => {
      checkFile(file)
      await checkArgs(args, 'verifyDigitalSignatureArgsSchema')

      return verifyDigitalSignature(this, file, args)
    }, 'verifyDigitalSignature', cb)
  }

  _initialize (db) {
    this.logger = this.ctx.grc_bfx.caller.logger
    this.db = db || this.ctx.dbMongo_m0.db

    return this.db
      .collection('signatures')
      .createIndex({ fileHash: 1 })
  }

  async _responser (handler, name, cb) {
    try {
      const res = await handler()

      if (!cb) return res
      cb(null, res)
    } catch (err) {
      const str = `METHOD_NAME: ${name}`
      this.logger.error(`\n  - ${str}\n  - ${err.stack || err}`)

      if (cb) cb(err)
      else throw err
    }
  }
}

module.exports = ExtGpg
