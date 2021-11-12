import startStakeListener from './stakeListener.js'
import startApiListener from './apiListener.js'
import Web3 from 'web3'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const StakingContract = require('../client/src/contracts/Staking.json');
// TODO: These should be set with environment variables
const web3 = new Web3("ws://127.0.0.1:7545")
const contractAddress = '0xB3fE8FE4B28A5849917836b4F1645B224bB4c57c'
const contract = new web3.eth.Contract(StakingContract.abi, contractAddress)

const StakeStatus = {
  Requested: '0',
  Filled: '1',
  Expired: '2',
  Cancelled: '3',
  AwaitingReturnPayment: '4',
  Completed: '5',
  EscrowReturned: '6'
};

async function getFilledGames() {
  let filledGames = []
  const requestCount = await contract.methods.requestCount().call();
  for (let i = 0; i < requestCount; i++) {
    const stake = await contract.methods.getStake(i).call()
    if (stake.status === StakeStatus.Filled) {
      filledGames.push(stake);
    }
  }
  console.log(`Got filled games:`)
  console.log(filledGames)
  return filledGames
}

function startListeners(watchedGames) {
  startStakeListener(watchedGames, contract)
  startApiListener(watchedGames, contract, 10000)
}

getFilledGames().then(startListeners)

// For each of the "watched" stakes, query the API on a timer to see if the state of the game has changed - if it has, call the appropriate smart contract method
// contract.methods.gamePlayed(stakeId, "1000000000000000000").send({from: account}).then((err, result) => { if (err) {console.log(err)} else console.log(result) })