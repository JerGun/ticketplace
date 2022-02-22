import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { ReactComponent as Close } from "../assets/icons/close.svg";

import Navbar from "./Navbar";
import Tickets from "./Item/Tickets";
import Home from "./Home";
import Account from "./Account/Account";
import CreateEvent from "./Create/CreateEvent";
import CreateTicket from "./Create/CreateTicket";
import TicketItem from "./Item/TicketItem";
import CustomScrollbars from "./CustomScrollbars";
import SimpleStorage from "./SimpleStorage";
import SetUpOrganizer from "./Account/AccountSetup";
import Confirm from "./Confirm";
import SettingAccount from "./Account/AccountSettings";
import VerifyRequest from "./VerifyRequest";
import ListTicket from "./ListTicket";
import Events from "./Item/Events";
import EventItem from "./Item/EventItem";

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState(97);

  const componentMounted = useRef(true);

  useEffect(async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      if (componentMounted.current) {
        setNetwork(networkId);
        setWeb3(web3);
        if (accounts.length !== 0) {
          setAccount(accounts[0]);
        }
      }
      return () => {
        componentMounted.current = false;
      };
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
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
    <div className="w-full h-screen bg-background overflow-hidden">
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
        <CustomScrollbars>
          <div className="h-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="tickets" element={<Tickets />} />
              <Route
                path="event/:eventId/ticket/:ticketId"
                element={<TicketItem />}
              />
              {/* <Route path="ticket/create" element={<CreateTicket />} /> */}
              <Route path="event/create" element={<CreateEvent />} />
              <Route
                path="event/:eventId/ticket/create"
                element={<CreateTicket />}
              />
              <Route
                path="event/:eventId/ticket/:tokenId/sell"
                element={<ListTicket />}
              />
              <Route path="events" element={<Events />} />
              <Route path="event/:eventId" element={<EventItem />} />
              <Route path="account/setup" element={<SetUpOrganizer />} />
              <Route path="account/settings" element={<SettingAccount />} />
              <Route path="/confirm/:id" element={<Confirm />} />
              <Route path="account/*" element={<Account />} />
              <Route path="verify-request" element={<VerifyRequest />} />
              <Route
                path="simple"
                element={<SimpleStorage account={account} />}
              />
            </Routes>
          </div>
        </CustomScrollbars>
      </Router>
    </div>
  );
}

export default App;
