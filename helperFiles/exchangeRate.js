// Show the exchange rate of BTC to USD and BTC to PKR
var client = require('../coinbase')

client.getExchangeRates({'currency': 'BTC'}, function(err, rates) {
  //console.log(rates);
  console.log(`BTC to PKR ${rates.data.rates.PKR}`)
  console.log(`BTC to USD ${rates.data.rates.USD}`)
});