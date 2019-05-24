'use strict'

const getDigitalSignatureArgsSchema = {
  $async: true,
  type: 'object',
  required: ['userId'],
  properties: {
    userId: {
      type: 'integer'
    },
    name: {
      type: 'string',
      minLength: 1
    },
    email: {
      type: 'string',
      format: 'email'
    }
  }
}

const verifyDigitalSignatureArgsSchema = {
  $async: true,
  type: 'object',
  required: ['signature'],
  properties: {
    signature: {
      type: 'string',
      // eslint-disable-next-line no-useless-escape
      pattern: '^-----BEGIN PGP SIGNATURE-----(\s*)|(.*)-----END PGP SIGNATURE-----$'
    },
    fileHash: {
      type: 'string',
      pattern: '([0-9]|[a-fA-F])'
    }
  }
}

module.exports = {
  getDigitalSignatureArgsSchema,
  verifyDigitalSignatureArgsSchema
}
