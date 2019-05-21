'use strict'

require('colors')
const path = require('path')
const argv = require('yargs').argv
const {
  createLogger,
  format,
  transports
} = require('winston')
const {
  combine,
  timestamp,
  label,
  printf,
  align
} = format

const isProdEnv = (
  argv.env === 'production' ||
  process.env.NODE_ENV === 'production'
)
const isTestEnv = (
  argv.env === 'test' ||
  process.env.NODE_ENV === 'test'
)
const isLoggerDisabled = argv.isLoggerDisabled

const basePath = '../../../logs'
const ext = '.log'
const pathError = path.join(
  __dirname,
  basePath,
  `errors-worker${ext}`
)
const pathExcLogger = path.join(
  __dirname,
  basePath,
  `exceptions-worker${ext}`
)
const logLabel = 'EXT_GPG'
const maxSize = 1024000

const baseTransports = []
const exceptionHandlers = []

const _combineFormat = (colorize = !isProdEnv) => {
  return combine(
    label({ label: logLabel }),
    timestamp(),
    align(),
    printf(obj => {
      let str = `${obj.label}:${obj.level.toUpperCase()} [${obj.timestamp}]`

      if (colorize) {
        str = obj.level === 'error'
          ? str.red
          : str.blue
      }

      return `${str} ${obj.message}`
    })
  )
}

if (isProdEnv) {
  baseTransports.push(
    new transports.File({
      filename: pathError,
      level: 'error',
      maxsize: maxSize,
      colorize: false
    })
  )
  exceptionHandlers.push(
    new transports.File({
      filename: pathExcLogger,
      maxsize: maxSize,
      colorize: false
    }),
    new transports.Console({
      colorize: false
    })
  )
} else {
  baseTransports.push(
    new transports.Console({
      level: 'debug',
      colorize: false,
      handleExceptions: true
    })
  )
}

const logger = createLogger({
  format: _combineFormat(),
  transports: baseTransports,
  exceptionHandlers,
  silent: isLoggerDisabled || isTestEnv,
  exitOnError: false
})

if (exceptionHandlers[0]) {
  exceptionHandlers[0].on('logged', () => {
    setTimeout(() => {
      process.exit(1)
    }, 2000)
  })
}

module.exports = logger
