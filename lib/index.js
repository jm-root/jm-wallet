let MS = require('jm-ms')
let ms = MS()
module.exports = function (opts) {
  opts || (opts = {});
  ['ctCode'].forEach(function (key) {
    process.env[key] && (opts[key] = process.env[key])
  })
  let o = {
    config: opts
  }
  o.router = require('./router')
  let bind = function (name, uri) {
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
