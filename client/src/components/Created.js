import { React, useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import Tickets from "../contracts/Ticket.json";
import QueryNavLink from "./QueryNavLink";
import formatter from "../formatter";

import { ReactComponent as More } from "../assets/icons/more.svg";

function Created() {
  const [tickets, setTickets] = useState([]);
  const [loadingState, setLoadingState] = useState();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const accounts = await web3.eth.getAccounts();
    const ticketContract = new web3.eth.Contract(
      Tickets.abi,
      Tickets.networks[networkId].address
    );
    const data = await ticketContract.methods
      .fetchCreatedItems(accounts[0])
      .call();
    console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await ticketContract.methods.uri(i.tokenId).call();
        const meta = await axios.get(tokenUri);
        console.log(meta);
        let item = {
          tokenId: i.tokenId,
          supply: i.supply,
          image: meta.data.image,
          name: meta.data.name,
          link: meta.data.link,
          startDate: formatter.formatDate(new Date(meta.data.startDate)),
          endDate: formatter.formatDate(new Date(meta.data.endDate)),
          description: meta.data.description,
        };
        return item;
      })
    );
    console.log(items);

    setTickets(items);
    setLoadingState("loaded");
  };

  if (loadingState === "loaded" && !tickets.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="h-auto w-full grid grid-cols-2 gap-5 pb-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {tickets.map((ticket, i) => (
            <div className="relative h-fit w-full rounded-lg shadow-lg float-right bg-modal-button">
              <QueryNavLink to={`/ticket/${ticket.tokenId}`} key={i}>
                <div className="p-3 space-y-3 shadow-lg">
                  <div className="h-72 w-full">
                    <img
                      src={ticket.image}
                      alt=""
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="w-full flex flex-col items-start">
                    <p className="text-sm text-text">{ticket.supply} total</p>
                    <p className="w-9/12 truncate">{ticket.name}</p>
                  </div>
                </div>
              </QueryNavLink>
              <div className="px-3 py-1 flex items-center text-text">
                <button className="scale-75 hover:text-white">
                  <More />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Created;
