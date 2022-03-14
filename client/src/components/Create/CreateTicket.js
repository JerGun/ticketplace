import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useNavigate, useParams } from "react-router-dom";
import { enGB } from "date-fns/locale";
import { Listbox, Transition } from "@headlessui/react";
import { DateRangePicker, START_DATE, END_DATE } from "react-nice-dates";
import "react-nice-dates/build/style.css";
import { API_URL } from "../../config";
import formatter from "../../formatter";
import CustomScrollbars from "../CustomScrollbars";
import { getAccount, getUri, mintTicket } from "../../services/Web3";

import { ReactComponent as Calendar } from "../../assets/icons/calendar.svg";
import { ReactComponent as Close } from "../../assets/icons/close.svg";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function CreateTicket() {
  const [tempStartDate, setTempStartDate] = useState();
  const [tempEndDate, setTempEndDate] = useState();
  const [startTime, setStartTime] = useState("Start Time");
  const [endTime, setEndTime] = useState("End Time");
  const [fileUrl, setFileUrl] = useState(null);
  const [bnb, setBnb] = useState(0);
  const [priceRequired, setPriceRequired] = useState(false);
  const [pricePattern, setPricePattern] = useState(false);
  const [formInput, setFormInput] = useState({
    name: "",
    link: "",
    description: "",
    location: "",
    quantity: "",
    price: "",
  });

  const params = useParams();
  const navigate = useNavigate();

  useEffect(async () => {
    if (window.ethereum) {
      const account = await getAccount();
      await axios
        .get(`${API_URL}/account/${account}`)
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

      const eventUri = await getUri(params.eventId);
      const eventMeta = await axios.get(eventUri);
      setFileUrl(eventMeta.data.image);
      fetchBNB();
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
    setFormInput({ ...formInput, price: value });
    e.target.value.length === 0
      ? (setPriceRequired(true), setPricePattern(false))
      : parseFloat(e.target.value) < 0.001
      ? (setPriceRequired(false), setPricePattern(true))
      : (setPriceRequired(false), setPricePattern(false));
  };

  const handleSubmit = async () => {
    const { name, link, description, location, quantity, price } = formInput;
    if (
      !name ||
      !description ||
      !tempStartDate ||
      !tempEndDate ||
      !startTime ||
      !endTime ||
      !location ||
      !quantity ||
      !price
    )
      return;
    let startDate = formatter.formatDate(new Date(tempStartDate));
    let endDate = formatter.formatDate(new Date(tempEndDate));
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

      mintTicket(url, params.eventId, quantity, price * 10 ** 8)
        .then((result) => {
          console.log(result);
          navigate(`/event/${params.eventId}`);
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log("Error uploading file: ", err);
    }
  };

  const fetchBNB = async () => {
    await axios
      .get("https://api.coingecko.com/api/v3/coins/binancecoin")
      .then((result) => {
        setBnb(result.data.market_data.current_price.thb.toFixed(2));
      });
  };

  return (
    <div className="h-fit w-full p-10 pb-32 bg-background">
      <div className="h-full mx-28 text-white">
        <p className="text-4xl font-bold py-5">Create new ticket</p>
        <div className="flex space-x-1 py-3 items-center">
          <p className="text-red-500">*</p>
          <p className="text-text text-sm">Required fields</p>
        </div>
        <div className="h-full w-full flex space-x-20">
          <div className="w-1/2 space-y-10">
            <div className="space-y-3">
              <div className="flex space-x-1">
                <p>Ticket name</p>
                <p className="text-red-500">*</p>
              </div>
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
              <div className="flex space-x-1">
                <p>Description</p>
                <p className="text-red-500">*</p>
              </div>
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
              startDate={tempStartDate}
              endDate={tempEndDate}
              onStartDateChange={setTempStartDate}
              onEndDateChange={setTempEndDate}
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
                        <div className="flex space-x-1">
                          <p>Start at date</p>
                          <p className="text-red-500">*</p>
                        </div>
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
                                  {formatter.time?.map((item, i) => (
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
                        <div className="flex space-x-1">
                          <p>End at date</p>
                          <p className="text-red-500">*</p>
                        </div>
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
                                    {formatter.time?.map((item, i) => (
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
              <div className="flex space-x-1">
                <p>Location</p>
                <p className="text-red-500">*</p>
              </div>
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
                <div className="flex space-x-1">
                  <p>Quantity Available</p>
                  <p className="text-red-500">*</p>
                </div>
                <p className="text-sm text-sub-text">
                  Number of tickets available.
                </p>
              </div>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="number"
                  placeholder="1"
                  min="1"
                  value={formInput.supply}
                  onChange={handleQuantityChange}
                  className="h-full w-full bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex space-x-1">
                <p>Price</p>
                <p className="text-red-500">*</p>
              </div>
              <div className="flex space-x-5">
                <div className="h-11 w-full px-3 flex items-center space-x-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                  <input
                    type="number"
                    placeholder="1"
                    value={formInput.price}
                    className="price h-full w-full bg-transparent"
                    onChange={handlePriceChange}
                  />
                </div>
                <div className="h-11 px-5 flex items-center space-x-3 rounded-lg bg-input">
                  <p>BNB</p>
                </div>
              </div>
              {priceRequired && (
                <div className="flex items-center space-x-3 text-sm text-red-400">
                  <Close className="h-2 w-2" />
                  <p>Price is required.</p>
                </div>
              )}
              {pricePattern && (
                <div className="flex items-center space-x-3 text-sm text-red-400">
                  <Close className="h-2 w-2" />
                  <p>Price must more than 0.001 BNB.</p>
                </div>
              )}
              {formInput.price ? (
                <p className="text-sm text-text">
                  {(bnb * formInput.price).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  THB
                </p>
              ) : (
                <p className="text-sm text-sub-text">0 THB</p>
              )}
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary hover:bg-primary-light"
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
