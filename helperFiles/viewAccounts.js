// View all accounts from set coinbase account
var client = require('../coinbase')

client.getAccounts({}, function(err, accounts) {
  accounts.forEach(function(acct) {
    console.log(acct.name + ': ' + acct.balance.amount + ' ' + acct.balance.currency);
    acct.getTransactions(null, function(err, txns) {
      txns.forEach(function(txn) {
        console.log('txn: ' + txn.id);
      });
    });
  });
});