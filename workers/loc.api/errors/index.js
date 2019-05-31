'use strict'

class BaseError extends Error {
  constructor (message) {
    super(message)

    this.name = this.constructor.name
    this.message = message

    Error.captureStackTrace(this, this.constructor)
  }
}

class ArgsValidationError extends BaseError {
  constructor (errors) {
    const str = errors && typeof errors === 'object'
      ? `${JSON.stringify(errors)}`
      : ''

    super(`ERR_ARGS_VALIDATION: ${str}`)

    this.errors = errors
  }
}

class ArgsValidSchemaFindingError extends BaseError {
  constructor (message = 'ERR_ARGS_SCHEMA_NOT_FOUND') {
    super(message)
  }
}

class FileValidationError extends BaseError {
  constructor (message = 'ERR_FILE_IS_NOT_BUFFER_OR_HEX') {
    super(message)
  }
}

module.exports = {
  BaseError,
  ArgsValidationError,
  ArgsValidSchemaFindingError,
  FileValidationError
}
