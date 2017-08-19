require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
var config = {
  development: {
    port: 3000,
    lng: 'zh_CN',
    gateway: 'http://api.mx.jamma.cn',
    ctCode: 'tb',
    modules: {
      '': {
        module: process.cwd() + '/lib'
      }
    }
  },
  production: {
    port: 3000,
    lng: 'zh_CN',
    gateway: 'http://gateway.app',
    ctCode: 'tb',
    modules: {
      '': {
        module: process.cwd() + '/lib'
      }
    }
  }
}

var env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

module.exports = config
