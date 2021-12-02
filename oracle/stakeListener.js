export const StakeStatus = {
  Requested: "0",
  Filled: "1",
  Expired: "2",
  Cancelled: "3",
  AwaitingReturnPayment: "4",
  Completed: "5",
  EscrowClaimed: "6",
  PartiallyFilled: "7"
};

export default function start(watchedStakes, contract) {
  console.log(`Starting stake listener`)
  // Listen for emitted events from the smart contract - when a staking request is staked, add it to a list of stakes to "watch"
  contract.events.StakeFilled()
    .on('data', event => {
      console.log("Stake filled event - adding to list of watched stakes")
      handleStakeFilledOrRequested(event)
    })
    .on('error', err => { throw err })

  contract.events.StakeRequested()
    .on('data', event => {
      console.log("Stake requested event - adding to list of watched stakes")
      handleStakeFilledOrRequested(event)
    })
    .on('error', err => { throw err })

  // Ok, a stake has been filled, so we should add it to the global list of games we're "watching"
  const handleStakeFilledOrRequested = (event) => {
    const stakeIdx = watchedStakes.findIndex(stake => stake.id === event.returnValues.stake.id)
    if (stakeIdx !== -1) {
      watchedStakes[stakeIdx] = (event.returnValues.stake)
    } else {
      watchedStakes.push(event.returnValues.stake)
    }
  }

  contract.events.StakeCancelled()
    .on('data', event => { handleStakeCancelled(event)})
    .on('error', err => { throw err })

  const handleStakeCancelled = (event) => {
    console.log("Stake cancelled event - removing from list of watched stakes")
    watchedStakes.splice(watchedStakes.findIndex(stake => stake.id === event.returnValues.id), 1);
  }
}