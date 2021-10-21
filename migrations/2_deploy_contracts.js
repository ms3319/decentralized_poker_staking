var UserList = artifacts.require("UserList");
var Staking = artifacts.require("Staking");

module.exports = function(deployer) {
  deployer.deploy(UserList);
  deployer.deploy(Staking);
};
