import { React, useState } from "react";
import Ticket from "../contracts/Ticket.json";
import Market from "../contracts/NFTMarket.json";
import Web3 from "web3";
import { create as ipfsHttpClient } from "ipfs-http-client";

import { ReactComponent as Photo } from "../assets/icons/photo.svg";
import { ReactComponent as Calendar } from "../assets/icons/calendar.svg";
import { ReactComponent as Clock } from "../assets/icons/clock.svg";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function CreateTicket({ account }) {
  const [image, setImage] = useState({ preview: "", raw: "" });
  const [formInput, setFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [fileUrl, setFileUrl] = useState(null);
  const [supply, setSupply] = useState();

  const handleChange = (e) => {};

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
      setImage({
        preview: url,
        raw: e.target.files[0],
      });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const removeImage = () => {
    setImage({ preview: "", raw: "" });
  };

  const handleNumberChange = (e) => {
    let { value } = e.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : null;
    setSupply(value);
  };

  // const handleSubmit = async (e) => {
  //   const web3 = new Web3(window.ethereum);
  //   const networkId = await web3.eth.net.getId();
  //   const contract = new web3.eth.Contract(
  //     Market.abi,
  //     Market.networks[networkId].address
  //   );

  //   console.log(account);
  //   e.preventDefault();

  //   await contract.methods.listToken(account, 1, 100).send({ from: account });
  //   const response = await contract.methods.listToken().call();
  //   console.log(response);
  // };

  const createTicket = async () => {
    console.log("pass");

    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  async function createSale(url) {
    console.log("pass2");
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    let contract = new web3.eth.Contract(
      Ticket.abi,
      Ticket.networks[networkId].address
    );

    let transaction = await contract.methods
      .createToken(url)
      .send({ from: account });
    console.log(transaction);
    let event = transaction.events;
    let value = event.Transfer.returnValues;
    let tokenId = value.tokenId;
    const price = formInput.price;

    contract = new web3.eth.Contract(
      Market.abi,
      Market.networks[networkId].address
    );
    // let listingPrice = await contract.getListingPrice();
    // listingPrice = listingPrice.toString();

    transaction = await contract.methods
      .createMarketItem(
        Ticket.networks[networkId].address,
        tokenId,
        price
        // { value: listingPrice }
      )
      .send({ from: account });
  }

  return (
    <div className="h-fit w-full p-10 bg-background">
      <div className="h-full mx-28 text-white">
        <p className="text-4xl font-bold py-5">Create new ticket</p>
        <div className="h-full w-full flex space-x-20">
          <div className="h-full w-3/12">
            <p>Image</p>
            <p className="text-sm text-sub-text">
              File types supported: JPG, PNG
            </p>
            <div className="h-96 w-10/12 mt-3 p-1 rounded-2xl border-dashed border-2">
              <div className="relative h-full w-full">
                <label
                  htmlFor="upload-button"
                  className="absolute h-full w-full hover:cursor-pointer"
                >
                  {image.preview ? (
                    <div className="relative h-full w-full">
                      <div className="absolute h-full w-full z-20 flex justify-center items-center opacity-0 hover:bg-black hover:bg-opacity-50 hover:opacity-100">
                        <Photo />
                      </div>
                      <img
                        src={image.preview}
                        alt="dummy"
                        className="h-full w-full object-cover rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="absolute h-full w-full z-10 flex justify-center items-center rounded-xl hover:bg-black hover:bg-opacity-50">
                      <Photo />
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="upload-button"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
          <div className="w-1/2 space-y-10">
            <div className="space-y-3">
              <p>Ticket name</p>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="text"
                  placeholder="Ticket name"
                  className="h-full w-full bg-transparent"
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      name: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p>External Link</p>
                <p className="text-sm text-sub-text">
                  You are welcome to link to your own webpage with more details.
                </p>
              </div>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="text"
                  placeholder="https://yoursite.com/ticket/details"
                  className="h-full w-full bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-3">
              <p>Description</p>
              <div className="h-fit px-3 py-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <textarea
                  type="text"
                  rows="8"
                  placeholder="Ticket detailed description."
                  className="h-full w-full bg-transparent"
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              <p>Location</p>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="text"
                  placeholder="Location"
                  className="h-full w-full bg-transparent"
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      price: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="w-full flex ">
              <div className="w-full space-y-3">
                <div className="flex justify-between pr-5">
                  <div className="flex items-center space-x-3">
                    <Calendar />
                    <p>Event Date</p>
                  </div>
                  <p>12/12/2022</p>
                </div>
                <div className="flex justify-between pr-5">
                  <div className="flex items-center space-x-3">
                    <Clock />
                    <p>Event Time</p>
                  </div>
                  <div className="flex space-x-2">
                    <p>15:00</p>
                    <p>-</p>
                    <p>18:00</p>
                  </div>
                </div>
              </div>
              <span className="divider-y"></span>
              <div className="w-full pl-5">
                <div className="flex justify-between pr-5">
                  <div className="flex items-center space-x-3">
                    <Calendar />
                    <p>Expired Date</p>
                  </div>
                  <p>13/12/2022</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p>Supply</p>
                <p className="text-sm text-sub-text">
                  The number of copies that can be minted.
                </p>
              </div>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="number"
                  placeholder="1"
                  min="1"
                  value={supply}
                  onChange={handleChange}
                  className="h-full w-full bg-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              onClick={createTicket}
              className="h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
