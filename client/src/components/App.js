import React, { useState, useEffect } from "react";
import MigrationsContract from "../contracts/Migrations.json";
import SimpleStorageContract from "../contracts/SimpleStorage.json";
import MarketContract from "../contracts/Market.json";
import Web3 from "web3";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

import Navbar from "./Navbar";
import Tickets from "./Tickets";
import Home from "./Home";
import Account from "./Account";
import CreateTicket from "./CreateTicket";
import { ReactComponent as Close } from "../assets/icons/close.svg";
import TicketItem from "./TicketItem";
import CustomScrollbars from "./CustomScrollbars";
import SimpleStorage from "./SimpleStorage";
import SetUpOrganizer from "./SetUpOrganizer";
import Confirm from "./Confirm";

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [account, setAccount] = useState([]);
  const [contract, setContract] = useState([]);
  const [marketContract, setMarketContract] = useState();
  const [network, setNetwork] = useState(97);
  const [verify, setVerify] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);

        const accounts = await web3.eth.getAccounts();

        const networkId = await web3.eth.net.getId();
        setNetwork(networkId);
        if (networkId === 97) {
          const deployedNetwork = SimpleStorageContract.networks[networkId];
          const SimpleStorage = new web3.eth.Contract(
            SimpleStorageContract.abi,
            deployedNetwork.address
          );
          const Market = new web3.eth.Contract(
            MarketContract.abi,
            MarketContract.networks[networkId].address
          );
          setContract(SimpleStorage);
          setMarketContract(Market);
        }

        setWeb3(web3);
        if (accounts.length !== 0) {
          setAccount(accounts[0]);
        }

        await axios
          .get(`${API_URL}/account/${accounts[0]}`)
          .then((response) => {
            setVerify(response.data);
          })
          .catch((err) => console.log(err));
      }
    };
    init();
  }, []);

  // useEffect(() => {
  //   const load = async () => {
  //     await contract.methods.setX(5).send({ from: accounts[0] });
  //     const response = await contract.methods.getX().call();
  //     setStorageValue(response);
  //   };
  //   if (
  //     typeof web3 !== "undefined" &&
  //     typeof accounts !== "undefined" &&
  //     typeof contract !== "undefined"
  //   ) {
  //     load();
  //   }
  // }, [web3, accounts, contract]);

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);

      window.ethereum.on("accountsChanged", function (accounts) {
        setAccount("");
        window.location.reload();
      });

      window.ethereum.on("chainChanged", async function (networkId) {
        const network = await web3.eth.net.getId();
        setNetwork(network);
      });
    }
  });

  async function connectWallet() {
    if (account.length === 0) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length !== 0) {
        setAccount(accounts[0]);
      }
    }
  }

  return (
    <div className="w-full h-screen  bg-gradient-to-b from-indigo-500 to-background">
      <CustomScrollbars>
        <Router>
          <Navbar connectWallet={connectWallet} account={account} />
          <div
            className={
              network !== 97
                ? "absolute h-12 w-full flex justify-center items-center space-x-3 bg-alert"
                : "hidden"
            }
          >
            <p>
              Your wallet is connected to other network. To use Ticketplace,
              please switch to BSC Testnet network.
            </p>
            <button>
              <Close />
            </button>
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/:ticketId" element={<TicketItem />} />
            <Route
              path="ticket/create"
              element={
                verify ? <CreateTicket account={account} /> : <SetUpOrganizer />
              }
            />
            <Route path="/confirm/:id" element={<Confirm />} />
            <Route path="account/*" element={<Account account={account} />} />
            <Route
              path="simple"
              element={<SimpleStorage account={account} contract={contract} />}
            />
          </Routes>
        </Router>
      </CustomScrollbars>
    </div>
  );
}

export default App;
