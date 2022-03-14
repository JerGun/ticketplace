import React, { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import axios from "axios";
import Ticket from "../contracts/Ticket.json";
import { API_URL } from "../config";
import formatter from "../formatter";
import { useNavigate, useParams } from "react-router-dom";

function ListTicket() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState("");
  const [networkId, setNetworkId] = useState();
  const [ticketContract, setTicketContract] = useState();
  const [formInput, setFormInput] = useState({
    quantity: "",
    price: "",
  });
  const [ticket, setTicket] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
  const componentMounted = useRef(true);

  useEffect(async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const ticketContract = new web3.eth.Contract(
        Ticket.abi,
        Ticket.networks[networkId].address
      );
      setWeb3(web3);
      setAccount(accounts[0]);
      setNetworkId(networkId);
      setTicketContract(ticketContract);

      const data = await ticketContract.methods
        .fetchItem(params.tokenId)
        .call();
      const tokenUri = await ticketContract.methods.uri(params.tokenId).call();
      const meta = await axios.get(tokenUri);
      console.log(data);
      let item = {
        itemId: data.itemId,
        tokenId: data.tokenId,
        seller: data.seller,
        owner: data.owner,
        minter: data.minter,
        image: meta.data.image,
        name: meta.data.name,
        link: meta.data.link,
        price: data.price,
        quantity: data.quantity,
        supply: data.supply,
        description: meta.data.description,
        location: meta.data.location,
      };

      if (componentMounted.current) {
        setTicket(item);
        setLoadingState(true);
      }
      return () => {
        componentMounted.current = false;
      };
    }
  }, []);

  const handleQuantityChange = (e) => {
    let { value } = e.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : "";
    setFormInput({
      ...formInput,
      quantity: value,
    });
  };

  const handlePriceChange = (e) => {
    let { value } = e.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : "";
    setFormInput({
      ...formInput,
      price: value,
    });
  };

  const handleSubmit = () => {
    const { price, quantity } = formInput;
    if (!price || !quantity) return;
    createMarketItem(params.tokenId, price, quantity)
      .then((result) => {
        navigate(`/ticket/${params.tokenId}`);
      })
      .catch((err) => console.log(err));
  };

  const createMarketItem = async (tokenId, price, quantity) => {
    let transaction = await ticketContract.methods
      .createMarketItem(tokenId, price, quantity)
      .send({ from: account });
    let block = await web3.eth.getBlock(transaction.blockNumber);
    let returnValues = transaction.events.MarketItemCreated.returnValues;
    console.log(transaction);

    let payload = {
      tokenId: returnValues.tokenId,
      eventTimestamp: block.timestamp,
      eventType: "Listed",
      isMint: false,
      fromAccount: { address: returnValues.seller },
      price: price,
      quantity: quantity,
      transaction: transaction.transactionHash,
    };

    await axios
      .post(`${API_URL}/event`, payload)
      .catch((err) => console.log(err));
  };

  return (
    <div className="h-fit w-full p-10 bg-background">
      <div className="h-full mx-28 text-white">
        <p className="text-4xl font-bold py-5">List item forr sale</p>
        <div className="h-full w-full flex space-x-20">
          <div className="h-full w-3/12">
            <p>Preview</p>
            <div className="h-96 w-10/12 mt-3 p-1 rounded-2xl">
              <div className="relative h-fit w-full p-3 space-y-3 rounded-lg shadow-lg float-right bg-modal-button">
                <div className="h-72 w-full rounded-lg">
                  <img
                    src={ticket.image}
                    alt=""
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
                <div className="w-full flex flex-col items-start">
                  <p className="text-text">{formInput.quantity} total</p>
                  <p className="w-9/12 truncate">{ticket.name}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2 space-y-10">
            <div className="space-y-3">
              <div className="space-y-3">
                <p>Quantity</p>
                <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    max={ticket.quantity}
                    value={formInput.quantity}
                    className="price h-full w-full bg-transparent"
                    onChange={handleQuantityChange}
                  />
                </div>
              </div>
              <p className="text-right text-sm text-sub-text">
                {ticket.quantity} available
              </p>
            </div>
            <div className="space-y-3">
              <p>Price</p>
              <div className="h-11 px-3 flex items-center space-x-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="number"
                  placeholder="1"
                  min="1"
                  value={formInput.price}
                  className="price h-full w-full bg-transparent"
                  onChange={handlePriceChange}
                />
                {formInput.price && <p>BNB</p>}
              </div>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
            >
              Complete listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListTicket;
