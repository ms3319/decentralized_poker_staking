const numberWithCommas = (x) => {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const units = (amount) => {
  return Math.round(amount / 1e18);
}

const dateFromTimeStamp = timeStamp => new Date(timeStamp * 1000);

const timeUntilDate = date => {
  // get total seconds between the times
  let delta = Math.abs(date - Date.now()) / 1000;

  // calculate (and subtract) whole days
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;

  // calculate (and subtract) whole hours
  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  // calculate (and subtract) whole minutes
  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  // what's left is seconds
  const seconds = delta % 60;  // in theory the modulus is not required

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  }
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
exports.units = units;
exports.dateFromTimeStamp = dateFromTimeStamp;
exports.timeUntilDate = timeUntilDate;
