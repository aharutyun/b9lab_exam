// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  contracts_build_directory: __dirname + "/ui/src/contracts",
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}