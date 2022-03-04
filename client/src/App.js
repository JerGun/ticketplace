import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { ReactComponent as Close } from "./assets/icons/close.svg";

import Navbar from "./components/Navbar";
import Tickets from "./components/Item/Tickets";
import Home from "./components/Home";
import Account from "./components/Account/Account";
import CreateEvent from "./components/Create/CreateEvent";
import CreateTicket from "./components/Create/CreateTicket";
import TicketItem from "./components/Item/TicketItem";
import CustomScrollbars from "./components/CustomScrollbars";
import SimpleStorage from "./components/SimpleStorage";
import SetUpOrganizer from "./components/Account/AccountSetup";
import Confirm from "./components/Confirm";
import SettingAccount from "./components/Account/AccountSettings";
import VerifyRequest from "./components/VerifyRequest";
import ListTicket from "./components/ListTicket";
import Events from "./components/Item/Events";
import EventItem from "./components/Item/EventItem";
import { connectWallet, getNetwork } from "./services/Web3";

function App() {
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState(97);

  useEffect(async () => {
    if (window.ethereum) {
      const networkId = await getNetwork();
      setNetwork(networkId);
      await connect();
    }
  }, [account]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", function (accounts) {
        setAccount("");
        window.location.reload();
      });

      window.ethereum.on("chainChanged", async function (networkId) {
        const network = await getNetwork();
        setNetwork(network);
      });
    }
  });

  const connect = async () => {
    if (account.length === 0) {
      const connectAccount = await connectWallet();
      if (connectAccount) {
        setAccount(connectAccount);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-background overflow-hidden">
      <Router>
        <Navbar connectWallet={connect} account={account} />
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
            </Routes>
          </div>
        </CustomScrollbars>
      </Router>
    </div>
  );
}

export default App;
