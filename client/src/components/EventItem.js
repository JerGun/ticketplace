import { React, Fragment, useState, useEffect, useRef } from "react";
import Web3 from "web3";
import axios from "axios";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import QueryNavLink from "./QueryNavLink";
import Event from "../contracts/Event.json";
import { API_URL } from "../config";
import Loading from "./Loading";
import { useParams } from "react-router-dom";

import { ReactComponent as Cart } from "../assets/icons/cart.svg";
import { ReactComponent as Down } from "../assets/icons/down.svg";
import { ReactComponent as Close } from "../assets/icons/close.svg";
import { ReactComponent as BNB } from "../assets/icons/bnb.svg";
import { ReactComponent as Edit } from "../assets/icons/edit.svg";
import { ReactComponent as Calendar } from "../assets/icons/calendar.svg";
import { ReactComponent as External } from "../assets/icons/external.svg";
import { ReactComponent as Location } from "../assets/icons/location.svg";
import { ReactComponent as Ticket } from "../assets/icons/ticket.svg";

const listOption = [
  { title: "Recently Listed", value: "recently" },
  { title: "Oldest", value: "oldest" },
  { title: "Price: High to Low", value: "high" },
  { title: "Price: Low to High", value: "low" },
];

function EventItem() {
  const [sortBy, setSortBy] = useState(listOption[0]);
  const [tickets, setTickets] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [event, setEvent] = useState();

  const params = useParams();
  const componentMounted = useRef(true);

  useEffect(async () => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const eventContract = new web3.eth.Contract(
      Event.abi,
      Event.networks[networkId].address
    );

    const eventUri = await eventContract.methods.uri(params.eventId).call();
    const eventMeta = await axios.get(eventUri);
    console.log(eventMeta);
    let eventItem = {
      image: eventMeta.data.image,
      name: eventMeta.data.name,
      link: eventMeta.data.link,
      description: eventMeta.data.description,
      location: eventMeta.data.location,
      startDate: eventMeta.data.startDate,
      endDate: eventMeta.data.endDate,
      startTime: eventMeta.data.startTime,
      endTime: eventMeta.data.endTime,
    };

    const ticketsData = await eventContract.methods
      .fetchTicketsInEvent(params.eventId)
      .call();
    console.log(ticketsData);
    let payload = { tokenList: [] };
    const items = await Promise.all(
      ticketsData.map(async (i) => {
        const tokenUri = await eventContract.methods.uri(i.tokenId).call();
        const meta = await axios.get(tokenUri);
        let item = {
          //   price: i.price.toString(),
          itemId: i.itemId,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          link: meta.data.link,
          description: meta.data.description,
        };
        payload.tokenList.push(i.tokenId);
        return item;
      })
    );
    console.log(items);

    if (componentMounted.current) {
      setTickets(items);
      setEvent(eventItem);
      setLoadingState(true);
    }

    return () => {
      componentMounted.current = false;
    };
  }, []);

  const handleChange = (event) => {
    let { value } = event.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : null;
  };

  return (
    <>
      {!loadingState ? (
        <div className="h-full w-full flex justify-center items-center">
          <Loading loading={loadingState} />
        </div>
      ) : (
        <>
          <div className="sticky w-full flex justify-center text-white shadow-lg">
            <div className="absolute h-full w-full pb-1 opacity-50">
              <img
                src={event.image}
                alt=""
                className=" h-full w-full object-cover blur-sm"
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
                  <button
                    data-tip="Share"
                    className="h-11 w-11 flex justify-center items-center rounded-lg bg-hover"
                    // onClick={copyURL}
                  >
                    <Edit className="scale-50" />
                  </button>
                  <a
                    data-tip="External Link"
                    target={"_blank"}
                    href={event.link}
                    className="h-11 w-11 flex justify-center items-center rounded-lg bg-hover"
                  >
                    <External />
                  </a>
                </div>
                <div className="w-fit space-y-3 text-left">
                  <div>
                    <div className="flex space-x-1">
                      <p>Created by</p>
                      <p className="text-primary">{event.name}</p>
                    </div>
                    <p className="text-4xl">{event.name}</p>
                  </div>
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
                    <p>{tickets.length} {tickets.length < 2 ? "ticket" : "tickets"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-full w-full flex justify-end text-white bg-background">
            <div className="h-full w-2/12 p-5 space-y-10 left-0 flex flex-col items-center shadow-lg bg-modal-button">
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
                                    className={
                                      active ? "text-white" : "text-input"
                                    }
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
            <div className="h-full w-10/12 p-10">
              {tickets.length === 0 ? (
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
                      <QueryNavLink to={`/ticket/${ticket.tokenId}`}>
                        <div className="p-3 space-y-3 shadow-lg">
                          <div className="h-72 w-full">
                            <img
                              src={ticket.image}
                              alt=""
                              className="h-full w-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="w-full flex flex-col items-start">
                            <p className="w-10/12 truncate">{ticket.name}</p>
                            <p className="text-lg">{ticket.price} BNB</p>
                          </div>
                        </div>
                      </QueryNavLink>
                      <div className="px-3 py-2 flex items-center text-text">
                        <button className="py-2 text-primary">
                          <Cart />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                      </div>
                    </div>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition>
          </div>{" "}
        </>
      )}
    </>
  );
}

export default EventItem;
