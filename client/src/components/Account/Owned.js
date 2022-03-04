import { React, useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import {
  fetchCreatedEvents,
  fetchCreatedTickets,
  fetchOwnedTickets,
  fetchTicketsInEvent,
  getUri,
} from "../../services/Web3";

import { ReactComponent as More } from "../../assets/icons/more.svg";
import { ReactComponent as Location } from "../../assets/icons/location.svg";
import { ReactComponent as Down } from "../../assets/icons/down.svg";

const listOption = [
  { title: "Recently Listed", value: "recently" },
  { title: "Oldest", value: "oldest" },
  { title: "Price: High to Low", value: "high" },
  { title: "Price: Low to High", value: "low" },
];

function Owned() {
  const [events, setEvents] = useState([""]);
  const [loadingState, setLoadingState] = useState(false);
  const [sortBy, setSortBy] = useState(listOption[0]);
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
    loadTickets();
    if (isMounted) {
      setTimeout(() => {
        setLoadingState(true);
      }, 1000);
    }
  }, []);

  const loadTickets = async () => {
    const data = await fetchCreatedEvents();
    const test = await fetchCreatedTickets();
    const test2 = await fetchOwnedTickets(true);
    console.log(data, test, test2);

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await getUri(i.tokenId);
        const meta = await axios.get(tokenUri);
        const data2 = await fetchTicketsInEvent(i.tokenId);
        console.log(data2);
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
        };
        return item;
      })
    );
    console.log(items);

    setEvents(items);
  };

  return (
    <div className="w-full">
      {loadingState && events.length === 0 ? (
        <div className="h-64 w-full mt-5 border-2 rounded-lg flex items-center justify-center border-input">
          <h1 className="py-10 px-20 text-3xl">No items to display</h1>
        </div>
      ) : (
        <div className="h-full w-full flex justify-end text-white bg-background">
          <div className="sticky top-0 h-screen min-h-full w-2/12 p-5 space-y-10 shadow-lg bg-modal-button">
            <div className="w-full space-y-3">
              <p className="w-full text-xl font-bold">Items</p>
              <div className="flex space-x-5">
                <button
                  className={`${
                    filter.items ? "border-primary" : "border-transparent"
                  } h-11 w-fit px-5 rounded-lg bg-hover hover:bg-hover-light border-2`}
                  onClick={() => {
                    setFilter({ ...filter, items: true });
                  }}
                >
                  Events
                </button>
                <button
                  className={`${
                    !filter.items ? "border-primary" : "border-transparent"
                  } h-11 w-fit px-5 rounded-lg bg-hover hover:bg-hover-light border-2`}
                  onClick={() => {
                    setFilter({ ...filter, items: false });
                  }}
                >
                  Tickets
                </button>
              </div>
            </div>
            {!filter.items && (
              <div className="w-full space-y-3">
                <p className="w-full text-xl font-bold">Ticket Status</p>
                <label class="w-fit flex items-center hover:cursor-pointer">
                  <div className="h-5 w-5 flex items-center justify-center rounded-md border-2 border-white">
                    <input
                      type="checkbox"
                      class="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                      checked={filter.available}
                      onClick={() => {
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
                      class="h-3 w-3 appearance-none rounded-sm checked:bg-primary"
                      checked={filter.used}
                      onClick={() => {
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
          </div>
          <div className="h-full w-10/12 p-10">
            {events.length === 0 ? (
              <div className="h-64 w-full border-2 rounded-lg flex items-center justify-center border-input">
                <h1 className="py-10 px-20 text-3xl">No items to display</h1>
              </div>
            ) : (
              <div className="h-auto w-full grid grid-cols-2 gap-5 pb-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {events.map((event, i) => (
                  <div
                    key={i}
                    className="h-fit w-full rounded-lg shadow-lg float-right bg-modal-button"
                  >
                    <Link to={`/event/${event.tokenId}`}>
                      <div className="p-3 space-y-3 shadow-lg">
                        <div className="h-72 w-full">
                          <img
                            src={event.image}
                            alt=""
                            className="h-full w-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="w-full flex flex-col items-start space-y-1">
                          <p className="text-sm text-primary">
                            {event.startDate} - {event.endDate}
                          </p>
                          <p className="w-9/12 truncate">{event.name}</p>
                          <div className="w-9/12 flex items-center truncate space-x-1">
                            <Location className="h-4 w-4" />
                            <p>{event.location}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="px-3 py-2 flex items-center text-text">
                      <button className="scale-75 hover:text-white">
                        <More />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        // <div className="w-full flex justify-center py-5">
        //   <div className="h-auto w-full grid grid-cols-2 gap-5 pb-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        //     {!loadingState
        //       ? [...Array(5)].map((x, i) => (
        //           <div
        //             key={i}
        //             className="h-fit w-full rounded-lg shadow-lg animate-pulse bg-modal-button"
        //           >
        //             <div className="p-3 space-y-3 shadow-lg">
        //               <div className="h-72 w-full rounded-lg bg-hover bg-opacity-50"></div>
        //               <div className="h-18 w-full flex flex-col items-start space-y-3">
        //                 <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
        //                 <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
        //                 <div className="h-3 w-full rounded bg-hover bg-opacity-50"></div>
        //               </div>
        //             </div>
        //             <div className="px-3 py-2 flex items-center text-text">
        //               <button className="scale-75 hover:text-white">
        //                 <More />
        //               </button>
        //             </div>
        //           </div>
        //         ))
        //       : events.map((event, i) => (
        //           <div
        //             key={i}
        //             className="h-fit w-full rounded-lg shadow-lg float-right bg-modal-button"
        //           >
        //             <Link to={`/event/${event.tokenId}`}>
        //               <div className="p-3 space-y-3 shadow-lg">
        //                 <div className="h-72 w-full">
        //                   <img
        //                     src={event.image}
        //                     alt=""
        //                     className="h-full w-full object-cover rounded-lg"
        //                   />
        //                 </div>
        //                 <div className="w-full flex flex-col items-start space-y-1">
        //                   <p className="text-sm text-primary">
        //                     {event.startDate} - {event.endDate}
        //                   </p>
        //                   <p className="w-9/12 truncate">{event.name}</p>
        //                   <div className="w-9/12 flex items-center truncate space-x-1">
        //                     <Location className="h-4 w-4" />
        //                     <p>{event.location}</p>
        //                   </div>
        //                 </div>
        //               </div>
        //             </Link>
        //             <div className="px-3 py-2 flex items-center text-text">
        //               <button className="scale-75 hover:text-white">
        //                 <More />
        //               </button>
        //             </div>
        //           </div>
        //         ))}
        //   </div>
        // </div>
      )}
    </div>
  );
}
export default Owned;
