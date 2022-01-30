const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const Market = artifacts.require("./Market.sol");
const Ticket = artifacts.require("./Ticket.sol");
const NFTMarket = artifacts.require("./NFTMarket.sol");

module.exports = function (deployer) {
  deployer.deploy(Ticket);
  deployer.deploy(NFTMarket);
};
