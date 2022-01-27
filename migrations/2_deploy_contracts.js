const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const Market = artifacts.require("./Market.sol");
const NFT = artifacts.require("./NFT.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Market);
  deployer.deploy(NFT);
};
