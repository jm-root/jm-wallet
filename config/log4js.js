module.exports = {
  appenders: {
    console: { type: 'console' },
    wallet: {
      type: 'dateFile',
      filename: 'logs/wallet',
      pattern: 'yyyyMMdd.log',
      alwaysIncludePattern: true
    }
  },
  categories: {
    default: { appenders: [ 'console' ], level: 'info' },
    wallet: { appenders: [ 'console', 'wallet' ], level: 'info' }
  }
}
