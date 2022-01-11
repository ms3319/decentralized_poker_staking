var Staking = artifacts.require("Staking");
var StakeCoin = artifacts.require("StakeCoin");
var StakeCoinFaucet = artifacts.require("StakeCoinFaucet");

module.exports = async function(deployer, network, accounts) {
  // TODO: Only deploy if not already deployed
  let tokenContractAddress;
  if (network === "ropsten") {
    tokenContractAddress = "0xFDe1260d74D0E126d09a65037eF650bB7E320614"
  } else {
    await deployer.deploy(StakeCoin, { from: accounts[0], overwrite: false });
    tokenContractAddress = (await StakeCoin.deployed()).address;
  }

  await deployer.deploy(StakeCoinFaucet, tokenContractAddress);
  // TODO: Add option so that if the network is ropsten or etherum then we use the relevant Dai token address
  await deployer.deploy(Staking, tokenContractAddress);
};
