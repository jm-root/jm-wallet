var MS = require('jm-ms-core')
var ms = new MS()
var error = require('jm-err')
var Err = error.Err
module.exports = function (opts) {
  opts || (opts = {})
  var service = this
  let t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }
  service.routes || (service.routes = {})
  var routes = service.routes
  routes.filter_update = function (opts, cb, next) {
    if (opts.type === 'get') return next()
    if (opts.headers && opts.headers.acl_user) {
      var user = opts.headers.acl_user
      if (opts.params.id && opts.params.id !== user) {
        service.acl.get('/isAllowed', {
          user: user,
          resource: 'global',
          permissions: opts.type
        }, function (err, doc) {
          if (!err && doc && doc.ret) {
            opts.headers.acl_global = true
            return next()
          }
          cb(null, t(Err.FA_NOPERMISSION, opts.lng))
        })
        return
      }
    }
    next()
  }

  routes.transfer = function (opts, cb, next) {
    var data = opts.data
    data.fromUserId = opts.params.id
    data.ctCode = service.config.ctCode
    service.bank.post('/transfer', data, function (err, doc) {
      if (!err && doc) {
        doc = {
          id: doc.id,
          amount: doc.amount,
          memo: doc.memo,
          crtime: doc.crtime
        }
      }
      cb(null, doc)
    })
  }

  routes.records = function (opts, cb, next) {
    var data = opts.data
    data.userId = opts.params.id
    data.ctCode = service.config.ctCode
    service.bank.get('/transfers', data, function (err, doc) {
      if (!err && doc) {
        let rows = doc.rows
        let r = []
        rows.forEach(function (row) {
          if (row.fromAccount && row.fromAccount.user.userId === opts.params.id) {
            r.push({
              amount: -row.amount,
              balance: row.fromAccountBalance,
              crtime: row.crtime,
              memo: row.memo,
              orderId: row.orderId
            })
          } else {
            r.push({
              amount: row.amount,
              balance: row.toAccountBalance,
              crtime: row.crtime,
              memo: row.memo,
              orderId: row.orderId
            })
          }
        })
        doc.rows = r
      }
      cb(null, doc)
    })
  }

  routes.get = function (opts, cb, next) {
    var data = opts.data
    data.userId = opts.params.id
    data.ctCode = service.config.ctCode
    service.bank.get('/query', data, function (err, doc) {
      if (!err && doc) doc = doc[data.ctCode] || {}
      cb(null, doc)
    })
  }

  var router = ms.router()
  router
    .use('/', require('./help')(service))
    .use('/:id', routes.filter_update)
    .add('/:id/transfer', 'post', routes.transfer)
    .add('/:id/records', 'get', routes.records)
    .add('/:id', 'get', routes.get)

  return router
}
