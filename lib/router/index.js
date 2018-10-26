const wrapper = require('jm-ms-wrapper')
const MS = require('jm-ms-core')
const error = require('jm-err')

const ms = new MS()
const Err = error.Err

module.exports = function (opts = {}) {
  let service = this

  async function filter (opts = {}) {
    const {type, headers = {}, params = {}, data = {}} = opts
    data.ctCode = service.ctCode
    if (type === 'get') return
    const {acl_user} = headers
    if (!acl_user) return
    const user = acl_user
    const {id} = params
    if (id === user) return
    const doc = await service.acl.get('/isAllowed', {
      user,
      resource: 'global',
      permissions: type
    })
    if (doc && doc.ret) {
      headers.acl_global = true
      return
    }
    throw error.err(Err.FA_NOPERMISSION)
  }

  async function transfer (opts = {}) {
    const {data = {}, params = {}} = opts
    data.fromUserId = params.id
    const doc = await service.bank.post('/transfer', data)
    const {id, amount, memo, crtime} = doc
    return {id, amount, memo, crtime}
  }

  async function records (opts = {}) {
    const {data = {}, params = {}} = opts
    data.userId = params.id
    const doc = await service.bank.get('/transfers', data)
    let rows = doc.rows
    let r = []
    rows.forEach(function (row) {
      const {amount, fromAccountBalance, toAccountBalance, crtime, memo, orderId, fromUserId} = row
      const o = {
        amount,
        crtime,
        memo,
        orderId,
        balance: toAccountBalance
      }

      if (fromUserId === params.id) {
        o.amount = -amount
        o.balance = fromAccountBalance
      }

      // deprecated 兼容 jm-bank@3.1.0 及之前版本
      if (row.fromAccount && row.fromAccount.user && row.fromAccount.user.id === params.id) {
        o.amount = -amount
        o.balance = fromAccountBalance
      }

      r.push(o)
    })
    doc.rows = r
    return doc
  }

  async function get (opts) {
    const {data = {}, params = {}} = opts
    data.userId = params.id
    return service.bank.get('/query', data)
  }

  const router = ms.router()
  wrapper()(router)

  router
    .use('/', require('./help')(service))
    .use('/:id', filter)
    .add('/:id/transfer', 'post', transfer)
    .add('/:id/records', 'get', records)
    .add('/:id', 'get', get)

  return router
}
