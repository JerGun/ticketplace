import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { getAccount, getNetwork } from "./services/Web3";

import Navbar from "./components/Navbar";
import Tickets from "./components/Item/Tickets";
import Home from "./components/Home";
import Account from "./components/Account/Account";
import CreateEvent from "./components/Create/CreateEvent";
import CreateTicket from "./components/Create/CreateTicket";
import EditTicket from "./components/Edit/EditTicket";
import TicketItem from "./components/Item/TicketItem";
import CustomScrollbars from "./components/CustomScrollbars";
import SetUpOrganizer from "./components/Account/AccountSetup";
import Confirm from "./components/Confirm";
import SettingAccount from "./components/Account/AccountSettings";
import VerifyRequest from "./components/VerifyRequest";
import ListTicket from "./components/ListTicket";
import Events from "./components/Item/Events";
import EditEvent from "./components/Edit/EditEvent";
import EventItem from "./components/Item/EventItem";
import ConnectWallet from "./components/ConnectWallet";

function App() {
  const [account, setAccount] = useState("account");
  const [network, setNetwork] = useState(97);

  useEffect(async () => {
    if (window.ethereum) {
      await loadNetwork();
      await loadAccount();
    }
  }, [account, network]);

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

  const loadAccount = async () => {
    const connectAccount = await getAccount();
    connectAccount ? setAccount(connectAccount) : setAccount("");
  };

  const loadNetwork = async () => {
    const networkId = await getNetwork();
    setNetwork(networkId);
  };

  return (
    <div className="w-full h-screen bg-background overflow-hidden">
      <Router>
        <Navbar />
        {network !== 97 ? (
          <div className="absolute h-12 w-full z-40 flex justify-center items-center space-x-3 bg-alert">
            <p>
              Your wallet is connected to other network. To use Ticketplace,
              please switch to BSC Testnet network.
            </p>
          </div>
        ) : null}
        {!account ? (
          <ConnectWallet />
        ) : (
          <CustomScrollbars>
            <div className="h-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="tickets" element={<Tickets />} />
                <Route
                  path="event/:eventId/ticket/:ticketId"
                  element={<TicketItem />}
                />
                <Route path="event/create" element={<CreateEvent />} />
                <Route path="event/:eventId/edit" element={<EditEvent />} />
                <Route
                  path="event/:eventId/ticket/create"
                  element={<CreateTicket />}
                />
                <Route
                  path="event/:eventId/ticket/:ticketId/edit"
                  element={<EditTicket />}
                />
                <Route
                  path="event/:eventId/ticket/:tokenId/sell"
                  element={<ListTicket />}
                />
                <Route path="events" element={<Events />} />
                <Route path="event/:eventId" element={<EventItem />} />
                <Route path="account/setup" element={<SetUpOrganizer />} />
                <Route path="account/settings" element={<SettingAccount />} />
                <Route path="confirm/:id" element={<Confirm />} />
                <Route path="account/*" element={<Account />} />
                <Route path=":address" element={<Account />} />
                <Route path="verify-request" element={<VerifyRequest />} />
              </Routes>
            </div>
          </CustomScrollbars>
        )}
      </Router>
    </div>
  );
}

export default App;
