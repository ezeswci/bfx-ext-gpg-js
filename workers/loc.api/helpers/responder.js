'use strict'

let deps = {}

module.exports = async (handler, name, cb) => {
  try {
    const res = await handler()

    if (!cb) return res
    cb(null, res)
  } catch (err) {
    const _name = name
      ? `\n  - METHOD_NAME: ${name}`
      : ''
    const _err = `\n  - ${err.stack || err}`

    deps.logger.error(`${_name}${_err}`)

    if (cb) cb(err)
    else throw err
  }
}

module.exports.inject = (inDeps) => {
  deps = { ...deps, ...inDeps }
}
