import startStakeListener from './stakeListener.js'
import startApiListener from './apiListener.js'
import Web3 from 'web3'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const StakingContract = require('../client/src/contracts/Staking.json');
import dotenv from 'dotenv';
dotenv.config()
console.log(process.env.BLOCKCHAIN_LINK)
console.log(process.env.CONTRACT_ADDRESS)
console.log(process.env.ACCOUNT_ADDRESS)
console.log(process.env.PRIVATE_KEY)
// TODO: These should be set with environment variables
const web3 = new Web3(process.env.BLOCKCHAIN_LINK)
const contractAddress = process.env.CONTRACT_ADDRESS;
const account = process.env.ACCOUNT_ADDRESS;
const accountPrivateKey = process.env.PRIVATE_KEY;

const contract = new web3.eth.Contract(StakingContract.abi, contractAddress)

const signTransaction = async (id, profit) => {
  const transaction = contract.methods.gamePlayed(id, profit) //.send({from: account}).then((err, result) => { if (err) {console.log(err)} else console.log(result) })
  const options = {
    to: contractAddress,
    data: transaction.encodeABI(),
    gas: await transaction.estimateGas({from: account}),
    gasPrice: await web3.eth.getGasPrice() // or use some predefined value
  };

  const signed  = await web3.eth.accounts.signTransaction(options, accountPrivateKey);
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

  console.log(receipt)
}

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
  startApiListener(watchedStakes, contract, 10000, signTransaction)
}

getFilledStakes().then(stakes => startListeners(stakes))