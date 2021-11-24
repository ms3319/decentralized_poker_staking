var Staking = artifacts.require("Staking");
var StakeCoin = artifacts.require("StakeCoin");
var StakeCoinFaucet = artifacts.require("StakeCoinFaucet");

module.exports = async function(deployer) {
  await deployer.deploy(StakeCoin);
  const stakeCoinInstance = await StakeCoin.deployed();

  await deployer.deploy(StakeCoinFaucet, stakeCoinInstance.address);
  await deployer.deploy(Staking, stakeCoinInstance.address);
};
