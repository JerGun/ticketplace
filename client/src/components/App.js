import React, { useState, useEffect } from "react";
import SimpleStorageContract from "../contracts/SimpleStorage.json";
import Web3 from "web3";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// import "./App.css";
import Navbar from "./Navbar";
import Tickets from "./Tickets";
import Home from "./Home";
import Account from "./Account";
import CreateTicket from "./CreateTicket";
import { ReactComponent as Close } from "../assets/close.svg";
import TicketItem from "./TicketItem";
import CustomScrollbars from "./CustomScrollbars";

function App() {
  const [newValue, setNewValue] = useState(undefined);
  const [storageValue, setStorageValue] = useState(undefined);
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState([]);
  const [network, setNetwork] = useState(97);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);

        const accounts = await web3.eth.getAccounts();

        const networkId = await web3.eth.net.getId();
        setNetwork(networkId);
        if (networkId === 97) {
          const deployedNetwork = SimpleStorageContract.networks[networkId];
          const contract = new web3.eth.Contract(
            SimpleStorageContract.abi,
            deployedNetwork.address
          );
          setContract(contract);
        }

        setWeb3(web3);
        if (accounts.length !== 0) {
          setAccounts(accounts[0]);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    const load = async () => {
      await contract.methods.setX(5).send({ from: accounts[0] });
      const response = await contract.methods.getX().call();
      setStorageValue(response);
    };
    if (
      typeof web3 !== "undefined" &&
      typeof accounts !== "undefined" &&
      typeof contract !== "undefined"
    ) {
      // load();
    }
  }, [web3, accounts, contract]);

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);

      window.ethereum.on("accountsChanged", function (accounts) {
        setAccounts("");
        window.location.reload();
      });

      window.ethereum.on("chainChanged", async function (networkId) {
        const network = await web3.eth.net.getId();
        setNetwork(network);
      });
    }
  });

  function handleChange(e) {
    setNewValue(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await contract.methods.setX(newValue).send({ from: accounts[0] });
    const response = await contract.methods.getX().call();
    setStorageValue(response);
  }

  async function connectWallet() {
    if (accounts.length === 0) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length !== 0) {
        setAccounts(accounts[0]);
      }
    }
  }

  const renderThumb = ({ style, ...props }) => {
    const { top } = this.state;
    const thumbStyle = {
      backgroundColor: `rgb(${Math.round(255 - top * 255)}, ${Math.round(
        255 - top * 255
      )}, ${Math.round(255 - top * 255)})`,
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  return (
    <div className="w-full h-screen bg-background">
      <CustomScrollbars>
        <Router>
          <Navbar connectWallet={connectWallet} account={accounts} />
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
            {/* <Route path="tickets" element={<TicketItem />} /> */}
            <Route path="ticket/create" element={<CreateTicket />} />
            <Route path="account/*" element={<Account account={accounts} />} />
          </Routes>
        </Router>

        <div className="text-red-500">
          <h1>Welcome do this dapp!</h1>
          <div>The stored value is: {storageValue}</div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={newValue}
              onChange={handleChange.bind(this)}
            />
            <input type="submit" value="Submit" />
          </form>
        </div>
      </CustomScrollbars>
    </div>
  );
}

export default App;
