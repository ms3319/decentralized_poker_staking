const Web3 = require('web3');
const StakingContract = require('./contracts/Staking.json')

const main = async () => {
    // const web3 = new Web3("http://127.0.0.1:7545")
    const web3 = new Web3("https://ropsten.infura.io/v3/ee5e92f29588446f93a16f92091e7870");
    const contractAddress = '0xdD3BD2085B95Ea406754267a7F451F0b585eD1b7'
    // const account = '0xF6aE2Fc452d2E0414231243E9E09b7c9493E5362'

    const account = '0xf41C2c3E4D8b738A9e4261E874241D15B34d540E'

    const contract = new web3.eth.Contract(StakingContract.abi, contractAddress)

    const stakeId = 0;
    const profit = "100000000000000000"
    const transaction = contract.methods.gamePlayed(stakeId, profit) //.send({from: account}).then((err, result) => { if (err) {console.log(err)} else console.log(result) })

    const options = {
        to: contractAddress,
        data: transaction.encodeABI(),
        gas: await transaction.estimateGas({from: account}),
        gasPrice: await web3.eth.getGasPrice() // or use some predefined value
    };

    const signed  = await web3.eth.accounts.signTransaction(options, '2f1c96de46db7f2507dfdd17ecb6fd93be8a14155bf4fb926b0110d49bf4bd7d');
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

    console.log(receipt)
}

main()