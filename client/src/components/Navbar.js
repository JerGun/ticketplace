import { React, useState, useEffect, Fragment, useRef } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  connectWallet,
  fetchEvent,
  fetchEvents,
  fetchTickets,
  fetchTicketsInEvent,
  getAccount,
  getUri,
} from "../services/Web3";
import { Combobox, Transition } from "@headlessui/react";

import { ReactComponent as Search } from "../assets/icons/search.svg";
import { ReactComponent as Wallet } from "../assets/icons/wallet.svg";
import logo from "../assets/images/logo.png";

function Navbar() {
  const [account, setAccount] = useState("");
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [searchItems, setSearchItems] = useState([]);

  const location = useLocation();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = false;
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [location, account]);

  const connect = async () => {
    if (window.ethereum) {
      const connectAccount = await connectWallet();
      if (connectAccount) {
        setAccount(connectAccount);
      }
    } else {
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  const fetchAccount = async () => {
    const account = await getAccount();
    setAccount(account);
  };

  const handleSearch = async (e) => {
    console.log(e.target.value);
    if (e.target.value) {
      const events = await fetchEvents();
      const tickets = await fetchTickets();

      const eventItems = await Promise.all(
        events.map(async (i) => {
          const eventUri = await getUri(i.tokenId);
          const eventMeta = await axios.get(eventUri);
          const ticketInEvent = await fetchTicketsInEvent(i.tokenId);
          let item = {
            tokenId: i.tokenId,
            name: eventMeta.data.name,
            image: eventMeta.data.image,
            tickets: ticketInEvent.length,
          };
          return item;
        })
      );

      const ticketItems = await Promise.all(
        tickets.map(async (i) => {
          const ticketUri = await getUri(i.tokenId);
          const ticketMeta = await axios.get(ticketUri);
          let item = {
            eventId: i.eventTokenId,
            tokenId: i.tokenId,
            name: ticketMeta.data.name,
            image: ticketMeta.data.image,
          };
          return item;
        })
      );

      const totalItems = {
        events: eventItems.filter(
          (i) =>
            new RegExp(e.target.value, "i").test(i.name) ||
            new RegExp(e.target.value, "i").test(i.tokenId)
        ),
        tickets: ticketItems.filter(
          (i) =>
            new RegExp(e.target.value, "i").test(i.name) ||
            new RegExp(e.target.value, "i").test(i.tokenId)
        ),
      };

      setSearchItems(totalItems);
    }
  };

  return (
    <nav
      className={`${
        location.pathname === "/" && account
          ? " bg-indigo-500"
          : "shadow-lg bg-background"
      } sticky top-0 w-full z-20 h-18 grid grid-cols-8 items-center`}
    >
      <div className="col-span-2 px-5 text-white">
        <Link to="/" className="flex items-center space-x-5">
          <div className="p-2 rounded-full bg-white">
            <img src={logo} alt="logo" className="h-7 w-7" />
          </div>
          <p className="text-4xl">Ticketplace</p>
        </Link>
      </div>
      <div className="col-span-3 h-full w-full flex items-center text-white">
        {location.pathname !== "/" && (
          <Combobox value={query} onChange={() => setQuery("")}>
            <div className="relative w-full mt-1">
              <div className="relative h-11 w-full space-x-3 px-3 flex items-center rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <Search className="h-1/2" />
                <Combobox.Input
                  className="w-full py-2 text-white bg-transparent"
                  placeholder="Search events, tickets"
                  autoComplete="off"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    handleSearch(e);
                  }}
                />
              </div>
              {query.length ? (
                <Transition
                  as={Fragment}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Combobox.Options className="absolute w-full mt-1 overflow-auto bg-hover rounded-lg shadow-lg max-h-[42rem] transition duration-300">
                    {!searchItems?.events?.length &&
                    !searchItems?.tickets?.length ? (
                      <div className="cursor-default select-none relative py-2 px-4 text-text">
                        No items found.
                      </div>
                    ) : (
                      <>
                        {searchItems.events.length ? (
                          <p className="py-3 px-4 divider-x-bottom text-sm text-text">
                            Events
                          </p>
                        ) : null}
                        {searchItems?.events?.map((item, i) => (
                          <Combobox.Option
                            key={i}
                            className={({ active }) =>
                              `${
                                active ? "bg-background" : ""
                              } w-full cursor-default select-none relative py-2 px-4 transition duration-300 divider-x-bottom text-white`
                            }
                            value={item.tokenId}
                          >
                            <Link
                              to={`/event/${item.tokenId}`}
                              className="flex items-center justify-between"
                            >
                              <div className="w-9/12 flex items-center space-x-3">
                                <div className="h-12 w-8">
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="h-full w-full object-cover rounded-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <p className="truncate">{item.name}</p>
                                  <p className="text-sm text-text">
                                    Token ID: {item.tokenId}
                                  </p>
                                </div>
                              </div>
                              <p className="text-text">
                                {item.tickets}{" "}
                                {item.tickets > 1 ? "tickets" : "ticket"}
                              </p>
                            </Link>
                          </Combobox.Option>
                        ))}
                        {searchItems.tickets.length ? (
                          <p className="py-3 px-4 divider-x-bottom text-sm text-text">
                            Tickets
                          </p>
                        ) : null}
                        {searchItems?.tickets?.map((item, i) => (
                          <Combobox.Option
                            key={i}
                            className={({ active }) =>
                              `${
                                active ? " bg-background" : ""
                              } cursor-default select-none relative py-2 px-4 transition duration-300 divider-x-bottom text-white`
                            }
                            value={item}
                          >
                            <Link
                              to={`/event/${item.eventId}/ticket/${item.tokenId}`}
                              className="flex items-center space-x-3"
                            >
                              <div className="h-12 w-8">
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-full w-full object-cover rounded-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="truncate">{item.name}</p>
                                <p className="text-sm text-text">
                                  Token ID: {item.tokenId}
                                </p>
                              </div>
                            </Link>
                          </Combobox.Option>
                        ))}
                      </>
                    )}
                  </Combobox.Options>
                </Transition>
              ) : null}
            </div>
          </Combobox>
        )}
      </div>
      <div
        className={`${
          location.pathname === "/" ? "text-white" : "text-text"
        } col-span-3 h-full flex justify-end items-center`}
      >
        <div className="relative h-full flex items-center hover:text-white">
          <Link
            to="/tickets"
            className={`h-full w-full px-5 flex items-center`}
          >
            Explore
          </Link>
          {location.pathname === "/tickets" ? (
            <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
          ) : null}
        </div>
        <span
          className={
            location.pathname === "/" ? "h-1/2 divider-y-w" : "h-1/2 divider-y"
          }
        ></span>
        <div className="h-full flex items-center">
          {account && (
            <div className="relative h-full w-fit flex items-center hover:text-white">
              <Link
                to="/event/create"
                className="h-full w-full px-5 flex items-center"
              >
                Create Event
              </Link>
              {location.pathname === "/event/create" ? (
                <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
              ) : null}
            </div>
          )}
          <div className="relative h-full w-fit hover:text-white">
            <Link
              to={account?.length !== 0 && "/account"}
              className="h-full flex items-center space-x-3 px-5"
              onClick={() => {
                connect();
              }}
            >
              {account && (
                <p>{`${account?.slice(0, 5)} ... ${account?.slice(-6)}`}</p>
              )}
              {!account && <p>Connect wallet</p>}
              <Wallet />
            </Link>
            {location.pathname === "/account" ||
            location.pathname === "/account/setup" ||
            location.pathname === "/account/settings" ||
            location.pathname === "/account/owned" ||
            location.pathname === "/account/created" ||
            location.pathname === "/account/created_events" ? (
              <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
