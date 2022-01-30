import { React, useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import Ticket from "../contracts/Ticket.json";
import Market from "../contracts/NFTMarket.json";

function Owned() {
  const [tickets, setTickets] = useState([]);
  const [loadingState, setLoadingState] = useState();

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
    const data = await marketContract.methods.fetchMyNFTs().call();

    console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await ticketContract.tokenURI(i.tokenURI);
        const meta = await axios.get(tokenURI);
        let item = {
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
        };
        return item;
      })
    );
    setTickets(items);
    setLoadingState("loaded");
  };

  if (loadingState === "loaded" && !tickets.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {tickets.map((ticket, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={ticket.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {ticket.price} Eth
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Owned;
