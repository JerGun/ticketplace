import { React, useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  fetchCreatedEvents,
  fetchCreatedTickets,
  fetchOwnedTickets,
  fetchTicketsInEvent,
  getUri,
} from "../../services/Web3";

import { ReactComponent as More } from "../../assets/icons/more.svg";
import { ReactComponent as Location } from "../../assets/icons/location.svg";

function Owned() {
  const [events, setEvents] = useState([""]);
  const [loadingState, setLoadingState] = useState(false);

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

  if (loadingState && events.length === 0)
    return (
      <div className="h-64 w-full mt-5 border-2 rounded-lg flex items-center justify-center border-input">
        <h1 className="py-10 px-20 text-3xl">No items to display</h1>
      </div>
    );
  return (
    <div className="w-full flex justify-center py-5">
      <div className="h-auto w-full grid grid-cols-2 gap-5 pb-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                  </div>
                </div>
                <div className="px-3 py-2 flex items-center text-text">
                  <button className="scale-75 hover:text-white">
                    <More />
                  </button>
                </div>
              </div>
            ))
          : events.map((event, i) => (
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
    </div>
  );
}
export default Owned;
