import startStakeListener from './stakeListener.js'
import startApiListener from './apiListener.js'
import Web3 from 'web3'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const StakingContract = require('../client/src/contracts/Staking.json');
// TODO: These should be set with environment variables
const web3 = new Web3("ws://127.0.0.1:7545")
const contractAddress = '0x29ce3349226137f5266E739cA5131014064b4fBd'
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

async function getFilledStakes() {
  let filledStakes = []
  const requestCount = await contract.methods.requestCount().call();
  for (let i = 0; i < requestCount; i++) {
    const stake = await contract.methods.getStake(i).call()
    if (stake.status === StakeStatus.Filled) {
      filledStakes.push(stake);
    }
  }
  return filledStakes
}

function startListeners(watchedStakes) {
  startStakeListener(watchedStakes, contract)
  startApiListener(watchedStakes, contract, 10000)
}

getFilledStakes().then(stakes => startListeners(stakes))