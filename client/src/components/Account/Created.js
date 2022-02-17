import { React, useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { Link } from "react-router-dom";
import Event from "../../contracts/Event.json";
import Loading from "../Loading";

import { ReactComponent as More } from "../../assets/icons/more.svg";
import { ReactComponent as Location } from "../../assets/icons/location.svg";

function Created() {
  const [events, setEvents] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const accounts = await web3.eth.getAccounts();
    const eventContract = new web3.eth.Contract(
      Event.abi,
      Event.networks[networkId].address
    );
    const data = await eventContract.methods
      .fetchCreatedEvents(accounts[0])
      .call();
    console.log(data);

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await eventContract.methods.uri(i.tokenId).call();
        const meta = await axios.get(tokenUri);
        const data2 = await eventContract.methods
          .fetchTicketsInEvent(i.tokenId)
          .call();
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
    setLoadingState(true);
  };

  if (loadingState && events.length === 0)
    return <h1 className="py-10 px-20 text-3xl">No assets created</h1>;
  return (
    <>
      {!loadingState ? (
        <div className="h-full w-full flex justify-center">
          <Loading loading={loadingState} />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="p-4">
            <div className="h-auto w-full grid grid-cols-2 gap-5 pb-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          </div>
        </div>
      )}
    </>
  );
}
export default Created;
