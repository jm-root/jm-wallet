var helper = require('jm-ms-help')
var MS = require('jm-ms-core')
var ms = new MS()

module.exports = function (service) {
  let router = ms.router()
  router.add('/', 'get', function (opts, cb, next) {
    opts.help || (opts.help = {})
    opts.help.status = 1
    if (!service.ready) opts.help.status = 0
    next()
  })
  helper.enableHelp(router, require('../../package.json'))
  return router
}
