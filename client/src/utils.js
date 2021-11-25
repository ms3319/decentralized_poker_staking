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

const GameType = {
  SingleGame: 0,
  Tournament: 1
}

exports.numberWithCommas = numberWithCommas;
exports.StakeStatus = StakeStatus;
exports.GameType = GameType;
