import React, { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import ReactTooltip from "react-tooltip";
import { API_URL } from "../../config";
import {
  fetchCreatedEvents,
  getUri,
  fetchCreatedTickets,
  fetchEvent,
  fetchMarketItem,
  fetchTicket,
} from "../../services/Web3";

import { ReactComponent as Down } from "../../assets/icons/down.svg";
import { ReactComponent as Search } from "../../assets/icons/search.svg";
import { ReactComponent as More } from "../../assets/icons/more.svg";
import { ReactComponent as Info } from "../../assets/icons/info.svg";
import { ReactComponent as Close } from "../../assets/icons/close.svg";

const listOption = [
  { title: "Recently Listed", value: "recently" },
  { title: "Oldest", value: "oldest" },
];

function Created({ itemType }) {
  const [tickets, setTickets] = useState();
  const [events, setEvents] = useState();
  const [loadingState, setLoadingState] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState();
  const [sortBy, setSortBy] = useState(listOption[0]);
  const [filter, setFilter] = useState({
    keyword: "",
    available: true,
    used: true,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = false;
  }, []);

  useEffect(() => {
    // if (itemType === "tickets") {
    //   loadTickets();
    //   tickets && setLoadingState(true);
    // } else {
    //   loadEvents();
    //   events && setLoadingState(true);
    // }
    loadTickets();
    tickets && setLoadingState(true);
    loadEvents();
  }, [tickets]);

  useEffect(() => {
    console.log(itemType);
  }, [itemType]);

  const loadTickets = async () => {
    const data = await fetchCreatedTickets();

    let items = await Promise.all(
      data.map(async (i) => {
        const ticketInMarket = await fetchMarketItem(i.tokenId);
        const ticket = await fetchTicket(i.tokenId);
        const ticketUri = await getUri(i.tokenId);
        const ticketMeta = await axios.get(ticketUri);
        const event = await fetchEvent(ticket.eventTokenId);
        const eventUri = await getUri(ticket.eventTokenId);
        const eventMeta = await axios.get(eventUri);
        let item = {
          eventId: ticket.eventTokenId,
          eventName: eventMeta.data.name,
          eventOwner: event.owner,
          itemId: ticketInMarket.itemId,
          tokenId: i.tokenId,
          owner: i.owner,
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

    items = items.reverse();

    if (filter.available && filter.used) {
      null;
    } else {
      if (filter.available) {
        items = items.filter((i) => i.active);
      }
      if (filter.used) {
        items = items.filter((i) => !i.active);
      }
    }
    if (filter.keyword) {
      const temp = items.filter((i) =>
        new RegExp(filter.keyword, "i").test(i.name)
      );
      items = temp;
    }
    if (sortBy.title === "Oldest") {
      items = items.reverse();
    }

    setTickets(items);
  };

  const loadEvents = async () => {
    const data = await fetchCreatedEvents();

    let items = await Promise.all(
      data.map(async (i) => {
        const eventUri = await getUri(i.tokenId);
        const eventMeta = await axios.get(eventUri);
        let item = {
          tokenId: i.tokenId,
          owner: i.owner,
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
        return item;
      })
    );

    items = items.reverse();

    if (filter.keyword) {
      const temp = items.filter((i) =>
        new RegExp(filter.keyword, "i").test(i.name)
      );
      items = temp;
    }
    if (sortBy.title === "Oldest") {
      items = items.reverse();
    }

    setEvents(items);
  };

  const resetFilter = () => {
    setFilter({
      ...filter,
      available: true,
      used: true,
    });
    setSortBy(listOption[0]);
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
    <>
      <div className="h-full w-full flex text-white bg-background">
        <div className="sticky top-0 h-screen w-2/12 p-5 space-y-10 shadow-lg bg-modal-button">
          {itemType === "tickets" && (
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
                        available: !filter.available,
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
                        used: !filter.used,
                      });
                    }}
                  />
                </div>
                <span className="ml-2 select-none">Used</span>
              </label>
            </div>
          )}
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
              placeholder={
                itemType === "tickets" ? "Search tickets" : "Search events"
              }
              value={filter.keyword}
              onChange={(e) => {
                console.log(e.target.value);
                setFilter({ ...filter, keyword: e.target.value });
              }}
              className="h-full w-full bg-transparent"
            />
          </div>
          {loadingState && tickets.length === 0 && (
            <div className="h-64 w-full border-2 rounded-lg flex items-center justify-center border-input">
              <h1 className="py-10 px-20 text-3xl">No items to display</h1>
            </div>
          )}
          {loadingState && tickets.length === 0 ? (
            <span></span>
          ) : (
            tickets && (
              <p>
                {tickets.length} {tickets.length > 1 ? "items" : "item"}
              </p>
            )
          )}
          {tickets && <div className="h-auto w-full grid grid-cols-2 gap-5 pb-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                      <div className="w-fit flex space-x-1"></div>
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
                          <p className="w-10/12 truncate text-text">
                            {ticket.eventName}
                          </p>
                          <p className="w-10/12 truncate">{ticket.name}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="h-12 px-3 py-2 flex items-center space-x-5 justify-between text-text">
                      <div className="flex items-center space-x-2">
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
                      </div>
                    </div>
                  </div>
                ))}
          </div>}
          {events && <div className="h-auto w-full grid grid-cols-2 gap-5 pb-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {loadingState
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
                      <div className="w-fit flex space-x-1"></div>
                    </div>
                  </div>
                ))
              : <div></div>
              // tickets.map((ticket, i) => (
              //     <div
              //       key={i}
              //       className="h-fit w-full rounded-lg shadow-lg float-right bg-modal-button"
              //     >
              //       <Link
              //         to={`/event/${ticket.eventId}/ticket/${ticket.tokenId}`}
              //       >
              //         <div className="p-3 space-y-3 shadow-lg">
              //           <div className="h-72 w-full">
              //             <img
              //               src={ticket.image}
              //               alt=""
              //               className="h-full w-full object-cover rounded-lg"
              //             />
              //           </div>
              //           <div className="w-full flex flex-col items-start">
              //             <p className="text-sm text-primary">
              //               {ticket.startDate} - {ticket.endDate}
              //             </p>
              //             <p className="w-10/12 truncate text-text">
              //               {ticket.eventName}
              //             </p>
              //             <p className="w-10/12 truncate">{ticket.name}</p>
              //           </div>
              //         </div>
              //       </Link>
              //       <div className="h-12 px-3 py-2 flex items-center space-x-5 justify-between text-text">
              //         <div className="flex items-center space-x-2">
              //           <span className="relative flex h-2 w-2">
              //             <span
              //               className={`${
              //                 ticket.active ? "bg-green-500" : "bg-red-500"
              //               } animate-ping absolute h-2 w-2 rounded-full opacity-75`}
              //             ></span>
              //             <span
              //               className={`${
              //                 ticket.active ? "bg-green-500" : "bg-red-500"
              //               } h-2 w-2 rounded-full`}
              //             ></span>
              //           </span>
              //           <p className="w-full text-sm truncate">
              //             Token ID: {ticket.tokenId}
              //           </p>
              //         </div>
              //         <div className="flex space-x-1">
              //           <button
              //             className="p-2 text-white"
              //             onClick={() => {
              //               getMinter(ticket);
              //               setShowDetailModal(true);
              //             }}
              //           >
              //             <Info />
              //           </button>
              //         </div>
              //       </div>
              //     </div>
              //   ))
                }
          </div>}
        </div>
      </div>
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
                        <div className="w-fit space-y-1">
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
export default Created;
