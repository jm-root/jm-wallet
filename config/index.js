require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
let config = {
  development: {
    port: 3000,
    lng: 'zh_CN',
    gateway: 'http://gateway.app',
    ctCode: 'cny',
    modules: {
      '': {
        module: process.cwd() + '/lib'
      }
    }
  },
  production: {
    port: 80,
    lng: 'zh_CN',
    gateway: 'http://gateway.app',
    ctCode: 'cny',
    modules: {
      '': {
        module: process.cwd() + '/lib'
      }
    }
  }
}

let env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

module.exports = config
