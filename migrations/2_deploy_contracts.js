var Staking = artifacts.require("Staking");
var StakeCoin = artifacts.require("StakeCoin");
var StakeCoinFaucet = artifacts.require("StakeCoinFaucet");

module.exports = async function(deployer) {
  // TODO: Only deploy if not already deployed
  // await deployer.deploy(StakeCoin);
  const stakeCoinInstance = await StakeCoin.deployed();

  await deployer.deploy(StakeCoinFaucet, stakeCoinInstance.address);
  // TODO: Add option so that if the network is ropsten or etherum then we use the relevant Dai token address
  await deployer.deploy(Staking, stakeCoinInstance.address);
};
