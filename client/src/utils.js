const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko();

const usdToWei = (usd, ethPriceUsd) => {
    if (ethPriceUsd === 0) return 0;
    return (usd / ethPriceUsd) * 1e18;
}

const weiToUsd = (wei, ethPriceUsd) => {
    return (ethPriceUsd * (wei / 1e18)).toFixed(2);
}

const numberWithCommas = (x) => {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const StakeStatus = {
  Requested: "0",
  Filled: "1",
  Expired: "2",
  Cancelled: "3",
  AwaitingReturnPayment: "4",
  Completed: "5",
  EscrowClaimed: "6"
};

exports.CoinGeckoClient = CoinGeckoClient;
exports.usdToWei = usdToWei;
exports.weiToUsd = weiToUsd;
exports.numberWithCommas = numberWithCommas;
exports.StakeStatus = StakeStatus;
