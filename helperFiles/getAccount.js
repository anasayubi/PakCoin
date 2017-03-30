// Show how to get an accout via coinbase account ID
var client = require('../coinbase')

client.getAccount("ef3fdadf-87b9-594f-add1-0e6d721c928f", function(err, account) {
  console.log(account);
});