import { React, useState, useEffect, Fragment, useRef } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  connectWallet,
  fetchEvents,
  fetchTickets,
  fetchTicketsInEvent,
  getAccount,
  getUri,
} from "../services/Web3";
import { Combobox, Transition } from "@headlessui/react";

import { ReactComponent as Search } from "../assets/icons/search.svg";
import { ReactComponent as Wallet } from "../assets/icons/wallet.svg";
import { ReactComponent as Check } from "../assets/icons/check.svg";
import logo from "../assets/images/logo.png";

const people = [
  { id: 1, name: "Wade Cooper" },
  { id: 2, name: "Arlene Mccoy" },
  { id: 3, name: "Devon Webb" },
  { id: 4, name: "Tom Cook" },
  { id: 5, name: "Tanya Fox" },
  { id: 6, name: "Hellen Schmidt" },
];

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

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) =>
          person.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const handleSearch = async (e) => {
    console.log(e.target.value);
    const tickets = await fetchTickets();
    const events = await fetchEvents();

    const eventItems = await Promise.all(
      events.map(async (i) => {
        const eventUri = await getUri(i.tokenId);
        const eventMeta = await axios.get(eventUri);
        const ticketInEvent = await fetchTicketsInEvent(i.tokenId);
        let item = {
          tokenId: i.tokenId,
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
          image: ticketMeta.data.image,
        };
        return item;
      })
    );

    const totalItems = {
      events: eventItems,
      tickets: ticketItems,
    };

    console.log(tickets, events,totalItems);
    setSearchItems(totalItems);
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
          <Combobox value={selected} onChange={setSelected}>
            <div className="relative w-full mt-1">
              <div className="relative h-11 w-full space-x-3 px-3 flex items-center rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <Search className="h-1/2" />
                <Combobox.Input
                  className="w-full py-2 text-white bg-transparent"
                  placeholder="Search events, tickets, organizers"
                  autoComplete="off"
                  onChange={(e) => handleSearch(e)}
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
                  afterLeave={() => setQuery("")}
                >
                  <Combobox.Options className="absolute w-full py-1 mt-1 overflow-auto bg-hover rounded-lg shadow-lg max-h-60">
                    {!filteredPeople.length ? (
                      <div className="cursor-default select-none relative py-2 px-4 text-text">
                        No items found.
                      </div>
                    ) : (
                      filteredPeople.map((person) => (
                        <Combobox.Option
                          key={person.id}
                          className={({ active }) =>
                            `${
                              active ? " bg-teal-600" : ""
                            } cursor-default select-none relative py-2 pl-10 pr-4 text-white`
                          }
                          value={person}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {person.name}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? "text-white" : "text-teal-600"
                                  }`}
                                >
                                  <Check
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
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
