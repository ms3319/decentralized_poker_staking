import { createRequire } from "module";
const require = createRequire(import.meta.url);
const StakingContract = require('./contracts/Staking.json');

import startStakeListener, { StakeStatus } from './stakeListener.js'
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

const sendRequestExpiredTransaction = async (id) => {
  const transaction = contract.methods.expireStake(id);
  const options = {
    to: contractAddress,
    data: transaction.encodeABI(),
    gas: await transaction.estimateGas({from: account}),
    gasPrice: await web3.eth.getGasPrice(),
  }

  const signed = await web3.eth.accounts.signTransaction(options, accountPrivateKey);
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

  console.log("Signed and issued StakeExpired transaction:")
  console.log(receipt)
}

async function getStakesWithStatus(statuses) {
  let stakes = []
  const requestCount = await contract.methods.requestCount().call();
  for (let i = 0; i < requestCount; i++) {
    const stake = await contract.methods.getStake(i).call()
    if (statuses.includes(stake.status)) {
      stakes.push(stake);
    }
  }
  return stakes
}



function startListeners(stakes) {
  startStakeListener(stakes, contract)
  startApiListener(stakes, contract, interval, sendGamePlayedTransaction, sendRequestExpiredTransaction)
}

getStakesWithStatus([StakeStatus.Filled, StakeStatus.Requested, StakeStatus.PartiallyFilled])
  .then(stakes => startListeners(stakes))