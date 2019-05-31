'use strict'

const Ajv = require('ajv')
const ajv = new Ajv()

const {
  ArgsValidSchemaFindingError,
  ArgsValidationError
} = require('../errors')

const schema = require('./schema')
const compiledSchema = Object.entries(schema)
  .reduce((accum, [key, schema]) => ({
    ...accum,
    [key]: ajv.compile(schema)
  }), {})

module.exports = async (
  args,
  schemaName
) => {
  if (!compiledSchema[schemaName]) {
    throw new ArgsValidSchemaFindingError()
  }

  const validate = compiledSchema[schemaName]

  try {
    await validate(args)
  } catch (err) {
    if (err instanceof Ajv.ValidationError) {
      throw new ArgsValidationError(err.errors)
    }

    throw err
  }
}
