import { createRequire } from "module";
const require = createRequire(import.meta.url);
const StakingContract = require('../client/src/contracts/Staking.json');

import startStakeListener from './stakeListener.js'
import startApiListener from './apiListener.js'
import Web3 from 'web3'
import dotenv from 'dotenv';
dotenv.config()

const web3 = new Web3(process.env.BLOCKCHAIN_LINK)
const contractAddress = process.env.CONTRACT_ADDRESS;
const account = process.env.ACCOUNT_ADDRESS;
const accountPrivateKey = process.env.PRIVATE_KEY;
const contract = new web3.eth.Contract(StakingContract.abi, contractAddress)
const interval = process.env.INTERVAL

const StakeStatus = {
  Requested: '0',
  Filled: '1',
  Expired: '2',
  Cancelled: '3',
  AwaitingReturnPayment: '4',
  Completed: '5',
  EscrowReturned: '6'
};

const sendGamePlayedTransaction = async (id, profit) => {
  const transaction = contract.methods.gamePlayed(id, profit)
  const options = {
    to: contractAddress,
    data: transaction.encodeABI(),
    gas: await transaction.estimateGas({from: account}),
    gasPrice: await web3.eth.getGasPrice() // or use some predefined value
  };

  const signed  = await web3.eth.accounts.signTransaction(options, accountPrivateKey);
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

  console.log("Signed and issued GamePlayed transaction:")
  console.log(receipt)
}

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
  startApiListener(watchedStakes, contract, interval, sendGamePlayedTransaction)
}

getFilledStakes().then(stakes => startListeners(stakes))