var Kata = artifacts.require("./Kata.sol");

module.exports = function(deployer) {
  deployer.deploy(Kata);
};