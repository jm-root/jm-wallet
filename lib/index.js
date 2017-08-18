var MS = require('jm-ms')
var ms = MS()
module.exports = function (opts) {
  opts || (opts = {});
  ['ctCode'].forEach(function (key) {
    process.env[key] && (opts[key] = process.env[key])
  })
  var o = {
    config: opts
  }
  o.router = require('./router')
  var bind = function (name, uri) {
    uri || (uri = '/' + name)
    ms.client({
      uri: opts.gateway + uri
    }, function (err, doc) {
      !err && doc && (o[name] = doc)
    })
  }
  bind('user')
  bind('bank')
  return o
}
