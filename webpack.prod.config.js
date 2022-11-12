const configFactory = require('./webpack.config')

module.exports = configFactory({
  httpUrl: 'https://dex-stats2.p.rapidapi.com/graphql',
  wsUrl: 'wss://dex-stats2.p.rapidapi.com/graphql',
  apiKeyHeader: 'X-RapidAPI-Key',
})
