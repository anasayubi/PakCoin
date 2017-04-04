// Show how to generate a public key with coinbase API
var client = require('../coinbase')

var address = null;

client.getAccount('primary', function(err, account) {
  account.createAddress(function(err, addr) {
    console.log(addr);
    address = addr;
  });
});
