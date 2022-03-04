import { React, useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import { API_URL } from "../../config";
import {
  fetchCreatedEvents,
  fetchCreatedTickets,
  fetchOwnedListings,
  fetchOwnedTickets,
  fetchTicketsInEvent,
  fetchTicket,
  getAccount,
  getBalance,
  getUri,
} from "../../services/Web3";

import { ReactComponent as More } from "../../assets/icons/more.svg";
import { ReactComponent as Location } from "../../assets/icons/location.svg";
import { ReactComponent as Down } from "../../assets/icons/down.svg";
import { ReactComponent as Info } from "../../assets/icons/info.svg";
import { ReactComponent as Cart } from "../../assets/icons/cart.svg";

const listOption = [
  { title: "Recently Listed", value: "recently" },
  { title: "Oldest", value: "oldest" },
  { title: "Price: High to Low", value: "high" },
  { title: "Price: Low to High", value: "low" },
];

function Listing() {
  const [account, setAccount] = useState();
  const [tickets, setTickets] = useState([""]);
  const [loadingState, setLoadingState] = useState(false);
  const [sortBy, setSortBy] = useState(listOption[0]);
  const [bnb, setBnb] = useState(0);
  const [balance, setBalance] = useState();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState({
    image: "",
    organizer: "",
    name: "",
    tokenId: "",
    price: "",
  });
  const [filter, setFilter] = useState({
    items: true,
    available: true,
    used: false,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = false;
  }, []);

  useEffect(() => {
    fetchAccount();
    loadTickets();
    fetchBNB();
    if (isMounted) {
      setTimeout(() => {
        setLoadingState(true);
      }, 1000);
    }
  }, []);

  const loadTickets = async () => {
    const test2 = await fetchCreatedEvents();
    const test = await fetchCreatedTickets();
    const data = await fetchOwnedListings();
    console.log(data, test, test2);

    const items = await Promise.all(
      data.map(async (i) => {
        const ticket = await fetchTicket(i.tokenId);
        const tokenUri = await getUri(i.tokenId);
        const meta = await axios.get(tokenUri);
        console.log(meta);
        let item = {
          tokenId: i.tokenId,
          image: meta.data.image,
          name: meta.data.name,
          link: meta.data.link,
          description: meta.data.description,
          location: meta.data.location,
          startDate: meta.data.startDate,
          endDate: meta.data.endDate,
          startTime: meta.data.startTime,
          endTime: meta.data.endTime,
          price: i.price,
          active: ticket.active,
        };
        return item;
      })
    );
    console.log(items);

    setTickets(items);
  };

  const fetchAccount = async () => {
    const account = await getAccount();
    setAccount(account);
  };

  const getAccountBalance = async () => {
    const balance = await getBalance();
    setBalance(balance);
  };

  const fetchBNB = async () => {
    await axios
      .get("https://api.coingecko.com/api/v3/coins/binancecoin")
      .then((result) => {
        setBnb(result.data.market_data.current_price.thb.toFixed(2));
      });
  };

  const handleChange = (event) => {
    let { value } = event.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : null;
  };

  const getMinter = async (ticket) => {
    let organizer;
    await axios
      .get(`${API_URL}/account/${ticket.eventOwner}`)
      .then((user) => {
        console.log(user);
        if (user.data) organizer = user.data.name;
        else organizer = ticket.eventOwner.slice(2, 9).toUpperCase();
      })
      .catch((err) => console.log(err));

    setSelectedTicket({
      eventName: ticket.eventName,
      eventOwner: ticket.eventOwner,
      organizer: organizer,
      itemId: ticket.itemId,
      tokenId: ticket.tokenId,
      image: ticket.image,
      name: ticket.name,
      price: ticket.price,
      description: ticket.description,
      startDate: ticket.startDate,
      endDate: ticket.endDate,
      startTime: ticket.startTime,
      endTime: ticket.endTime,
      location: ticket.location,
      active: ticket.active,
    });
    console.log(selectedTicket);
  };

  return (
    <div className="h-full w-full flex text-white bg-background">
      <div className="sticky top-0 h-screen w-2/12 p-5 space-y-10 shadow-lg bg-modal-button">
        <div className="w-full space-y-3">
          <p className="w-full text-xl font-bold">Ticket Status</p>
          <label class="w-fit flex items-center hover:cursor-pointer">
            <div className="h-5 w-5 flex items-center justify-center rounded-md border-2 border-white">
              <input
                type="checkbox"
                className="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                checked={filter.available}
                onChange={() => {
                  setFilter({
                    ...filter,
                    available: !filter.available,
                  });
                }}
              />
            </div>
            <span class="ml-2 select-none">Available</span>
          </label>
          <label class="w-fit flex items-center hover:cursor-pointer">
            <div className="h-5 w-5 flex items-center justify-center rounded-md border-2 border-white">
              <input
                type="checkbox"
                className="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                checked={filter.used}
                onChange={() => {
                  setFilter({
                    ...filter,
                    used: !filter.used,
                  });
                }}
              />
            </div>
            <span class="ml-2 select-none">Used</span>
          </label>
        </div>
        <div className="w-full space-y-3">
          <p className="w-full text-xl font-bold">Sort by</p>
          <Listbox value={sortBy} onChange={setSortBy}>
            <div className="w-full relative inline-block rounded-lg shadow-lg bg-hover hover:bg-hover-light">
              <Listbox.Button className="h-11 w-full inline-flex justify-between px-3 items-center space-x-3 text-white rounded-lg">
                {<p>{sortBy.title}</p>}
                <Down className="h-4 w-4" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options className="absolute w-full mt-3 p-1 bg-white rounded-xl shadow-lg">
                  {listOption?.map((item, i) => (
                    <Listbox.Option key={i} value={item}>
                      {({ active }) => (
                        <button
                          className={`
                                    ${
                                      active && "bg-background"
                                    } group flex rounded-lg items-center space-x-5 w-full px-5 py-2 text-lg`}
                        >
                          <div className="flex flex-col items-start">
                            <p className={active ? "text-white" : "text-input"}>
                              {item.title}
                            </p>
                          </div>
                        </button>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        <div className="w-full space-y-3">
          <p className="text-xl font-bold">Min Price</p>
          <div className="h-11 w-full space-x-3 px-3 flex items-center rounded-lg shadow-lg bg-hover hover:bg-hover-light focus-within:bg-hover-light">
            <input
              type="number"
              placeholder="1"
              min="1"
              onChange={handleChange}
              className="h-full w-full bg-transparent"
            />
          </div>
        </div>
        <div className="w-full space-y-3">
          <p className="text-xl font-bold">Max Price</p>
          <div className="h-11 w-full space-x-3 px-3 flex items-center rounded-lg shadow-lg bg-hover hover:bg-hover-light focus-within:bg-hover-light">
            <input
              type="number"
              placeholder="1"
              min="1"
              onChange={handleChange}
              className="h-full w-full bg-transparent"
            />
          </div>
        </div>
      </div>
      <div className="h-full w-10/12 p-10">
        {loadingState && tickets.length === 0 && (
          <div className="h-64 w-full border-2 rounded-lg flex items-center justify-center border-input">
            <h1 className="py-10 px-20 text-3xl">No items to display</h1>
          </div>
        )}
        <div className="h-auto w-full grid grid-cols-2 gap-5 pb-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {!loadingState
            ? [...Array(5)].map((x, i) => (
                <div
                  key={i}
                  className="h-fit w-full rounded-lg shadow-lg animate-pulse bg-modal-button"
                >
                  <div className="p-3 space-y-3 shadow-lg">
                    <div className="h-72 w-full rounded-lg bg-hover bg-opacity-50"></div>
                    <div className="h-18 w-full flex flex-col items-start space-y-3">
                      <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
                      <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
                      <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
                      <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
                    </div>
                  </div>
                  <div className="px-3 py-2 flex items-center space-x-5 justify-between text-text">
                    <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
                    <div className="w-fit flex space-x-1">
                      {/* <button className="p-2 text-white">
                            <Info />
                          </button>
                          <button className="p-2 text-primary">
                            <Cart />
                          </button> */}
                    </div>
                  </div>
                </div>
              ))
            : tickets.map((ticket, i) => (
                <div
                  key={i}
                  className="h-fit w-full rounded-lg shadow-lg float-right bg-modal-button"
                >
                  <Link
                    to={`/event/${ticket.eventId}/ticket/${ticket.tokenId}`}
                  >
                    <div className="p-3 space-y-3 shadow-lg">
                      <div className="h-72 w-full">
                        <img
                          src={ticket.image}
                          alt=""
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="w-full flex flex-col items-start">
                        <p className="text-sm text-primary">
                          {ticket.startDate} - {ticket.endDate}
                        </p>
                        <p className="w-10/12 truncate">{ticket.name}</p>
                        <p className="text-lg">{ticket.price / 10 ** 8} BNB</p>
                        <p className="w-10/12 truncate text-sm text-text">
                          {((bnb * ticket.price) / 10 ** 8).toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 2,
                            }
                          )}{" "}
                          THB
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 py-2 flex items-center space-x-5 justify-between text-text">
                    <div className="flex items-center space-x-2">
                      <span class="relative flex h-2 w-2">
                        <span
                          class={`${
                            ticket.active ? "bg-green-500" : "bg-red-500"
                          } animate-ping absolute h-2 w-2 rounded-full opacity-75`}
                        ></span>
                        <span
                          className={`${
                            ticket.active ? "bg-green-500" : "bg-red-500"
                          } h-2 w-2 rounded-full`}
                        ></span>
                      </span>
                      <p className="w-full text-sm truncate">
                        Token ID: {ticket.tokenId}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        className="p-2 text-white"
                        onClick={() => {
                          getMinter(ticket);

                          setShowDetailModal(true);
                        }}
                      >
                        <Info />
                      </button>
                      {ticket.owner !== account ? (
                        <button
                          className="p-2 text-primary"
                          onClick={() => {
                            getAccountBalance();
                            setSelectedTicket({
                              itemId: ticket.itemId,
                              image: ticket.image,
                              name: ticket.name,
                              tokenId: ticket.tokenId,
                              price: ticket.price,
                            });
                            setShowCheckoutModal(true);
                          }}
                        >
                          <Cart />
                        </button>
                      ) : (
                        <button
                          className="p-2 text-primary"
                          onClick={() => {
                            setSelectedTicket({
                              itemId: ticket.itemId,
                            });
                            setShowCancelModal(true);
                          }}
                        >
                          <div className="relative">
                            <Cart />
                            <Cancel className="absolute top-0 scale-50 text-red-500 rounded-full bg-modal-button" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
export default Listing;
