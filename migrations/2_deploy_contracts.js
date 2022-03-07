const Event = artifacts.require("./Event.sol");

module.exports = function (deployer) {
  // deployer.deploy(Market).then(function() {
  //   return deployer.deploy(Ticket, Market.address);
  // });
  // deployer.deploy(Ticket);
  deployer.deploy(Event);
};
