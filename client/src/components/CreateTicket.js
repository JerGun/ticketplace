import React, { Fragment, useEffect, useState } from "react";
import Web3 from "web3";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Ticket from "../contracts/Ticket.json";
import Market from "../contracts/Market.json";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { enGB } from "date-fns/locale";
import { DateRangePicker, START_DATE, END_DATE } from "react-nice-dates";
import "react-nice-dates/build/style.css";

import { ReactComponent as Photo } from "../assets/icons/photo.svg";
import { ReactComponent as Calendar } from "../assets/icons/calendar.svg";
import { Listbox, Transition } from "@headlessui/react";
import CustomScrollbars from "./CustomScrollbars";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
const time = [
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

function CreateTicket() {
  const [account, setAccount] = useState("");
  const [image, setImage] = useState({ preview: "", raw: "" });
  const [formInput, setFormInput] = useState({
    name: "",
    link: "",
    description: "",
    location: "",
    price: "",
  });
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [startTime, setStartTime] = useState("Start Time");
  const [endTime, setEndTime] = useState("End Time");
  const [fileUrl, setFileUrl] = useState(null);
  const [supply, setSupply] = useState();

  const navigate = useNavigate();

  useEffect(async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      await axios
        .get(`${API_URL}/account/${accounts[0]}`)
        .then((response) => {
          if (response.data) {
            if (response.data.email) {
              return response.data.email.length !== 0
                ? !response.data.verify
                  ? navigate("/account/settings")
                  : null
                : navigate("/account/setup");
            }
          } else {
            navigate("/account/setup");
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

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

  const handleSubmit = async () => {
    const { name, link, description, location, price } = formInput;
    if (
      !name ||
      !link ||
      !description ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !location ||
      !price ||
      !fileUrl
    )
      return;
    const data = JSON.stringify({
      name,
      link,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      mintToken(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const mintToken = async (url) => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    let contract = new web3.eth.Contract(
      Ticket.abi,
      Ticket.networks[networkId].address
    );

    let transaction = await contract.methods.mint(url).send({ from: account });
    let block = await web3.eth.getBlock(transaction.blockNumber);
    let returnValues = transaction.events.Transfer.returnValues;

    const price = formInput.price;

    let payload = {
      tokenId: returnValues.tokenId,
      eventTimestamp: block.timestamp,
      eventType: "Minted",
      isMint: true,
      fromAccount: { address: returnValues.from, name: "NullAddress" },
      toAccount: { address: returnValues.to },
      transaction: transaction.transactionHash,
    };

    await axios
      .post(`${API_URL}/event`, payload)
      .catch((err) => console.log(err));

    contract = new web3.eth.Contract(
      Market.abi,
      Market.networks[networkId].address
    );

    transaction = await contract.methods
      .createMarketItem(
        Ticket.networks[networkId].address,
        returnValues.tokenId,
        price
      )
      .send({ from: account });
    console.log(transaction);
    block = await web3.eth.getBlock(transaction.blockNumber);
    returnValues = transaction.events.MarketItemCreated.returnValues;

    payload = {
      tokenId: returnValues.tokenId,
      eventTimestamp: block.timestamp,
      eventType: "List",
      isMint: false,
      fromAccount: { address: returnValues.seller, name: "NullAddress" },
      transaction: transaction.transactionHash,
    };

    await axios
      .post(`${API_URL}/event`, payload)
      .catch((err) => console.log(err));

    navigate("/tickets");
  };

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
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      link: e.target.value,
                    })
                  }
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
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              minimumDate={new Date()}
              minimumLength={1}
              format="dd MMM yyyy"
              locale={enGB}
            >
              {({ startDateInputProps, endDateInputProps, focus }) => (
                <div className="w-full space-y-5">
                  <div className="w-full flex space-x-5">
                    <div className="w-full flex justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar />
                        <p>Start at date</p>
                      </div>
                      <input
                        type="button"
                        className={
                          "input" + (focus === START_DATE ? " -focused" : "") &&
                          "h-11 w-28 text-center px-3 rounded-lg bg-input cursor-pointer hover:bg-hover"
                        }
                        {...startDateInputProps}
                        readOnly
                        placeholder="Start Date"
                      />
                    </div>
                    <div className="w-fit flex justify-between">
                      {/* <div className="inline-flex items-center space-x-3">
                        <Clock />
                        <p>Start Time</p>
                      </div> */}
                      <div className="relative">
                        <Listbox value={startTime} onChange={setStartTime}>
                          <div className="w-full rounded-lg shadow-lg bg-input hover:bg-hover">
                            <Listbox.Button
                              className={`${
                                startTime === "Start Time" && "text-sub-text"
                              } h-11 w-28 text-center items-center text-white rounded-lg`}
                            >
                              {<p>{startTime}</p>}
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
                              <Listbox.Options className="absolute z-10 w-full h-64 mt-3 p-1 bg-white rounded-lg shadow-lg">
                                <CustomScrollbars>
                                  {time?.map((item, i) => (
                                    <Listbox.Option key={i} value={item}>
                                      {({ active }) => (
                                        <button
                                          className={`
                                    ${
                                      active && "bg-primary"
                                    } rounded-xl items-center space-x-5 w-full px-5 py-2`}
                                        >
                                          <p
                                            className={
                                              active
                                                ? "text-white"
                                                : "text-input"
                                            }
                                          >
                                            {item}
                                          </p>
                                        </button>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </CustomScrollbars>
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex space-x-5">
                    <div className="w-full flex justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar />
                        <p>End at date</p>
                      </div>
                      <input
                        className={
                          "input" + (focus === END_DATE ? " -focused" : "") &&
                          "h-11 w-28 text-center px-3 rounded-lg bg-input cursor-pointer hover:bg-hover"
                        }
                        {...endDateInputProps}
                        readOnly
                        placeholder="End Date"
                      />
                    </div>
                    <div className="w-fit flex justify-between">
                      {/* <div className="inline-flex items-center space-x-3">
                        <Clock />
                        <p>End Time</p>
                      </div> */}
                      <div className="inline-flex space-x-2">
                        <div className="relative">
                          <Listbox value={endTime} onChange={setEndTime}>
                            <div className="w-full rounded-lg shadow-lg bg-input hover:bg-hover">
                              <Listbox.Button
                                className={`${
                                  endTime === "End Time" && "text-sub-text"
                                } h-11 w-28 text-center items-center text-white rounded-lg`}
                              >
                                {<p>{endTime}</p>}
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
                                <Listbox.Options className="absolute z-10 w-full h-64 mt-3 p-1 bg-white rounded-lg shadow-lg">
                                  <CustomScrollbars>
                                    {time?.map((item, i) => (
                                      <Listbox.Option key={i} value={item}>
                                        {({ active }) => (
                                          <button
                                            className={`
                                    ${
                                      active && "bg-primary"
                                    } rounded-xl items-center space-x-5 w-full px-5 py-2`}
                                          >
                                            <p
                                              className={
                                                active
                                                  ? "text-white"
                                                  : "text-input"
                                              }
                                            >
                                              {item}
                                            </p>
                                          </button>
                                        )}
                                      </Listbox.Option>
                                    ))}
                                  </CustomScrollbars>
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DateRangePicker>
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
                      location: e.target.value,
                    })
                  }
                />
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
            <div className="space-y-3">
              <p>Price</p>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="text"
                  placeholder="Price"
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
            <button
              type="submit"
              onClick={handleSubmit}
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
