const Web3 = require('web3');
const StakingContract = require('./contracts/Staking.json')

const web3 = new Web3("http://127.0.0.1:7545")
const contractAddress = '0xA4b4dC7eE6eEF554bBD7823447E4D0C6fa667ed9'
const account = '0x16D8dc2a4A2348651eB659a53915E5c8bBC1C110'

const contract = new web3.eth.Contract(StakingContract.abi, contractAddress)

const stakeId = 2;

contract.methods.gamePlayed(stakeId).send({from: account}).then((err, result) => { if (err) {console.log(err)} else console.log(result) })