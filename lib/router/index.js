const { ms } = require('jm-server')
const error = require('jm-err')
const Err = error.Err

module.exports = function (service) {
  async function filter (opts = {}) {
    const { acl } = service.gateway
    const { type, headers = {}, params = {}, data = {} } = opts
    data.ctCode = service.ctCode
    // if (type === 'get') return
    const { acl_user: aclUser, acl_role: aclRole } = headers
    if (!aclUser && !aclRole) return
    const { id } = params
    if (aclRole) {
      try {
        const doc = await acl.get('/areAnyRolesAllowed', {
          roles: aclRole,
          resource: 'global',
          permissions: type
        })
        if (doc && doc.ret) {
          headers.acl_global = true
          return
        }
      } catch (e) {}
    }

    if (aclUser) {
      if (id === aclUser) return
      try {
        const doc = await acl.get('/isAllowed', {
          user: aclUser,
          resource: 'global',
          permissions: type
        })
        if (doc && doc.ret) {
          headers.acl_global = true
          return
        }
      } catch (e) {}
    }

    throw error.err(Err.FA_NOPERMISSION)
  }

  async function transfer (opts = {}) {
    const { bank } = service.gateway
    const { data = {}, params = {} } = opts
    data.fromUserId = params.id
    if (data.fromAccountId) delete data.fromAccountId
    const doc = await bank.post('/transfer', data)
    const { id, amount, memo, crtime } = doc
    return { id, amount, memo, crtime }
  }

  async function records (opts = {}) {
    const { bank } = service.gateway
    const { data = {}, params = {} } = opts
    data.userId = params.id
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
    const { bank } = service.gateway
    const { data = {}, params = {} } = opts
    data.userId = params.id
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
