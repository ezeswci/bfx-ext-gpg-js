'use strict'

const { WrkApi } = require('bfx-wrk-api')
const async = require('async')
const argv = require('yargs')
  .option('isLoggerDisabled', {
    type: 'boolean',
    default: false
  })
  .help('help')
  .argv

const logger = require('./loc.api/logger')

const isTestEnv = (
  argv.env === 'test' ||
  process.env.NODE_ENV === 'test'
)

class WrkExtGpgApi extends WrkApi {
  constructor (conf, ctx) {
    super(conf, ctx)

    this.loadConf('gpg.ext', 'ext')

    this.logger = logger(
      argv.isLoggerDisabled ||
      conf.ext.isLoggerDisabled
    )

    this.init()
    this.start()
  }

  getPluginCtx (type) {
    const ctx = super.getPluginCtx(type)

    if (type === 'api_bfx') {
      ctx.dbMongo_m0 = this.dbMongo_m0
    }

    return ctx
  }

  init () {
    super.init()

    const opts = isTestEnv
      ? { mongoUri: this.ctx.mongoUri }
      : {}

    const facs = [
      ['fac', 'bfx-facs-db-mongo', 'm0', 'm0', opts]
    ]

    this.setInitFacs(facs)
  }

  async _initExt () {
    const extGpg = this.grc_bfx.api

    if (!extGpg.ctx) {
      extGpg.ctx = extGpg.caller.getCtx()
    }

    await extGpg._initialize()
  }

  _start (cb) {
    async.series(
      [
        next => { super._start(next) },
        next => { this._initExt().then(next).catch(next) }
      ],
      err => {
        if (err) {
          this.logger.error(err.stack || err)

          cb(err)

          return
        }

        cb()
      }
    )
  }
}

module.exports = WrkExtGpgApi
