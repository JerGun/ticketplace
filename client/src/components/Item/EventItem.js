import { React, Fragment, useState, useEffect, useRef } from "react";
import axios from "axios";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import ReactTooltip from "react-tooltip";
import { Link, useParams } from "react-router-dom";
import {
  getUri,
  fetchTicket,
  fetchEvent,
  getAccount,
  fetchTicketsInEvent,
  cancelListing,
  fetchMarketItem,
  getBalance,
  buyTicket,
  createMarketItem,
} from "../../services/Web3";
import { API_URL } from "../../config";

import { ReactComponent as Cart } from "../../assets/icons/cart.svg";
import { ReactComponent as Search } from "../../assets/icons/search.svg";
import { ReactComponent as Info } from "../../assets/icons/info.svg";
import { ReactComponent as Price } from "../../assets/icons/price.svg";
import { ReactComponent as Down } from "../../assets/icons/down.svg";
import { ReactComponent as Cancel } from "../../assets/icons/cancel.svg";
import { ReactComponent as Close } from "../../assets/icons/close.svg";
import { ReactComponent as BNB } from "../../assets/icons/bnb.svg";
import { ReactComponent as Edit } from "../../assets/icons/edit.svg";
import { ReactComponent as Calendar } from "../../assets/icons/calendar.svg";
import { ReactComponent as External } from "../../assets/icons/external.svg";
import { ReactComponent as Location } from "../../assets/icons/location.svg";
import { ReactComponent as Left } from "../../assets/icons/left.svg";
import { ReactComponent as Ticket } from "../../assets/icons/ticket.svg";

const listOption = [
  { title: "Recently Created", value: "recently" },
  { title: "Oldest", value: "oldest" },
  { title: "Price: High to Low", value: "high" },
  { title: "Price: Low to High", value: "low" },
];

function EventItem() {
  const [account, setAccount] = useState("");
  const [tickets, setTickets] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [event, setEvent] = useState("");
  const [owner, setOwner] = useState(false);
  const [bnb, setBnb] = useState(0);
  const [balance, setBalance] = useState("");
  const [priceRequired, setPriceRequired] = useState(false);
  const [pricePattern, setPricePattern] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [price, setPrice] = useState("");
  const [copy, setCopy] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [sortBy, setSortBy] = useState(listOption[0]);
  const [filter, setFilter] = useState({
    keyword: "",
    listing: false,
    unlist: false,
    available: false,
    used: false,
    min: "",
    max: "",
  });

  const params = useParams();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = false;
  }, []);

  useEffect(() => {
    loadTickets();
  }, [sortBy, filter]);

  useEffect(async () => {
    fetchAccount();
    fetchBNB();
    await loadEvent();
    await loadTickets();
    if (isMounted) {
      setLoadingState(true);
    }
  }, []);

  const loadEvent = async () => {
    const event = await fetchEvent(params.eventId);
    const eventUri = await getUri(params.eventId);
    const eventMeta = await axios.get(eventUri);
    let item = {
      owner: event.owner,
      image: eventMeta.data.image,
      name: eventMeta.data.name,
      link: eventMeta.data.link,
      location: eventMeta.data.location,
      startDate: eventMeta.data.startDate,
      endDate: eventMeta.data.endDate,
      startTime: eventMeta.data.startTime,
      endTime: eventMeta.data.endTime,
    };

    const account = await getAccount();

    await axios
      .get(`${API_URL}/account/${event.owner}`)
      .then((user) => {
        if (user.data) {
          item.organizer = event.owner;
          item.organizerName = event.owner === account ? "you" : user.data.name;
        } else item.ownerName = item.owner.slice(2, 9).toUpperCase();
      })
      .catch((err) => console.log(err));

    if (event.owner === account) setOwner(true);
    setEvent(item);
  };

  const loadTickets = async () => {
    const event = await fetchEvent(params.eventId);
    const eventUri = await getUri(params.eventId);
    const eventMeta = await axios.get(eventUri);
    const ticketsData = await fetchTicketsInEvent(params.eventId);
    let items = await Promise.all(
      ticketsData.map(async (i) => {
        const ticketInMarket = await fetchMarketItem(i.tokenId);
        const ticket = await fetchTicket(i.tokenId);
        const ticketUri = await getUri(i.tokenId);
        const ticketMeta = await axios.get(ticketUri);
        console.log(ticket);
        let item = {
          eventId: ticket.eventTokenId,
          eventName: eventMeta.data.name,
          eventOwner: event.owner,
          itemId: ticketInMarket.itemId,
          tokenId: ticket.tokenId,
          owner: ticket.owner,
          price: ticket.price,
          list: ticket.list,
          image: ticketMeta.data.image,
          name: ticketMeta.data.name,
          link: ticketMeta.data.link,
          description: ticketMeta.data.description,
          location: ticketMeta.data.location,
          startDate: ticketMeta.data.startDate,
          endDate: ticketMeta.data.endDate,
          startTime: ticketMeta.data.startTime,
          endTime: ticketMeta.data.endTime,
          active: ticket.active,
        };
        return item;
      })
    );

    items = items
      .filter((e) => {
        return e !== undefined;
      })
      .reverse();

      if (filter.listing || filter.unlist) {
        if (filter.listing) {
          items = items.filter((i) => i.list);
        }
        if (filter.unlist) {
          items = items.filter((i) => !i.list);
        }
      }
    if (filter.available || filter.used) {
      if (filter.available) {
        items = items.filter((i) => i.active);
      }
      if (filter.used) {
        items = items.filter((i) => !i.active);
      }
    }
    if (filter.min || filter.max) {
      let temp = items;
      if (filter.min && filter.max) {
        temp = items.filter(
          (i) =>
            i.price >= filter.min * 10 ** 8 && i.price <= filter.max * 10 ** 8
        );
      } else {
        if (filter.min)
          temp = items.filter((i) => i.price >= filter.min * 10 ** 8);
        if (filter.max)
          temp = items.filter((i) => i.price <= filter.max * 10 ** 8);
      }
      items = temp;
    }
    if (filter.keyword) {
      const temp = items.filter((i) =>
        new RegExp(filter.keyword, "i").test(i.name)
      );
      items = temp;
    }
    if (sortBy.title === "Oldest") {
      items = items.reverse();
    } else if (sortBy.title === "Price: High to Low") {
      console.log("asd");
      items = items.sort((a, b) => b.price - a.price);
    } else if (sortBy.title === "Price: Low to High") {
      items = items.sort((a, b) => a.price - b.price);
    }

    setTickets(items);
  };

  const fetchBNB = async () => {
    await axios
      .get("https://api.coingecko.com/api/v3/coins/binancecoin")
      .then((result) => {
        setBnb(result.data.market_data.current_price.thb.toFixed(2));
      });
  };

  const fetchAccount = async () => {
    const account = await getAccount();
    setAccount(account);
  };

  const getAccountBalance = async () => {
    const balance = await getBalance();
    setBalance(balance);
  };

  const handleMinChange = (event) => {
    let { value } = event.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : "";
    setFilter({
      ...filter,
      min: value,
    });
  };

  const handleMaxChange = (event) => {
    let { value } = event.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : "";
    setFilter({
      ...filter,
      max: value,
    });
  };

  const handleSubmit = async (itemId, price) => {
    await buyTicket(itemId, price)
      .then()
      .catch((err) => console.log(err));
  };

  const handleCancel = async (itemId) => {
    await cancelListing(itemId).catch((err) => console.log(err));
  };

  const handlePriceChange = (e) => {
    let { value } = e.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : "";
    setPrice(value);
    !e.target.value.length
      ? (setPriceRequired(true), setPricePattern(false))
      : parseFloat(e.target.value) < 0.001
      ? (setPriceRequired(false), setPricePattern(true))
      : (setPriceRequired(false), setPricePattern(false));
  };

  const handleSell = async (ticketId) => {
    parseFloat(price) >= 0.001 && (await createMarketItem(ticketId, price));
  };

  const resetFilter = () => {
    setFilter({
      ...filter,
      listing: false,
      sold: false,
      available: false,
      used: false,
      min: "",
      max: "",
    });
    setSortBy(listOption[0]);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 1000);
  };

  const getMinter = async (ticket) => {
    let organizer;
    await axios
      .get(`${API_URL}/account/${ticket.eventOwner}`)
      .then((user) => {
        if (user.data) organizer = user.data.name;
        else organizer = ticket.eventOwner.slice(2, 9).toUpperCase();
      })
      .catch((err) => console.log(err));

    setSelectedTicket({
      eventId: ticket.eventId,
      eventName: ticket.eventName,
      eventOwner: ticket.eventOwner,
      organizer: organizer,
      itemId: ticket.itemId,
      tokenId: ticket.tokenId,
      image: ticket.image,
      name: ticket.name,
      price: ticket.price,
      list: ticket.list,
      description: ticket.description,
      startDate: ticket.startDate,
      endDate: ticket.endDate,
      startTime: ticket.startTime,
      endTime: ticket.endTime,
      location: ticket.location,
      active: ticket.active,
    });
  };

  return (
    <div>
      {!loadingState ? (
        <div className="relative w-full flex justify-center shadow-lg animate-pulse">
          <div className="absolute h-full w-full pb-1 opacity-50 bg-white bg-opacity-30"></div>
          <div className="h-full w-9/12 py-10 z-10 flex items-center">
            <div className="h-96 w-4/12 bg-modal-button"></div>
            <div className="relative h-96 w-full px-20 space-y-5 flex flex-col justify-center bg-modal-button bg-opacity-60">
              <div className="h-fit w-full p-3 space-y-5 rounded-lg">
                <div className="h-3 w-1/4 rounded bg-hover bg-opacity-50"></div>
                <div className="h-6 w-1/2 rounded bg-hover bg-opacity-50"></div>
              </div>
              <div className="h-fit w-full p-3 space-y-5 rounded-lg">
                <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
                <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
                <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full flex justify-center text-white shadow-lg">
          <div className="absolute h-full w-full pb-1 opacity-50">
            <img
              src={event.image}
              alt=""
              className="h-full w-full object-cover blur-sm"
            />
          </div>
          <div className="h-full w-9/12 py-10 z-10 flex items-center">
            <div className="h-96 w-4/12">
              <img
                src={event.image}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative h-96 w-full px-20 flex items-center bg-modal-button bg-opacity-95">
              <div className="absolute flex space-x-5 top-5 right-5">
                {owner && (
                  <Link
                    to={`/event/${params.eventId}/edit`}
                    data-tip="Share"
                    className="h-11 w-11 flex justify-center items-center rounded-lg shadow-md bg-hover hover:bg-hover-light"
                  >
                    <Edit className="scale-50" />
                  </Link>
                )}
                {event.link && (
                  <a
                    data-tip="External Link"
                    target={"_blank"}
                    href={event.link}
                    className="h-11 w-11 flex justify-center items-center rounded-lg shadow-md bg-hover hover:bg-hover-light"
                  >
                    <External />
                  </a>
                )}
                {owner && (
                  <Link
                    to={`/event/${params.eventId}/ticket/create`}
                    data-tip="Share"
                    className="h-11 w-fit px-5 flex justify-center items-center font-bold rounded-lg shadow-md text-black bg-primary hover:bg-primary-light"
                  >
                    <p>Add ticket</p>
                  </Link>
                )}
              </div>
              <div className="w-fit space-y-10 text-left">
                <div>
                  <div className="flex space-x-1">
                    <p>Created by</p>
                    <p className="text-primary">{event.organizerName}</p>
                  </div>
                  <p className="text-4xl">{event.name}</p>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6" />
                    <p>
                      {event.startDate} at {event.startTime} - {event.endDate}{" "}
                      at {event.endTime}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Location className="h-6 w-6" />
                    <p>{event.location}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Ticket className="h-6 w-6" />
                    <p>
                      {tickets.length}{" "}
                      {tickets.length < 2 ? "ticket" : "tickets"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="h-full w-full flex text-white bg-background">
        <div className="sticky top-0 h-screen min-h-full w-2/12 p-5 flex flex-col items-center space-y-10 shadow-lg bg-modal-button">
          <div className="w-full space-y-3">
            <p className="w-full text-xl font-bold">Listing Status</p>
            <label className="w-fit flex items-center hover:cursor-pointer">
              <div className="h-5 w-5 flex items-center justify-center rounded-md border-2 border-white">
                <input
                  type="checkbox"
                  className="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                  checked={filter.listing}
                  onChange={() => {
                    setFilter({
                      ...filter,
                      listing: true,
                      unlist: false,
                    });
                  }}
                />
              </div>
              <span className="ml-2 select-none">Listing</span>
            </label>
            <label className="w-fit flex items-center hover:cursor-pointer">
              <div className="h-5 w-5 flex items-center justify-center rounded-md border-2 border-white">
                <input
                  type="checkbox"
                  className="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                  checked={filter.unlist}
                  onChange={() => {
                    setFilter({
                      ...filter,
                      listing: false,
                      unlist: true,
                    });
                  }}
                />
              </div>
              <span className="ml-2 select-none">Unlist</span>
            </label>
          </div>
          <div className="w-full space-y-3">
            <p className="w-full text-xl font-bold">Ticket Status</p>
            <label className="w-fit flex items-center hover:cursor-pointer">
              <div className="h-5 w-5 flex items-center justify-center rounded-md border-2 border-white">
                <input
                  type="checkbox"
                  className="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                  checked={filter.available}
                  onChange={() => {
                    setFilter({
                      ...filter,
                      available: true,
                      used: false,
                    });
                  }}
                />
              </div>
              <span className="ml-2 select-none">Available</span>
            </label>
            <label className="w-fit flex items-center hover:cursor-pointer">
              <div className="h-5 w-5 flex items-center justify-center rounded-md border-2 border-white">
                <input
                  type="checkbox"
                  className="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                  checked={filter.used}
                  onChange={() => {
                    setFilter({
                      ...filter,
                      available: false,
                      used: true,
                    });
                  }}
                />
              </div>
              <span className="ml-2 select-none">Used</span>
            </label>
          </div>
          <div className="w-full space-y-3">
            <p className="w-full text-xl font-bold">Sort</p>
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
                  <Listbox.Options className="absolute w-full mt-3 p-1 bg-hover rounded-xl shadow-lg">
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
                              <p className="text-white">{item.title}</p>
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
            <p className="w-full text-xl font-bold">Price</p>
            <div className="h-11 w-full flex items-center rounded-lg shadow-lg px-3 text-white bg-hover hover:bg-hover-light">
              Binance Coin (BNB)
            </div>
            <div className="flex items-center space-x-5">
              <div className="h-11 w-1/2 space-x-3 px-3 flex items-center rounded-lg shadow-lg bg-hover hover:bg-hover-light focus-within:bg-hover-light">
                <input
                  type="number"
                  placeholder="Min"
                  min="1"
                  value={filter.min}
                  onChange={handleMinChange}
                  className="h-full w-full bg-transparent"
                />
              </div>
              <p>to</p>
              <div className="h-11 w-1/2 space-x-3 px-3 flex items-center rounded-lg shadow-lg bg-hover hover:bg-hover-light focus-within:bg-hover-light">
                <input
                  type="number"
                  placeholder="Max"
                  min="1"
                  value={filter.max}
                  onChange={handleMaxChange}
                  className="h-full w-full bg-transparent"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            onClick={resetFilter}
            className="h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
          >
            Reset
          </button>
        </div>
        <div className="h-full w-10/12 px-10 pt-5 pb-14 space-y-5">
          <div className="h-11 w-1/2 space-x-3 px-3 flex items-center rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
            <Search className="h-1/2" />
            <input
              type="text"
              placeholder="Search tickets"
              value={filter.keyword}
              onChange={(e) => {
                console.log(e.target.value);
                setFilter({ ...filter, keyword: e.target.value });
              }}
              className="h-full w-full bg-transparent"
            />
          </div>
          {loadingState && !tickets.length && (
            <div className="h-64 w-full border-2 rounded-lg flex items-center justify-center border-input">
              <h1 className="py-10 px-20 text-3xl">No items to display</h1>
            </div>
          )}
          {loadingState && !tickets.length ? (
            <span></span>
          ) : (
            tickets && (
              <p>
                {tickets.length} {tickets.length > 1 ? "items" : "item"}
              </p>
            )
          )}
          <div className="h-auto w-full grid grid-cols-2 gap-5 pb-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {!loadingState
              ? [...Array(10)].map((x, i) => (
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
                      <div className="w-fit flex space-x-1"></div>
                    </div>
                  </div>
                ))
              : tickets.map((ticket, i) => (
                  <div
                    key={i}
                    className="relative h-full w-full rounded-lg shadow-lg float-right bg-modal-button"
                  >
                    {ticket.sold && (
                      <Link
                        to={`/event/${ticket.eventId}/ticket/${ticket.tokenId}`}
                        className="absolute h-full w-full z-10"
                      >
                        <div className="relative h-full w-full flex justify-center items-center rounded-lg bg-black bg-opacity-50">
                          <p className="z-20 font-bold text-2xl text-white">
                            Sold out
                          </p>
                        </div>
                      </Link>
                    )}
                    <div className={`${ticket.sold && "blur-[1px]"} h-full flex flex-col justify-between`}>
                      <Link
                        to={`/event/${ticket.eventId}/ticket/${ticket.tokenId}`}
                        className="h-full"
                      >
                        <div className="h-full p-3 space-y-3 shadow-lg">
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
                            {ticket.list && (
                              <>
                                <p className="text-lg">
                                  {ticket.price / 10 ** 8} BNB
                                </p>
                                <p className="w-10/12 truncate text-sm text-text">
                                  {(
                                    (bnb * ticket.price) /
                                    10 ** 8
                                  ).toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}{" "}
                                  THB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="h-12 px-3 py-2 flex items-center space-x-5 justify-between text-text">
                        <div className="flex items-center space-x-2">
                          {!ticket.sold && (
                            <span className="relative flex h-2 w-2">
                              <span
                                className={`${
                                  ticket.active ? "bg-green-500" : "bg-red-500"
                                } animate-ping absolute h-2 w-2 rounded-full opacity-75`}
                              ></span>
                              <span
                                className={`${
                                  ticket.active ? "bg-green-500" : "bg-red-500"
                                } h-2 w-2 rounded-full`}
                              ></span>
                            </span>
                          )}
                          <p className="w-full text-sm truncate">
                            Token ID: {ticket.tokenId}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {!ticket.sold && (
                            <>
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
                                ticket.list && (
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
                                )
                              ) : !ticket.list ? (
                                <button
                                  className="p-2 text-primary"
                                  onClick={() => {
                                    setSelectedTicket({
                                      tokenId: ticket.tokenId,
                                    });
                                    setShowSellModal(true);
                                  }}
                                >
                                  <Price />
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
                                    <Price />
                                    <Cancel className="absolute top-0 scale-50 text-red-500 rounded-full bg-modal-button" />
                                  </div>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
      {/* Listing Modal */}
      <Transition
        show={showSellModal}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto "
          onClose={() => setShowSellModal(false)}
        >
          <div className="px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-80" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-xl my-8 text-left align-middle transition-all transform text-white bg-background shadow-lg rounded-2xl">
                {/*header*/}
                <div className="relative flex items-center justify-center p-5 border-b border-solid border-white">
                  <h3 className="text-2xl">List item for sale</h3>
                  <button
                    className="absolute right-5 p-3 text-white"
                    onClick={() => setShowSellModal(false)}
                  >
                    <Close />
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 space-y-3">
                  <div className="space-y-3">
                    <div className="flex space-x-1">
                      <p>Price</p>
                      <p className="text-red-500">*</p>
                    </div>
                    <div className="flex space-x-5">
                      <div className="h-11 w-full px-3 flex items-center space-x-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                        <input
                          type="number"
                          placeholder="1"
                          value={price}
                          className="price h-full w-full bg-transparent"
                          onChange={handlePriceChange}
                        />
                      </div>
                      <div className="h-11 px-5 flex items-center space-x-3 rounded-lg bg-input">
                        <p>BNB</p>
                      </div>
                    </div>
                    {priceRequired && (
                      <div className="flex items-center space-x-3 text-sm text-red-400">
                        <Close className="h-2 w-2" />
                        <p>Price is required.</p>
                      </div>
                    )}
                    {pricePattern && (
                      <div className="flex items-center space-x-3 text-sm text-red-400">
                        <Close className="h-2 w-2" />
                        <p>Price must more than 0.001 BNB.</p>
                      </div>
                    )}
                    {price ? (
                      <p className="text-sm text-text">
                        {(bnb * price).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        THB
                      </p>
                    ) : (
                      <p className="text-sm text-sub-text">0 THB</p>
                    )}
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-center p-6 border-t border-solid border-white">
                  <button
                    className={`${priceRequired && "opacity-50"} ${
                      pricePattern && "opacity-50"
                    }  h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-black bg-primary hover:bg-primary-light`}
                    type="button"
                    onClick={() => {
                      handleSell(selectedTicket.tokenId);
                      setShowSellModal(false);
                    }}
                    disabled={priceRequired || pricePattern}
                  >
                    Complete listing
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {/* Checkout Modal */}
      <Transition
        show={showCheckoutModal}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto "
          onClose={() => setShowCheckoutModal(false)}
        >
          <div className="px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-80" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-xl my-8 text-left align-middle transition-all transform text-white bg-background shadow-lg rounded-2xl">
                {/*header*/}
                <div className="relative flex items-center justify-center p-5 border-b border-solid border-white">
                  <h3 className="text-2xl">Complete checkout</h3>
                  <button
                    className="absolute right-5 p-3 text-white"
                    onClick={() => setShowCheckoutModal(false)}
                  >
                    <Close />
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 space-y-3">
                  <p>Item</p>
                  <div className="flex justify-between">
                    <div className="flex space-x-5">
                      <div className="h-24 w-16 rounded-lg bg-white">
                        <img
                          src={selectedTicket.image}
                          alt=""
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <p>{selectedTicket.organizerName}</p>
                        <p className="text-xl">{selectedTicket.name}</p>
                        <p className="text-sm text-text">
                          Token ID: {selectedTicket.tokenId}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center text-right space-y-3">
                      <div className="flex items-center space-x-5">
                        <BNB className="h-6 w-6" />
                        <p className="text-xl">
                          {selectedTicket.price / 10 ** 8} BNB
                        </p>
                      </div>
                      {selectedTicket.price ? (
                        <p className="text-sm text-text">
                          {(
                            (bnb * selectedTicket.price) /
                            10 ** 8
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          THB
                        </p>
                      ) : (
                        <p className="text-sm text-sub-text">0 THB</p>
                      )}
                    </div>
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-center p-6 space-x-5 border-t border-solid border-white">
                  <div className="relative h-fit w-fit">
                    {balance / 10 ** 18 < selectedTicket.price / 10 ** 8 && (
                      <div
                        data-tip="Not enough BNB to complete purchase"
                        className="absolute h-full w-full z-10"
                      ></div>
                    )}
                    <button
                      className={`${
                        balance / 10 ** 18 < selectedTicket.price / 10 ** 8 &&
                        "opacity-50 hover:bg-primary"
                      } h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-black bg-primary hover:bg-primary-light`}
                      type="button"
                      onClick={() => {
                        // handleSubmit(selectedTicket.itemId, selectedTicket.price);
                        handleSubmit(
                          selectedTicket.itemId,
                          selectedTicket.price
                        );
                        setShowCheckoutModal(false);
                      }}
                      disabled={
                        balance / 10 ** 18 < selectedTicket.price / 10 ** 8
                      }
                    >
                      Confirm checkout
                    </button>
                  </div>
                  {balance / 10 ** 18 < selectedTicket.price / 10 ** 8 && (
                    <button
                      className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-white bg-hover hover:bg-hover-light"
                      type="button"
                      onClick={() => {
                        setShowCheckoutModal(false);
                        setTimeout(() => {
                          setShowAddFundsModal(true);
                        }, 500);
                      }}
                    >
                      Add funds
                    </button>
                  )}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
        {balance / 10 ** 18 < selectedTicket.price / 10 ** 8 && (
          <ReactTooltip
            effect="solid"
            place="top"
            offset={{ top: 2, left: 0 }}
            backgroundColor="#5A5A5C"
          />
        )}
      </Transition>
      {/* Add Funds Modal */}
      <Transition
        show={showAddFundsModal}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto "
          onClose={() => setShowAddFundsModal(false)}
        >
          <div className="px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-80" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-xl my-8 text-left align-middle transition-all transform text-white bg-background shadow-lg rounded-2xl">
                {/*header*/}
                <div className="relative flex items-center justify-center p-5 border-b border-solid border-white">
                  <h3 className="text-2xl">Add funds</h3>
                  <button
                    className="absolute left-5 p-3 scale-50 text-white"
                    onClick={() => {
                      getAccountBalance();
                      setShowAddFundsModal(false);
                      setTimeout(() => {
                        setShowCheckoutModal(true);
                      }, 500);
                    }}
                  >
                    <Left />
                  </button>
                  <button
                    className="absolute right-5 p-3 text-white"
                    onClick={() => setShowAddFundsModal(false)}
                  >
                    <Close />
                  </button>
                </div>
                {/*body*/}
                <div className="p-6 space-y-5 flex flex-col items-center">
                  <p className="text-text">
                    Send BNB from your exchange or wallet to the following
                    address. Only send BNB!
                  </p>
                  <div className="w-full space-y-3">
                    <p>Your Wallet Address</p>
                    <div className="flex space-x-5">
                      <div className="h-11 w-full px-3 flex items-center space-x-3 rounded-lg text-text bg-input">
                        <p>{account}</p>
                      </div>
                      <button
                        className="h-11 w-24 px-5 flex items-center justify-center space-x-3 rounded-lg font-bold text-black bg-primary hover:bg-primary-light"
                        onClick={() => {
                          copyAddress();
                        }}
                      >
                        {copy ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {/* Cancel Listing Modal */}
      <Transition
        show={showCancelModal}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={() => setShowCancelModal(false)}
        >
          <div className="px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-80" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-xl my-8 text-left align-middle transition-all transform text-white bg-background shadow-lg rounded-2xl">
                {/*header*/}
                <div className="relative flex items-center justify-center p-5 border-b border-solid border-white">
                  <h3 className="text-2xl">
                    Are you sure you want to cancel your listing?
                  </h3>
                  <button
                    className="absolute right-5 p-3 text-white"
                    onClick={() => setShowCancelModal(false)}
                  >
                    <Close />
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 space-y-3 flex justify-center">
                  <button
                    className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-black bg-primary hover:bg-primary-light"
                    type="button"
                    onClick={() => {
                      handleCancel(selectedTicket.itemId);
                      setShowCancelModal(false);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {/* Detail Modal */}
      <Transition
        show={showDetailModal}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto "
          onClose={() => setShowDetailModal(false)}
        >
          <div className="px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-80" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform text-white bg-background shadow-lg rounded-2xl">
                {/*header*/}
                <div className="relative flex items-center justify-center p-5 border-b border-solid border-white">
                  <h3 className="text-2xl">Ticket Detail</h3>
                  <button
                    className="absolute right-5 p-3 text-white"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <Close />
                  </button>
                </div>
                {/*body*/}
                {selectedTicket && (
                  <div className="relative p-6 space-y-3">
                    <div className="flex">
                      <div className="w-4/12 space-y-3">
                        <div className="h-64 w-48 rounded-lg">
                          <img
                            src={selectedTicket.image}
                            alt=""
                            className="h-full w-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="space-y-1 ml-3">
                          <p>Ticket Status</p>
                          <div className="flex items-center space-x-2">
                            <span className="relative flex h-2 w-2">
                              <span
                                className={`${
                                  selectedTicket.active
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                } animate-ping absolute h-2 w-2 rounded-full opacity-75`}
                              ></span>
                              <span
                                className={`${
                                  selectedTicket.active
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                } h-2 w-2 rounded-full`}
                              ></span>
                            </span>
                            <p>
                              {selectedTicket.active ? "Available" : "Used"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-8/12 space-y-3">
                        <div className="space-y-1">
                          <p>Ticket ID</p>
                          <p className="text-text">{selectedTicket.tokenId}</p>
                        </div>
                        <div className="space-y-1">
                          <p>Organized by</p>
                          <div className="flex justify-between">
                            <p
                              className="text-text"
                              data-tip={selectedTicket.eventOwner}
                            >
                              {selectedTicket.organizer}
                            </p>
                          </div>
                          <ReactTooltip
                            effect="solid"
                            place="top"
                            offset={{ top: 5, left: 0 }}
                            backgroundColor="#5A5A5C"
                          />
                        </div>
                        <div className="space-y-1">
                          <p>Event name</p>
                          <a
                            href={`/#/event/${selectedTicket.eventId}`}
                            className="text-primary"
                          >
                            {selectedTicket.eventName}
                          </a>
                        </div>
                        <div className="space-y-1">
                          <p>Ticket name</p>
                          <p className="text-text">{selectedTicket.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p>Location</p>
                          <p className="text-text">{selectedTicket.location}</p>
                        </div>
                        <div className="space-y-1">
                          <p>Start at date</p>
                          <p className="text-text">
                            {selectedTicket.startDate} at{" "}
                            {selectedTicket.startTime}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p>End at date</p>
                          <p className="text-text">
                            {selectedTicket.endDate} at {selectedTicket.endTime}
                          </p>
                        </div>
                        {selectedTicket.list && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-5">
                              <BNB className="h-6 w-6" />
                              <p className="text-xl">
                                {selectedTicket.price / 10 ** 8} BNB
                              </p>
                            </div>
                            {selectedTicket.price ? (
                              <p className="text-text">
                                {(
                                  (bnb * selectedTicket.price) /
                                  10 ** 8
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                THB
                              </p>
                            ) : (
                              <p className="text-text">0 THB</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default EventItem;
