const { ms } = require('jm-server')
const error = require('jm-err')
const Err = error.Err

module.exports = function (service) {
  async function filter (opts = {}) {
    const { headers = {}, params = {}, data = {} } = opts
    data.ctCode = service.ctCode
    const { acl_user: aclUser } = headers
    const { id } = params
    opts.id = id
    if (id === 'me') {
      if (aclUser) {
        opts.id = aclUser
        return
      }
      throw error.err(Err.FA_NOPERMISSION)
    }
  }

  async function transfer (opts = {}) {
    const { bank } = service.gateway
    const { data = {} } = opts
    data.fromUserId = opts.id
    if (data.fromAccountId) delete data.fromAccountId
    const doc = await bank.post('/transfer', data)
    const { id, amount, memo, crtime } = doc
    return { id, amount, memo, crtime }
  }

  async function records (opts = {}) {
    const { bank } = service.gateway
    const { data = {} } = opts
    data.userId = opts.id
    const doc = await bank.get('/transfers', data)
    let rows = doc.rows
    let r = []
    rows.forEach(function (row) {
      const { amount, fromAccountBalance, toAccountBalance, crtime, memo, orderId, fromUserId } = row
      const o = {
        amount,
        crtime,
        memo,
        orderId,
        balance: toAccountBalance
      }

      if (fromUserId === opts.id) {
        o.amount = -amount
        o.balance = fromAccountBalance
      }

      // deprecated 兼容 jm-bank@3.1.0 及之前版本
      if (row.fromAccount && row.fromAccount.user && row.fromAccount.user.id === opts.id) {
        o.amount = -amount
        o.balance = fromAccountBalance
      }

      r.push(o)
    })
    doc.rows = r
    return doc
  }

  async function get (opts) {
    console.log(opts)
    const { bank } = service.gateway
    const { data = {} } = opts
    data.userId = opts.id
    const doc = await bank.get('/query', data)
    return doc[data.ctCode] || {}
  }

  const router = ms.router()

  router
    .use('/:id', filter)
    .add('/:id/transfer', 'post', transfer)
    .add('/:id/records', 'get', records)
    .add('/:id', 'get', get)

  return router
}
