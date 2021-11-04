const Web3 = require('web3');
const StakingContract = require('./contracts/Staking.json')

const web3 = new Web3("http://127.0.0.1:7545")
const contractAddress = '0x2B066FB0AcC2e14e251468B79c0616Abc9db50AE'
const account = '0xF6aE2Fc452d2E0414231243E9E09b7c9493E5362'

const contract = new web3.eth.Contract(StakingContract.abi, contractAddress)

const stakeId = 0;

contract.methods.gamePlayed(stakeId, "1000000000000000000").send({from: account}).then((err, result) => { if (err) {console.log(err)} else console.log(result) })