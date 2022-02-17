import { React, Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Link, useLocation, useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import Web3 from "web3";
import axios from "axios";
import Event from "../contracts/Event.json";
import { API_URL } from "../config";
import formatter from "../formatter";
import Loading from "./Loading";

import { ReactComponent as Price } from "../assets/icons/price.svg";
import { ReactComponent as BNB } from "../assets/icons/bnb.svg";
import { ReactComponent as External } from "../assets/icons/external.svg";
import { ReactComponent as Share } from "../assets/icons/share.svg";
import { ReactComponent as Description } from "../assets/icons/description.svg";
import { ReactComponent as Location } from "../assets/icons/location.svg";
import { ReactComponent as Calendar } from "../assets/icons/calendar.svg";
import { ReactComponent as Clock } from "../assets/icons/clock.svg";
import { ReactComponent as History } from "../assets/icons/history.svg";
import { ReactComponent as Close } from "../assets/icons/close.svg";
import { ReactComponent as Check } from "../assets/icons/check.svg";

function TicketItem() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState("");
  const [networkId, setNetworkId] = useState();
  const [eventContract, setEventContract] = useState();
  const [copy, setCopy] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [ticket, setTicket] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState();
  const [listing, setListing] = useState();
  const [lister, setLister] = useState();
  const [loadingState, setLoadingState] = useState(false);

  const params = useParams();
  const location = useLocation();
  const componentMounted = useRef(true);

  useEffect(async () => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const eventContract = new web3.eth.Contract(
      Event.abi,
      Event.networks[networkId].address
    );
    setWeb3(web3);
    setAccount(accounts[0]);
    setNetworkId(networkId);
    setEventContract(eventContract);

    let status;
    let payload = { address: [] };
    const listingData = await eventContract.methods.fetchMarketItems().call();

    let sortListing = [...listingData];

    listingData.map(async (i) => {
      payload.address.push(i.seller);
    });

    console.log(payload);
    sortListing.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    axios
      .post(`${API_URL}/accountsByAddress`, payload)
      .then((user) => {
        console.log(user.data);
        setLister(user.data);
      })
      .catch((err) => console.log(err));

    console.log(listingData);

    const data = await eventContract.methods.fetchTicket(params.tokenId).call();
    const ticketUri = await eventContract.methods.uri(params.tokenId).call();
    const meta = await axios.get(ticketUri);
    console.log(status, { data: data, meta: meta, listingData: listingData });
    let item = {
      // itemId: data.itemId,
      tokenId: data.tokenId,
      seller: data.seller,
      owner: data.owner,
      minter: data.minter,
      image: meta.data.image,
      name: meta.data.name,
      link: meta.data.link,
      price: data.price,
      supply: data.supply,
      description: meta.data.description,
      location: meta.data.location,
      startDate: meta.data.startDate,
      endDate: meta.data.endDate,
      startTime: meta.data.startTime,
      endTime: meta.data.endTime,
    };

    await axios
      .get(`${API_URL}/event/${params.tokenId}`)
      .then((response) => {
        // let data = [];
        // for (let i = 0; i < 10; i++) {
        //   data.push(response.data.reverse());
        // }
        setHistory(response.data.reverse());
      })
      .catch((err) => console.log(err));

    await axios
      .get(`${API_URL}/ticket/${params.tokenId}`)
      .then((user) => {
        item.organizedName =
          item.minter === accounts[0] ? "you" : user.data.name;
        item.organizedAddress = user.data.address;
      })
      .catch((err) => console.log(err));

    if (item.owner.length === 1) {
      await axios
        .get(`${API_URL}/account/${item.owner}`)
        .then((user) => {
          if (user)
            item.ownerName =
              item.owner === accounts[0] ? "you" : user.data.name;
          else item.ownerName = item.owner.slice(2, 9).toUpperCase();
        })
        .catch((err) => console.log(err));

      console.log(item, accounts[0]);
    }

    if (componentMounted.current) {
      setLoadingState(true);
      setStatus(status);
      setTicket(item);
      setListing(sortListing);
    }
    return () => {
      componentMounted.current = false;
    };
  }, []);

  const copyURL = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopy(true);
    setButtonDisabled(true);
    setTimeout(() => {
      setCopy(false);
      setButtonDisabled(false);
    }, 2000);
  };

  // const buyTicket = async () => {
  //   const web3 = new Web3(window.ethereum);
  //   const networkId = await web3.eth.net.getId();
  //   const accounts = await web3.eth.getAccounts();

  //   const marketContract = new web3.eth.Contract(
  //     Market.abi,
  //     Market.networks[networkId].address
  //   );
  //   let transaction = await marketContract.methods
  //     .createMarketSale(Ticket.networks[networkId].address, params.itemId)
  //     .send({ from: accounts[0] });
  //   console.log(transaction);
  // };

  return (
    <>
      {!loadingState ? (
        <div className="h-full w-full flex justify-center items-center">
          <Loading loading={loadingState} />
        </div>
      ) : (
        <div className="h-auto w-full p-10 pb-32 bg-background">
          <div className="h-full mx-28 text-white">
            <div className="h-full w-full flex space-x-5">
              <div className="w-3/12 space-y-5">
                <div className="h-80 w-full rounded-xl bg-input">
                  <img
                    src={ticket.image}
                    alt=""
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
                <div className="h-fit w-full flex justify-between items-center p-3 rounded-lg bg-input">
                  <p>Token ID</p>
                  <p>{params.tokenId}</p>
                </div>
                {status === "Created" && (
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
                {status === "Listed" && (
                  <div className="h-fit w-full p-3 space-y-3 rounded-lg bg-input">
                    <div className="flex items-center space-x-3">
                      <Price />
                      <p>Price</p>
                    </div>
                    <div className="flex space-x-5">
                      <BNB />
                      <p className="text-4xl font-bold">{ticket.price} BNB</p>
                    </div>
                    <button
                      className="h-11 w-full flex justify-center items-center rounded-lg font-bold text-black bg-primary"
                      // onClick={() => setShowCheckoutModal(true)}
                    >
                      Buy for {ticket.price} BNB
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full pr-40 space-y-5">
                <div className="w-full space-y-1">
                  <div className="w-full flex justify-between items-center">
                    <p className="text-3xl">{ticket.name}</p>
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
                  <div className="flex text-sm space-x-1">
                    <p className="text-text">Organized by</p>
                    <a href={ticket.organizedAddress} className="text-primary">
                      {ticket.organizedName}
                    </a>
                  </div>
                  <div className="flex text-sm space-x-5">
                    <div className="inline-flex space-x-1">
                      <p className="text-text">Owned by</p>
                      <a href={ticket.owner}>{ticket.ownerName}</a>
                    </div>
                    {/* <div className="inline-flex space-x-1">
                      <p className="text-text">Supply</p>
                      <p>{ticket.supply}</p>
                      <p className="text-text">total</p>
                    </div> */}
                  </div>
                </div>
                <div className="h-fit w-full py-5 pl-5 pr-3 rounded-lg bg-input">
                  <div className="h-full max-h-72 overflow-auto">
                    <div className="sticky top-0 w-full pb-5 flex items-center space-x-3 bg-input">
                      <Description />
                      <p>Description</p>
                    </div>
                    <div className="pr-3 text-text">{ticket.description}</div>
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
                {/* <div className="h-fit w-full rounded-lg bg-input">
                  <div className="flex items-center p-5 space-x-3">
                    <Price />
                    <p>Listings</p>
                  </div>
                  <div className="rounded-b-lg divider-x-b">
                    <div className="grid grid-cols-5 pl-5 py-1 bg-black bg-opacity-20">
                      <p>Unit Price</p>
                      <p>USD Unit Price</p>
                      <p>Quantity</p>
                      <p>From</p>
                    </div>
                    {listing && (
                      <div
                        className={`${
                          listing.length > 5 && "overflow-auto"
                        } h-full max-h-60`}
                      >
                        {listing.map((listing, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-5 divider-x-b pl-5 py-3 text-white"
                          >
                            <div className="flex space-x-1">
                              <p className="text-text">{listing.price}</p>
                            </div>
                            <div className="flex space-x-1">
                              <p className="text-text">{history.price}</p>
                            </div>
                            <div className="flex space-x-1">
                              <p className="text-text">{listing.quantity}</p>
                            </div>
                            {listing.seller ? (
                              <a
                                href={listing.seller}
                                className="flex space-x-1 text-primary"
                              >
                                <p>
                                  {lister.filter(
                                    (user) => user.address === listing.seller
                                  ).length > 0
                                    ? lister.filter(
                                        (user) =>
                                          user.address === listing.seller
                                      )[0].name
                                    : listing.seller.slice(2, 9).toUpperCase()}
                                </p>
                              </a>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        ))}
                        <div className="w-full divider-x-b"></div>
                      </div>
                    )}
                  </div>
                </div> */}
                <div className="h-fit w-full rounded-lg bg-input">
                  <div className="flex items-center p-5 space-x-3">
                    <History />
                    <p>History</p>
                  </div>
                  <div className="rounded-b-lg divider-x-b">
                    <div className="grid grid-cols-6 pl-5 py-1 bg-black bg-opacity-20">
                      <p>Event</p>
                      <p>Unit Price</p>
                      <p>Quantity</p>
                      <p>From</p>
                      <p>To</p>
                      <p>Date</p>
                    </div>
                    <div
                      className={`${
                        history.length > 5 && "overflow-auto"
                      } h-full max-h-60`}
                    >
                      {history.map((history, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-6 divider-x-b pl-5 py-3 text-white"
                        >
                          <div className="flex space-x-1">
                            <p className="text-text">{history.eventType}</p>
                          </div>
                          <div className="flex space-x-1">
                            <p className="text-text">{history.price}</p>
                          </div>
                          <div className="flex space-x-1">
                            <p className="text-text">{history.quantity}</p>
                          </div>
                          {history.fromAccount ? (
                            <a
                              href={history.fromAccount.address}
                              className="flex space-x-1 text-primary"
                            >
                              <p>{history.fromAccount.name}</p>
                            </a>
                          ) : (
                            <div></div>
                          )}
                          {history.toAccount ? (
                            <a
                              href={history.toAccount.address}
                              className="flex space-x-1 text-primary"
                            >
                              <p>{history.toAccount.name}</p>
                            </a>
                          ) : (
                            <div></div>
                          )}
                          <a
                            href={`https://testnet.bscscan.com/tx/${history.transaction}`}
                            target="_blank"
                            className={`${
                              history.transaction && "text-primary"
                            } w-fit flex space-x-1 text-text`}
                            data-tip={formatter.dateConverter(
                              history.eventTimestamp
                            )}
                          >
                            <p>
                              {formatter.timeConverter(history.eventTimestamp)}
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
                      <div className="w-full divider-x-b"></div>
                    </div>
                  </div>
                </div>
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
                            <span className="h-24 w-16 rounded-lg bg-white"></span>
                            <div className="space-y-3">
                              <p>Cat Radio</p>
                              <p className="text-xl">LEO presents Cat Expo</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-5">
                            <BNB className="h-6" />
                            <p className="text-xl">1.0 BNB</p>
                          </div>
                        </div>
                      </div>
                      {/*footer*/}
                      <div className="flex items-center justify-end p-6 space-x-5 border-t border-solid border-white">
                        <button
                          className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
                          type="button"
                          onClick={() => setShowCheckoutModal(false)}
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
          </div>
        </div>
      )}
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
