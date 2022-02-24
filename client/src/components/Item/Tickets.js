import { React, Fragment, useState, useEffect, useRef } from "react";
import axios from "axios";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { API_URL } from "../../config";
import Loading from "../Loading";
import { Link } from "react-router-dom";
import {
  buyTicket,
  fetchEvent,
  fetchMarketItems,
  fetchTicket,
  getAccount,
  getBalance,
  getUri,
} from "../../services/Web3";
import ReactTooltip from "react-tooltip";

import { ReactComponent as Left } from "../../assets/icons/left.svg";
import { ReactComponent as Info } from "../../assets/icons/info.svg";
import { ReactComponent as Cart } from "../../assets/icons/cart.svg";
import { ReactComponent as Down } from "../../assets/icons/down.svg";
import { ReactComponent as Close } from "../../assets/icons/close.svg";
import { ReactComponent as BNB } from "../../assets/icons/bnb.svg";

const listOption = [
  { title: "Recently Listed", value: "recently" },
  { title: "Oldest", value: "oldest" },
  { title: "Price: High to Low", value: "high" },
  { title: "Price: Low to High", value: "low" },
];

function Tickets() {
  const [account, setAccount] = useState();
  const [sortBy, setSortBy] = useState(listOption[0]);
  const [selectedTicket, setSelectedTicket] = useState({
    image: "",
    organizerName: "",
    name: "",
    tokenId: "",
    price: "",
  });
  const [tickets, setTickets] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [event, setEvent] = useState([]);
  const [bnb, setBnb] = useState(0);
  const [balance, setBalance] = useState();
  const [copy, setCopy] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = false;
  }, []);

  useEffect(() => {
    fetchAccount();
    loadTickets();
    fetchBNB();
    if (isMounted) {
      setLoadingState(true);
    }
  }, [tickets]);

  const loadTickets = async () => {
    const data = await fetchMarketItems();
    let payload = { tokenList: [] };
    const items = await Promise.all(
      data.map(async (i) => {
        const ticket = await fetchTicket(i.tokenId);
        const eventUri = await getUri(ticket.eventTokenId);
        const eventMeta = await axios.get(eventUri);
        const tokenUri = await getUri(i.tokenId);
        const ticketMeta = await axios.get(tokenUri);
        let item = {
          eventId: ticket.eventTokenId,
          eventName: eventMeta.data.name,
          itemId: i.itemId,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          price: i.price,
          image: ticketMeta.data.image,
          name: ticketMeta.data.name,
          link: ticketMeta.data.link,
          description: ticketMeta.data.description,
          startDate: ticketMeta.data.startDate,
          endDate: ticketMeta.data.endDate,
          active: ticket.active,
        };
        payload.tokenList.push(i.tokenId);
        return item;
      })
    );
    setTickets(items);
  };

  const handleChange = (event) => {
    let { value } = event.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : null;
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

  const handleSubmit = async (ticket) => {
    const balance = await getBalance();
    setSelectedTicket({
      itemId: ticket.itemId,
      image: ticket.image,
      organizerName: ticket.organizerName,
      name: ticket.name,
      tokenId: ticket.tokenId,
      price: ticket.price,
    });
    setShowCheckoutModal(true);
  };

  const confirmCheckout = async (itemId, price) => {
    await buyTicket(itemId, price)
      .then()
      .catch((err) => console.log(err));
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 1000);
  };

  const getMinter = (tokenId) => {
    // return event.filter((el) => {
    //   return el.tokenId === tokenId;
    // })[0].name;
  };

  return (
    <>
      <div className="h-full w-full flex justify-end text-white bg-background">
        <div className="h-full w-2/12 fixed p-5 space-y-10 left-0 flex flex-col items-center shadow-lg bg-modal-button">
          <div className="w-full space-y-3">
            <p className="w-full text-2xl font-bold">Sort by</p>
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
                              <p
                                className={active ? "text-white" : "text-input"}
                              >
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
            <p className="text-2xl font-bold">Min Price</p>
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
            <p className="text-2xl font-bold">Max Price</p>
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
        <div className="h-fit w-10/12 p-10 pb-20">
          {!loadingState ? (
            <div className="h-full w-full flex justify-center items-center">
              <Loading loading={loadingState} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="h-full w-full flex justify-center items-center text-3xl">
              <p>No items to display</p>
            </div>
          ) : (
            <div className="h-auto w-full grid grid-cols-2 gap-5 pb-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {tickets.map((ticket, i) => (
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
                          ~ {((bnb * ticket.price) / 10 ** 8).toLocaleString()}{" "}
                          THB
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 py-2 flex items-center space-x-5 justify-between text-text">
                    {ticket.active && (
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p>Active</p>
                      </div>
                    )}
                    <div className="flex space-x-1">
                      <button className="p-2 text-white">
                        <Info />
                      </button>
                      <button
                        className="p-2 text-primary"
                        onClick={() => {
                          handleSubmit(ticket);
                        }}
                      >
                        <Cart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
                          ~{" "}
                          {(
                            (bnb * selectedTicket.price) /
                            10 ** 8
                          ).toLocaleString()}{" "}
                          THB
                        </p>
                      ) : (
                        <p className="text-sm text-sub-text">~ 0 THB</p>
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
                        confirmCheckout(
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
        {balance / 10 ** 18 > selectedTicket.price / 10 ** 8 && (
          <ReactTooltip
            effect="solid"
            place="top"
            offset={{ top: 2, left: 0 }}
            backgroundColor="#5A5A5C"
          />
        )}
      </Transition>
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
    </>
  );
}

export default Tickets;
