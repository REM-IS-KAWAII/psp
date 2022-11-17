const psp = artifacts.require("psp");

module.exports = function(deployer) {
  deployer.deploy(psp);
};