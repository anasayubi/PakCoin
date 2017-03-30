// This file initisalises coinbase for the application
// Set api key and api secret key
var apiKey = ''
var apiSecretKey = ''
 
// Coinbase client for accessing accounts/wallets
var Client = require('coinbase').Client
// Initialise coinbase client with registered account
var client = new Client({
  'apiKey': apiKey,
  'apiSecret': apiSecretKey,
})

// Module returns the client for account and wallet access
module.exports = client