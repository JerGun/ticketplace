import { React, useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import Ticket from "../../contracts/Ticket.json";
import Market from "../../contracts/Market.json";
import QueryNavLink from "../QueryNavLink";

import { ReactComponent as Info } from "../../assets/icons/info.svg";

function Owned() {
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
      Ticket.abi,
      Ticket.networks[networkId].address
    );
    const marketContract = new web3.eth.Contract(
      Market.abi,
      Market.networks[networkId].address
    );
    const data = await marketContract.methods
      .fetchItemsCreated(accounts[0])
      .call();
      const sender = await marketContract.methods
      .inspectSender()
      .call();
    console.log(data, sender);
    let payload = { tokenList: [] };
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await ticketContract.methods
          .tokenURI(i.tokenId)
          .call();
        const meta = await axios.get(tokenUri);
        let item = {
          price: i.price.toString(),
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
            <QueryNavLink
              to={`/tickets/${ticket.tokenId}`}
              key={i}
              className="relative h-fit w-full p-3 pb-10 space-y-3 rounded-lg shadow-lg float-right bg-modal-button"
            >
              <div className="h-72 w-full rounded-lg">
                <img
                  src={ticket.image}
                  alt=""
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
              <div className="w-full flex flex-col items-start">
                <div className="w-full flex justify-between items-center text-left">
                  <p className="w-10/12 truncate">{ticket.name}</p>
                  <button
                    className="absolute z-20 p-3 right-0"
                    // onClick={() => setShowCheckoutModal(true)}
                  >
                    <Info />
                  </button>
                </div>
                <p className="text-lg">{ticket.price} BNB</p>
              </div>
              <button className="absolute bottom-5 right-5 z-10 text-primary">
                {/* <Cart className="h-7 w-7" /> */}
              </button>
            </QueryNavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Owned;
