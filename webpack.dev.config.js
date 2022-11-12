const configFactory = require('./webpack.config')

module.exports = configFactory({
  httpUrl: 'http://localhost:8080/graphql',
  wsUrl: 'ws://localhost:8080/graphql',
  apiKeyHeader: 'X-Auth-Key',
  extraHeaders: {
    'X-Auth-Role': 'admin',
  },
})
