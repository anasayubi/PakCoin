// Show how to create an account with coinbase
var client = require('../coinbase')

client.createAccount({name: 'anasayubi'}, function(err, account) {
  console.log(account);
});