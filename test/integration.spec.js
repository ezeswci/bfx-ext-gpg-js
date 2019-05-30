'use strict'

const path = require('path')

const { assert } = require('chai')
const { MongoMemoryServer } = require('mongodb-memory-server')
const {
  grapes: createGrapes,
  worker: createWorker,
  client: createClient
} = require('bfx-svc-test-helper')

const {
  isValidSignature,
  getHashFromBuffer
} = require('./helpers')

const mongoServer = new MongoMemoryServer()
let grapes = null
let worker = null
let client = null

const userInfo = {
  userId: 1,
  name: 'fakeName',
  email: 'fake@email.fake'
}
const buffFile1 = Buffer.from('Some file 1', 'utf8')
const buffFile2 = Buffer.from('Some file 2', 'utf8')
const hexStrBuff1 = buffFile1.toString('hex')

describe('RPC integration', () => {
  before(async function () {
    this.timeout(20000)

    const mongoUri = await mongoServer.getConnectionString()

    grapes = createGrapes()
    await grapes.start()

    worker = createWorker(
      {
        env: 'development',
        wtype: 'wrk-ext-gpg-api',
        apiPort: 8822,
        serviceRoot: path.join(__dirname, '..'),
        mongoUri
      },
      grapes
    )
    await worker.start()

    client = createClient(worker)
  })

  after(async function () {
    this.timeout(5000)

    const db = worker.worker.grc_bfx.api.db
    await db.dropDatabase()

    await client.stop()
    await worker.stop()
    await grapes.stop()
  })

  it('it should get a signature of the file buffer', async function () {
    this.timeout(5000)

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [buffFile1, userInfo]
      },
      { timeout: 5000 }
    )

    isValidSignature(signature)
  })

  it('it should get a signature of the file buffer as a hex string', async function () {
    this.timeout(5000)

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [hexStrBuff1, userInfo]
      },
      { timeout: 5000 }
    )

    isValidSignature(signature)
  })

  it('it should throw ERR_FILE_IS_NOT_BUFFER_OR_HEX error for wrong hex string of file buffer', async function () {
    this.timeout(5000)

    const hexStrBuff = '---'

    try {
      await client.request(
        {
          action: 'getDigitalSignature',
          args: [hexStrBuff, userInfo]
        },
        { timeout: 5000 }
      )

      assert.ifError(new Error('The request should not be successful'))
    } catch (err) {
      assert.match(err.toString(), /ERR_FILE_IS_NOT_BUFFER_OR_HEX/)
    }
  })

  it('it should throw ERR_ARGS_VALIDATION error for wrong userInfo params', async function () {
    this.timeout(5000)

    const wrongUserInfoArr = [
      { ...userInfo, userId: 'it should be an integer' },
      { ...userInfo, name: 123 },
      { ...userInfo, email: 123 },
      { name: userInfo.name, email: userInfo.email },
      {},
      null
    ]

    for (const userInfo of wrongUserInfoArr) {
      try {
        await client.request(
          {
            action: 'getDigitalSignature',
            args: [hexStrBuff1, userInfo]
          },
          { timeout: 5000 }
        )

        assert.ifError(new Error('The request should not be successful'))
      } catch (err) {
        assert.match(err.toString(), /ERR_ARGS_VALIDATION/)
      }
    }
  })

  it('it should be a valid signature of the file buffer', async function () {
    this.timeout(5000)

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [buffFile1, userInfo]
      },
      { timeout: 5000 }
    )

    const isValid = await client.request(
      {
        action: 'verifyDigitalSignature',
        args: [buffFile1, { signature }]
      },
      { timeout: 5000 }
    )

    assert.isTrue(isValid)
  })

  it('it should be a valid signature of the file buffer as a hex string', async function () {
    this.timeout(5000)

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [hexStrBuff1, userInfo]
      },
      { timeout: 5000 }
    )

    const isValid = await client.request(
      {
        action: 'verifyDigitalSignature',
        args: [hexStrBuff1, { signature }]
      },
      { timeout: 5000 }
    )

    assert.isTrue(isValid)
  })

  it('it should be a valid signature of the file hash', async function () {
    this.timeout(5000)

    const fileHash = getHashFromBuffer(buffFile1)

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [buffFile1, userInfo]
      },
      { timeout: 5000 }
    )

    const isValid = await client.request(
      {
        action: 'verifyDigitalSignature',
        args: [null, { fileHash, signature }]
      },
      { timeout: 5000 }
    )

    assert.isTrue(isValid)
  })

  it('it should not be a valid signature of the file buffer', async function () {
    this.timeout(5000)

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [buffFile2, userInfo]
      },
      { timeout: 5000 }
    )

    const isValid = await client.request(
      {
        action: 'verifyDigitalSignature',
        args: [buffFile1, { signature }]
      },
      { timeout: 5000 }
    )

    assert.isFalse(isValid)
  })

  it('it should not be a valid signature of the file hash', async function () {
    this.timeout(5000)

    const fileHash = getHashFromBuffer(buffFile2)

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [buffFile1, userInfo]
      },
      { timeout: 5000 }
    )

    const isValid = await client.request(
      {
        action: 'verifyDigitalSignature',
        args: [null, { fileHash, signature }]
      },
      { timeout: 5000 }
    )

    assert.isFalse(isValid)
  })

  it('it should throw ERR_ARGS_VALIDATION error for wrong PGP signature format', async function () {
    this.timeout(5000)

    const signature = 'wrong format PGP signature'

    try {
      await client.request(
        {
          action: 'verifyDigitalSignature',
          args: [buffFile1, { signature }]
        },
        { timeout: 5000 }
      )

      assert.ifError(new Error('The request should not be successful'))
    } catch (err) {
      assert.match(err.toString(), /ERR_ARGS_VALIDATION/)
    }
  })

  it('it should throw ERR_ARGS_VALIDATION error for wrong hex string of file hash', async function () {
    this.timeout(5000)

    const fileHash = '---'

    const signature = await client.request(
      {
        action: 'getDigitalSignature',
        args: [buffFile1, userInfo]
      },
      { timeout: 5000 }
    )

    try {
      await client.request(
        {
          action: 'verifyDigitalSignature',
          args: [null, { fileHash, signature }]
        },
        { timeout: 5000 }
      )

      assert.ifError(new Error('The request should not be successful'))
    } catch (err) {
      assert.match(err.toString(), /ERR_ARGS_VALIDATION/)
    }
  })
})
