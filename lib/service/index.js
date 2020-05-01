const log = require('jm-log4js')
const logger = log.getLogger('wallet')
const { Service } = require('jm-server')

module.exports = class extends Service {
  constructor (opts = {}) {
    super(opts)

    const { gateway, ct_code: ctCode } = opts
    this.logger = logger
    Object.assign(this, { logger, ctCode })

    require('./gateway')({ gateway }).then(doc => {
      doc.bind('acl')
      doc.bind('bank')
      this.gateway = doc
      this.emit('ready')
    })
  }

  router (opts) {
    const dir = `${__dirname}/../router`
    return this.loadRouter(dir, opts)
  }
}
