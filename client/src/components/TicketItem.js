import { React, Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Link, useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import axios from "axios";
import formatter from "../formatter";
import Loading from "./Loading";
import {
  contractAddress,
  getUri,
  fetchEvent,
  fetchTicket,
  getAccount,
  fetchMarketItem,
  buyTicket,
} from "../services/Web3";
import { API_URL } from "../config";

import { ReactComponent as Price } from "../assets/icons/price.svg";
import { ReactComponent as BNB } from "../assets/icons/bnb.svg";
import { ReactComponent as External } from "../assets/icons/external.svg";
import { ReactComponent as Share } from "../assets/icons/share.svg";
import { ReactComponent as Description } from "../assets/icons/description.svg";
import { ReactComponent as Location } from "../assets/icons/location.svg";
import { ReactComponent as Calendar } from "../assets/icons/calendar.svg";
import { ReactComponent as History } from "../assets/icons/history.svg";
import { ReactComponent as Close } from "../assets/icons/close.svg";
import { ReactComponent as Check } from "../assets/icons/check.svg";

function TicketItem() {
  const [copy, setCopy] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [ticket, setTicket] = useState([]);
  const [history, setHistory] = useState([]);
  const [owner, setOwner] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [event, setEvent] = useState();

  const params = useParams();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = false;
  }, []);

  useEffect(async () => {
    const item = await fetchData();
    const asd = await axios.get(
      `https://api.covalenthq.com/v1/97/tokens/${contractAddress}/nft_transactions/${params.ticketId}/?&key=ckey_4ec1eb3bb5aa4b11a16c34b8550`
    );
    const transactions = await asd.data.data.items[0].nft_transactions;
    setHistory(transactions);
    console.log(asd, transactions);
    if (isMounted) {
      setLoadingState(true);
      setTicket(item);
    }
  }, []);

  const fetchData = async () => {
    const account = await getAccount();
    const ticket = await fetchTicket(params.ticketId);
    console.log(ticket);
    const ticketUri = await getUri(params.ticketId);
    const ticketMeta = await axios.get(ticketUri);

    const event = await fetchEvent(params.eventId);
    const eventUri = await getUri(params.eventId);
    const eventMeta = await axios.get(eventUri);
    setEvent(eventMeta.data);
    if (ticket.owner === account) setOwner(true);

    let data = {itemId: ""};
    if (ticket.list) {
      data = await fetchMarketItem(params.ticketId);
      console.log(data, params.ticketId);
    }

    let item = {
      itemId: data.itemId,
      tokenId: ticket.tokenId,
      seller: ticket.seller,
      owner: ticket.owner,
      image: ticketMeta.data.image,
      name: ticketMeta.data.name,
      link: ticketMeta.data.link,
      price: ticket.price,
      description: ticketMeta.data.description,
      location: ticketMeta.data.location,
      startDate: ticketMeta.data.startDate,
      endDate: ticketMeta.data.endDate,
      startTime: ticketMeta.data.startTime,
      endTime: ticketMeta.data.endTime,
    };

    await axios
      .get(`${API_URL}/account/${event.owner}`)
      .then(async (user) => {
        if (user) {
          item.organizer = event.owner;
          item.organizerName = event.owner === account ? "you" : user.data.name;
        } else item.ownerName = item.owner.slice(2, 9).toUpperCase();
      })
      .catch((err) => console.log(err));

    await axios
      .get(`${API_URL}/account/${item.owner}`)
      .then(async (user) => {
        if (user)
          item.ownerName = item.owner === account ? "you" : user.data.name;
        else item.ownerName = item.owner.slice(2, 9).toUpperCase();
      })
      .catch((err) => console.log(err));

    return item;
  };

  const fetchHistory = async () => {
    const fetchData = await axios.get(
      `https://api.covalenthq.com/v1/97/tokens/${contractAddress}/nft_transactions/${params.ticketId}/?&key=ckey_4ec1eb3bb5aa4b11a16c34b8550`
    );
    const transactions = await fetchData.data.data.items[0].nft_transactions;
    setHistory(transactions);
    console.log(fetchData, transactions);
  };

  const signEvent = (params) => {
    if (params[1].value === "0x0000000000000000000000000000000000000000")
      return "Minted";
    if (params[2].value === contractAddress.toLocaleLowerCase())
      return "Listed";
    return "Unknown";
  };

  const signAccount = (params) => {
    if (params.value === "0x0000000000000000000000000000000000000000")
      return "NullAddress";
    return params.value.slice(2, 9).toUpperCase();
  };

  const copyURL = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopy(true);
    setButtonDisabled(true);
    setTimeout(() => {
      setCopy(false);
      setButtonDisabled(false);
    }, 2000);
  };

  const handleSubmit = async (itemId, price) => {
    console.log(itemId, price);
    let transaction = await buyTicket(itemId, price);
  };

  return (
    <>
      {!loadingState && history && event ? (
        <div className="h-full w-full flex justify-center items-center">
          <Loading loading={loadingState} />
        </div>
      ) : (
        <div className="h-auto w-full p-10 pb-32 bg-background">
          <div className="h-full text-white">
            <div className="h-full w-full mx-28 flex space-x-5">
              <div className="w-72 space-y-5">
                <div className="h-80 w-full rounded-xl bg-input">
                  <img
                    src={ticket.image}
                    alt=""
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
                <div className="h-fit w-full flex justify-between items-center p-3 rounded-lg bg-input">
                  <p>Token ID</p>
                  <p>{params.ticketId}</p>
                </div>
                {owner && (
                  <div className="h-fit w-full p-3 space-y-3 rounded-lg bg-input">
                    <button
                      className="h-11 w-full flex justify-center items-center rounded-lg font-bold text-white bg-hover-light"
                      // onClick={() => setShowCheckoutModal(true)}
                    >
                      Edit
                    </button>
                    <Link
                      to={"sell"}
                      className="h-11 w-full flex justify-center items-center rounded-lg font-bold text-black bg-primary"
                    >
                      Sell
                    </Link>
                  </div>
                )}
                {!owner && (
                  <div className="h-fit w-full p-3 space-y-3 rounded-lg bg-input">
                    <div className="flex items-center space-x-3">
                      <Price />
                      <p>Price</p>
                    </div>
                    <div className="flex space-x-5">
                      <BNB />
                      <p className="text-4xl font-bold">
                        {ticket.price / 10 ** 8} BNB
                      </p>
                    </div>
                    <button
                      className="h-11 w-full flex justify-center items-center rounded-lg font-bold text-black bg-primary"
                      onClick={() => setShowCheckoutModal(true)}
                    >
                      Buy for {ticket.price / 10 ** 8} BNB
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full">
                <div className="w-6/12 space-y-5">
                  <div className="w-full space-y-1">
                    <div className="w-full flex justify-between items-center">
                      {event && <p className="text-4xl">{event.name}</p>}
                      <div className="flex space-x-5">
                        {ticket.link && (
                          <a
                            data-tip="External Link"
                            target={"_blank"}
                            href={ticket.link}
                            className="h-11 w-11 flex justify-center items-center rounded-lg bg-input"
                          >
                            <External />
                          </a>
                        )}
                        <button
                          data-tip="Share"
                          className="h-11 w-11 flex justify-center items-center rounded-lg bg-input"
                          onClick={copyURL}
                          disabled={buttonDisabled}
                        >
                          {copy === true ? (
                            <Check className="text-white" />
                          ) : (
                            <Share />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-3xl">{ticket.name}</p>
                    <div className="flex text-sm space-x-1">
                      <p className="text-text">Organized by</p>
                      <a
                        href={`${window.location.protocol}//${window.location.host}/${ticket.organizer}`}
                        className="text-primary"
                      >
                        {ticket.organizerName}
                      </a>
                    </div>
                    <div className="flex text-sm space-x-5">
                      <div className="inline-flex space-x-1">
                        <p className="text-text">Owned by</p>
                        <a
                          href={`${window.location.protocol}//${window.location.host}/${ticket.owner}`}
                        >
                          {ticket.ownerName}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="h-fit w-full py-5 pl-5 pr-3 rounded-lg bg-input">
                    <div className="h-full max-h-72 w-full">
                      <div className="sticky top-0 w-full pb-5 flex items-center space-x-3 bg-input">
                        <Description />
                        <p>Description</p>
                      </div>
                      <p className="pr-3 text-text break-words">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                  <div className="h-fit w-full p-5 space-y-3 rounded-lg bg-input">
                    <div className="flex items-center space-x-3">
                      <Location className="mx-1" />
                      <p>{ticket.location}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="scale-75" />
                      <p>Start at date</p>
                      <p className="text-text">
                        {ticket.startDate} at {ticket.startTime}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="scale-75" />
                      <p>End at date</p>
                      <p className="text-text">
                        {ticket.endDate} at {ticket.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="h-fit w-full rounded-lg bg-input">
                    <div className="flex items-center p-5 space-x-3">
                      <History />
                      <p>History</p>
                    </div>
                    <div className="rounded-b-lg divider-x-b">
                      <div className="grid grid-cols-5 pl-5 py-1 bg-black bg-opacity-20">
                        <p>Event</p>
                        <p>Unit Price</p>
                        <p>From</p>
                        <p>To</p>
                        <p>Date</p>
                      </div>
                      <div
                        className={`${
                          history.length > 5 && "overflow-auto"
                        } h-full max-h-60`}
                      >
                        {history.map((item, i) => (
                          <div key={i}>
                            {item.log_events
                              .filter((item) => {
                                item.decoded.params.length > 2 ??
                                  item.decoded.params[3].value ===
                                    params.ticketId ;
                              })
                              .map((history, j) => (
                                <div
                                  key={j}
                                  className="grid grid-cols-5 divider-x-b pl-5 py-3 text-white"
                                >
                                  <div className="flex space-x-1">
                                    <p className="text-text">
                                      {signEvent(history.decoded.params)}
                                    </p>
                                  </div>
                                  <div className="flex space-x-1">
                                    <p className="text-text">{history.price}</p>
                                  </div>
                                  <a
                                    href={`${window.location.protocol}//${window.location.host}/${history.decoded.params[1].value}`}
                                    className="flex space-x-1 text-primary"
                                  >
                                    <p>
                                      {signAccount(history.decoded.params[1])}
                                    </p>
                                  </a>
                                  {signEvent(history.decoded.params) !==
                                  "Listed" ? (
                                    <a
                                      href={`${window.location.protocol}//${window.location.host}/${history.decoded.params[2].value}`}
                                      className="flex space-x-1 text-primary"
                                    >
                                      <p>
                                        {signAccount(history.decoded.params[2])}
                                      </p>
                                    </a>
                                  ) : (
                                    <div></div>
                                  )}
                                  <a
                                    href={`https://testnet.bscscan.com/tx/${history.tx_hash}`}
                                    target="_blank"
                                    className={`${
                                      history.tx_hash && "text-primary"
                                    } w-fit flex space-x-1 text-text`}
                                    data-tip={formatter.dateConverter(
                                      history.block_signed_at
                                    )}
                                  >
                                    <p>
                                      {formatter.timeConverter(
                                        history.block_signed_at
                                      )}
                                    </p>
                                  </a>
                                  <ReactTooltip
                                    effect="solid"
                                    place="top"
                                    offset={{ top: 2, left: 0 }}
                                    backgroundColor="#5A5A5C"
                                  />
                                </div>
                              ))}
                          </div>
                        ))}
                        <div className="w-full divider-x-b"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
          className="fixed inset-0 z-10 overflow-y-auto "
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
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
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
              <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform text-white bg-background shadow-lg rounded-2xl">
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
                  <p>Items</p>
                  <div className="flex justify-between">
                    <div className="flex space-x-5">
                      <div className="h-24 w-16 rounded-lg bg-white">
                        <img
                          src={ticket.image}
                          alt=""
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <p>{ticket.organizerName}</p>
                        <p className="text-xl">{ticket.name}</p>
                        <p className="text-sm text-text">
                          Token ID: {ticket.tokenId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-5">
                      <BNB className="h-6 w-6" />
                      <p className="text-xl">{ticket.price / 10 ** 8} BNB</p>
                    </div>
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 space-x-5 border-t border-solid border-white">
                  <button
                    className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
                    type="button"
                    onClick={() => {
                      handleSubmit(ticket.itemId, ticket.price);
                      setShowCheckoutModal(false);
                    }}
                  >
                    Confirm checkout
                  </button>
                  <button
                    className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-white bg-modal-button"
                    type="button"
                    onClick={() => setShowAddFundsModal(true)}
                  >
                    Add funds
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <Transition show={copy}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog
            onClose={() => setCopy(false)}
            className="absolute bottom-10 right-10 py-3 px-6 rounded-lg shadow-lg bg-white"
          >
            <p>Copied</p>
          </Dialog>
        </Transition.Child>
      </Transition>
    </>
  );
}

export default TicketItem;
