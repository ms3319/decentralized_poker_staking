const Web3 = require('web3');
const StakingContract = require('../client/src/contracts/Staking.json')
const web3 = new Web3("ws://127.0.0.1:7545")

// TODO: These should be set with environment variables
const contractAddress = '0x54C5E030eaC65a39Fa85730d0952D115ffd041b1'
const account = '0xF6aE2Fc452d2E0414231243E9E09b7c9493E5362'
const contract = new web3.eth.Contract(StakingContract.abi, contractAddress)

// Global list of games we're "watching"
let watchedGames = []

// Listen for emitted events from the smart contract - when a new staking request is created (or staked?), add it to a list of stakes to "watch"
let options = {
  filter: {
      value: [],
  },
  fromBlock: 0
};

contract.events.StakeFilled()
  .on('data', event => { handleStakeFilled(event) })
  .on('changed', changed => { console.log("changed: " + changed) })
  .on('error', err => { throw err })
  .on('connected', str => { console.log("connected: " + str) })

// Ok, a stake has been filled, so we should add it to the global list of games we're "watching"
const handleStakeFilled = (event) => {
  console.log(event.returnValues.stake.escrow)
  watchedGames.push(event.returnValues.stake)
}

contract.events.StakeCancelled(options)
.on('data', event => { handleStakeCancelled(event)})
.on('changed', changed => { console.log("Stake cancelled event changed: " + changed) })
.on('error', err => { throw err })
.on('connected', str => { console.log("Stake cancelled event connected: " + str) })

const handleStakeCancelled = (event) => {
  console.log(event)
    //watchedGames.remove();
}

// For each of the "watched" stakes, query the API on a timer to see if the state of the game has changed - if it has, call the appropriate smart contract method
// contract.methods.gamePlayed(stakeId, "1000000000000000000").send({from: account}).then((err, result) => { if (err) {console.log(err)} else console.log(result) })