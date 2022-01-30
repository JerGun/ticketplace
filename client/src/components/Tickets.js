import { React, Fragment, useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { Listbox, Transition } from "@headlessui/react";
import QueryNavLink from "./QueryNavLink";
import Ticket from "../contracts/Ticket.json";
import Market from "../contracts/NFTMarket.json";

import { ReactComponent as Info } from "../assets/icons/info.svg";
import { ReactComponent as Cart } from "../assets/icons/cart.svg";
import { ReactComponent as Down } from "../assets/icons/down.svg";

const listOption = [
  { title: "Recently Listed", value: "recently" },
  { title: "Oldest", value: "oldest" },
  { title: "Price: High to Low", value: "high" },
  { title: "Price: Low to High", value: "low" },
];

function Tickets() {
  const [sortBy, setSortBy] = useState(listOption[0]);
  const [tickets, setTickets] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const ticketContract = new web3.eth.Contract(
      Ticket.abi,
      Ticket.networks[networkId].address
    );
    const marketContract = new web3.eth.Contract(
      Market.abi,
      Market.networks[networkId].address
    );
    const data = await marketContract.methods.fetchMarketItems().call();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await ticketContract.methods
          .tokenURI(i.tokenId)
          .call();
        const meta = await axios.get(tokenUri);
        let price = i.price.toString();
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setTickets(items);
    setLoadingState("loaded");
  };
  const handleChange = (event) => {
    let { value } = event.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : null;
  };

  return (
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
                                    } group flex rounded-xl items-center space-x-5 w-full px-5 py-2 text-lg`}
                        >
                          <div className="flex flex-col items-start">
                            <p className={active ? "text-white" : "text-input"}>
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
        <div className="h-full w-full space-x-10 flex flex-wrap justify-center">
          {tickets.map((ticket, i) => (
            <QueryNavLink
              to={`/tickets/${i}`}
              key={i}
              className="relative h-fit w-56 p-3 pb-10 space-y-3 rounded-lg shadow-lg float-right bg-modal-button"
            >
              <div className="h-72 w-full rounded-lg">
                <img
                  src={ticket.image}
                  alt=""
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
              <div className="w-full flex flex-col items-start">
                <p className="text-text">Cat Radio</p>
                <div className="w-full flex justify-between items-center text-left">
                  <p className="w-10/12 truncate">{ticket.name}</p>
                  <Info />
                </div>
                <p className="text-lg">{ticket.price} BNB</p>
              </div>
              <button className="absolute bottom-5 right-5 text-primary">
                <Cart className="h-7 w-7" />
              </button>
            </QueryNavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tickets;
