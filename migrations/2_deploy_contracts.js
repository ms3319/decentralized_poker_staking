var Staking = artifacts.require("Staking");
var StakeCoin = artifacts.require("StakeCoin");
var StakeCoinFaucet = artifacts.require("StakeCoinFaucet");

module.exports = async function(deployer, network, accounts) {
  // TODO: Only deploy if not already deployed
  if (network !== "ropsten") {
    await deployer.deploy(StakeCoin, { from: accounts[0], overwrite: false });
  }
  const stakeCoinInstance = await StakeCoin.deployed();

  await deployer.deploy(StakeCoinFaucet, stakeCoinInstance.address);
  // TODO: Add option so that if the network is ropsten or etherum then we use the relevant Dai token address
  await deployer.deploy(Staking, stakeCoinInstance.address);
};
