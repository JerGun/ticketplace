import Event from "../contracts/Event.json";
import Web3 from "web3";

const web3 = new Web3(window.ethereum);
const contractAbi = Event.abi;
export const contractAddress = Event.networks[97].address;
const eventContract = new web3.eth.Contract(contractAbi, contractAddress);

export const getWeb3 = async () => {
  const accounts = await web3.eth.getAccounts();
};

export const getAccount = () => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((result) => res(result[0]));
  });
};

export const connectWallet = () => {
  return new Promise(function (res, rej) {
    window.ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((result) => {
        result.length !== 0 && res(result[0]);
      });
  });
};

export const getBalance = () => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((result) => {
      const balance = web3.eth.getBalance(result[0]);
      res(balance);
    });
  });
};

export const getNetwork = async () => await web3.eth.net.getId();

export const mintEvent = (url) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .mintEvent(url)
        .send({ from: accounts[0] })
        .then((result) => res(result));
    });
  });
};

export const mintTicket = (url, eventId, quantity, price) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .mintTicket(url, eventId, quantity, price)
        .send({ from: accounts[0] })
        .then((result) => res(result));
    });
  });
};

export const createMarketItem = (ticketId, price) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .createMarketItem(ticketId, price * 10 ** 8)
        .send({ from: accounts[0] })
        .then((result) => {
          window.location.reload();
          res(result);
        });
    });
  });
};

export const cancelListing = (itemId) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .cancelListing(itemId)
        .send({ from: accounts[0] })
        .then((result) => {
          window.location.reload();
          res(result);
        });
    });
  });
};

/* global BigInt */
export const buyTicket = (itemId, price) => {
  return new Promise(function (res, rej) {
    console.log(price * 10 ** 10);
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .buyMarketItem(itemId)
        .send({ from: accounts[0], value: price * 10 ** 10 })
        .then((result) => {
          window.location.reload();
          res(result);
        });
    });
  });
};

export const setUri = (tokenId, tokenUri) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .setTokenUri(tokenId, tokenUri)
        .send({ from: accounts[0] })
        .then((result) => res(result));
    });
  });
};

export const getUri = (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .uri(tokenId)
      .call()
      .then((result) => res(result));
  });
};

export const fetchCreatedEvents = () => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .fetchCreatedEvents(accounts[0])
        .call()
        .then((result) => res(result));
    });
  });
};

export const fetchCreatedTickets = () => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .fetchCreatedTickets(accounts[0])
        .call()
        .then((result) => res(result));
    });
  });
};

export const fetchOwnedTickets = (isAllOwned, isCreator) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .fetchOwnedTickets(accounts[0], isAllOwned, isCreator)
        .call()
        .then((result) => res(result));
    });
  });
};

export const fetchEvents = () => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchEvents()
      .call()
      .then((result) => res(result));
  });
};

export const fetchEvent = (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchEvent(tokenId)
      .call()
      .then((result) => res(result));
  });
};

export const fetchTickets = (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchTickets()
      .call()
      .then((result) => res(result));
  });
};

export const fetchTicket = (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchTicket(tokenId)
      .call()
      .then((result) => res(result));
  });
};

export const fetchOwnedListings = () => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .fetchOwnedListings(accounts[0])
        .call()
        .then((result) => res(result));
    });
  });
};

export const fetchMarketItem = (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchMarketItem(tokenId)
      .call()
      .then((result) => res(result));
  });
};

export const fetchMarketItems = () => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchMarketItems()
      .call()
      .then((result) => res(result));
  });
};

export const fetchTicketsInEvent = (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchTicketsInEvent(tokenId)
      .call()
      .then((result) => res(result));
  });
};
