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
    web3.eth.getAccounts().then((result) => {
      res(result[0]);
    });
  });
};

export const getNetwork = async () => await web3.eth.net.getId();

export const mintEvent = async (url) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .mintEvent(url)
        .send({ from: accounts[0] })
        .then((result) => {
          res(result);
        });
    });
  });
};

export const mintTicket = async (url, eventId, quantity, price) => {
  return new Promise(function (res, rej) {
    web3.eth.getAccounts().then((accounts) => {
      eventContract.methods
        .mintTicket(url, eventId, quantity, price)
        .send({ from: accounts[0] })
        .then((result) => {
          res(result);
        });
    });
  });
};

export const getUri = async (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .uri(tokenId)
      .call()
      .then((result) => {
        res(result);
      });
  });
};

export const getEvent = async (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchEvent(tokenId)
      .call()
      .then((result) => {
        res(result);
      });
  });
};

export const getTicket = async (tokenId) => {
  return new Promise(function (res, rej) {
    eventContract.methods
      .fetchTicket(tokenId)
      .call()
      .then((result) => {
        res(result);
      });
  });
};
