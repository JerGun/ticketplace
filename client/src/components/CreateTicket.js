import { React, useState } from "react";
import NFTMarket from "../contracts/NFTMarket.json";
import Web3 from "web3";

import { ReactComponent as Photo } from "../assets/icons/photo.svg";
import { ReactComponent as Calendar } from "../assets/icons/calendar.svg";
import { ReactComponent as Clock } from "../assets/icons/clock.svg";
import { ReactComponent as Close } from "../assets/icons/close.svg";

function CreateTicket({ account }) {
  const [image, setImage] = useState({ preview: "", raw: "" });
  const [newValue, setNewValue] = useState({});
  const [supply, setSupply] = useState();

  const handleChange = (e) => {};

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0],
      });
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

  const handleSubmit = async (e) => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const contract = new web3.eth.Contract(
      NFTMarket.abi,
      NFTMarket.networks[networkId].address
    );

    console.log(account);
    e.preventDefault();

    await contract.methods.listToken(account, 1, 100).send({ from: account });
    const response = await contract.methods.listToken().call();
    console.log(response);
  };

  return (
    <div className="h-fit w-full p-10 bg-background">
      <div className="h-full mx-28 text-white">
        <p className="text-4xl font-bold py-5">Create new ticket</p>
        <form onSubmit={handleSubmit} className="h-full w-full flex space-x-20">
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
              className="h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;
