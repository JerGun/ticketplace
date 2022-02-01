import React, { useState, useEffect, useRef } from "react";
import MigrationsContract from "../contracts/Migrations.json";
import SimpleStorageContract from "../contracts/SimpleStorage.json";
import MarketContract from "../contracts/Market.json";
import Web3 from "web3";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { ReactComponent as Close } from "../assets/icons/close.svg";

import Navbar from "./Navbar";
import Tickets from "./Tickets";
import Home from "./Home";
import Account from "./Account";
import CreateTicket from "./CreateTicket";
import TicketItem from "./TicketItem";
import CustomScrollbars from "./CustomScrollbars";
import SimpleStorage from "./SimpleStorage";
import SetUpOrganizer from "./SetUpAccount";
import Confirm from "./Confirm";
import { API_URL } from "../config";

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [account, setAccount] = useState([]);
  const [info, setInfo] = useState({
    name: "Unnamed",
    email: "",
    img: "",
    verify: false,
  });
  const [contract, setContract] = useState([]);
  const [marketContract, setMarketContract] = useState();
  const [network, setNetwork] = useState(97);

  const componentMounted = useRef(true);

  useEffect(async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      if (componentMounted.current) {
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
            if (response) {
              setInfo({
                ...info,
                name: response.data.name,
                email: response.data.email,
                img: response.data.img,
                verify: response.data.verify,
              });
            }
          })
          .catch((err) => console.log(err));
      }
      return () => {
        componentMounted.current = false;
      };
    }
  }, []);

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

  const connectWallet = async () => {
    if (account.length === 0) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length !== 0) {
        setAccount(accounts[0]);
      }
    }
  };

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
              element={<CreateTicket account={account} verify={info.verify} />}
            />
            <Route path="account/setup" element={<SetUpOrganizer />} />
            <Route path="/confirm/:id" element={<Confirm />} />
            <Route
              path="account/*"
              element={<Account account={account} info={info} />}
            />
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
