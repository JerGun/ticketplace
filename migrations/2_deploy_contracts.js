const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const Market = artifacts.require("./Market.sol");
const Ticket = artifacts.require("./Ticket.sol");

module.exports = function (deployer) {
  deployer.deploy(Market).then(function() {
    return deployer.deploy(Ticket, Market.address);
  });
};
