const MS = require('jm-ms')
const ms = new MS()
const log = require('jm-log4js')
const logger = log.getLogger('wallet')

module.exports = function (opts = {}) {
  if (opts.debug) {
    logger.setLevel('debug')
  }

  let o = {
    ready: true,
    gateway: opts.gateway,
    ctCode: opts.ct_code,

    bind: async function (name, uri) {
      uri || (uri = `/${name}`)
      let doc = await ms.client({uri: this.gateway + uri})
      this[name] = doc
      return doc
    }
  }
  o.router = require('./router')

  o.bind('acl')
  o.bind('user')
  o.bind('bank')

  return o
}
