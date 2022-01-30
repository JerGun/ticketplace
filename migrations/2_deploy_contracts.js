const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const Market = artifacts.require("./Market.sol");
const Ticket = artifacts.require("./Ticket.sol");
const NFTMarket = artifacts.require("./NFTMarket.sol");

module.exports = function (deployer) {
  deployer.deploy(NFTMarket).then(function() {
    return deployer.deploy(Ticket, NFTMarket.address);
  });
};
