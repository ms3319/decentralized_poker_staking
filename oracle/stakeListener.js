export default function start(watchedStakes, contract) {
  console.log(`Starting stake listener`)
  // Listen for emitted events from the smart contract - when a staking request is staked, add it to a list of stakes to "watch"
  contract.events.StakeFilled()
    .on('data', event => { handleStakeFilled(event) })
    .on('error', err => { throw err })

  // Ok, a stake has been filled, so we should add it to the global list of games we're "watching"
  const handleStakeFilled = (event) => {
    console.log("Stake filled event - adding to list of watched stakes")
    watchedStakes.push(event.returnValues.stake)
  }

  contract.events.StakeCancelled()
    .on('data', event => { handleStakeCancelled(event)})
    .on('error', err => { throw err })

  const handleStakeCancelled = (event) => {
    console.log("Stake cancelled event - removing from list of watched stakes")
    watchedStakes.splice(watchedStakes.findIndex(stake => stake.id === event.returnValues.stake.id), 1);
  }
}