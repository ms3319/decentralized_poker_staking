const numberWithCommas = (x) => {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const units = (amount) => {
  return Math.round((amount / 1e18 + Number.EPSILON) * 100) / 100;
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

const addDaysToDate = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const StakeStatus = {
  Requested: "0",
  Filled: "1",
  Expired: "2",
  Cancelled: "3",
  AwaitingReturnPayment: "4",
  Completed: "5",
  EscrowClaimed: "6",
  PartiallyFilled: "7"
};

const GameType = {
  SingleGame: 0,
  Tournament: 1
}

const parseOptions = (options, request) => {
  return options.map(option => {
    switch (option) {
      case "amount":
        return ({label: "Stake Requested", value: `${numberWithCommas(units(request.amount))}◈`})
      case "escrow":
        return ({label: "Escrow Offered", value: `${numberWithCommas(units(request.escrow))}◈`})
      case "profitShare":
        return ({label: "Profit Share (%)", value: `${request.profitShare}%`})
      case "timeLeft":
        const scheduledFor = dateFromTimeStamp(parseInt(request.stakeTimeStamp.scheduledForTimestamp))
        const timeLeft = timeUntilDate(scheduledFor)
        return ({label: "Time left", value: `${timeLeft.days}d${timeLeft.hours}h`})
      case "winnings":
        return ({label: "Player Profit", value: `${numberWithCommas(units(request.pnl))}◈`})
      case "returns":
        const escrowClaimed = request.status === StakeStatus.EscrowClaimed
        return ({
          label: request.status === StakeStatus.EscrowClaimed ? "Escrow Claimed" : request.status === StakeStatus.Completed ? "Winnings Returned" : "Amount Owed",
          value: `${numberWithCommas(units(escrowClaimed ? request.escrow : request.backerReturns))}◈`,
          labelStyles: escrowClaimed ? {color: "#cf463e"} : {}
        })
      case "backerPnl":
        const returns = units(request.status === StakeStatus.EscrowClaimed ? request.escrow : request.backerReturns)
        return ({
          label: "Pnl",
          value: `${((100 * (returns - units(request.amount))) / units(request.amount)).toFixed(2)}%`,
          valueStyles: {color: returns > units(request.amount) ? "#44aa58" : "#cf463e"}
        })
      default:
        return ({label: "n/a", value: "n/a"})
    }
  })
}

const isNullAddress = address => address === "0x0000000000000000000000000000000000000000";

exports.numberWithCommas = numberWithCommas;
exports.StakeStatus = StakeStatus;
exports.GameType = GameType;
exports.units = units;
exports.dateFromTimeStamp = dateFromTimeStamp;
exports.timeUntilDate = timeUntilDate;
exports.addDaysToDate = addDaysToDate;
exports.parseOptions = parseOptions;
exports.isNullAddress = isNullAddress;
