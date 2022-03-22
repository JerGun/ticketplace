import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useNavigate, useParams } from "react-router-dom";
import { enGB } from "date-fns/locale";
import { DateRangePicker, START_DATE, END_DATE } from "react-nice-dates";
import "react-nice-dates/build/style.css";
import { API_URL } from "../../config";
import formatter from "../../formatter";
import { getAccount, getUri, mintEvent, setUri } from "../../services/Web3";
import { Listbox, Transition } from "@headlessui/react";
import CustomScrollbars from "../CustomScrollbars";

import { ReactComponent as Photo } from "../../assets/icons/photo.svg";
import { ReactComponent as Calendar } from "../../assets/icons/calendar.svg";
import { ReactComponent as Close } from "../../assets/icons/close.svg";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function EditEvent() {
  const [image, setImage] = useState({ preview: "", raw: "" });
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [startTime, setStartTime] = useState("Start Time");
  const [endTime, setEndTime] = useState("End Time");
  const [fileUrl, setFileUrl] = useState("");
  const [verify, setVerify] = useState(false);
  const [nameRequired, setNameRequired] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);
  const [formInput, setFormInput] = useState({});

  const params = useParams();
  const navigate = useNavigate();

  useEffect(async () => {
    if (window.ethereum) {
      checkEmailVerified();
      await loadEvent();
    }
  }, []);

  const loadEvent = async () => {
    const eventUri = await getUri(params.eventId);
    const eventMeta = await axios.get(eventUri);
    let item = {
      name: eventMeta.data.name,
      link: eventMeta.data.link,
      location: eventMeta.data.location,
    };

    setFormInput(item);
    setFileUrl(eventMeta.data.image);
    setImage({ ...image, preview: eventMeta.data.image });
    setStartTime(eventMeta.data.startTime);
    setEndTime(eventMeta.data.endTime);
    let now = Date.now();
    let tempDate = new Date(
      eventMeta.data.startDate.split("/")[2],
      eventMeta.data.startDate.split("/")[1] - 1,
      eventMeta.data.startDate.split("/")[0]
    );
    setTempStartDate(now - tempDate >= 0 ? "" : tempDate);
    tempDate = new Date(
      eventMeta.data.endDate.split("/")[2],
      eventMeta.data.endDate.split("/")[1] - 1,
      eventMeta.data.endDate.split("/")[0]
    );
    setTempEndDate(now - tempDate >= 0 ? "" : tempDate);
  };

  const checkEmailVerified = async () => {
    const account = await getAccount();
    await axios
      .get(`${API_URL}/account/${account}`)
      .then((response) => {
        if (response.data) {
          if (response.data.email) {
            if (response.data.email.length !== 0) {
              if (!response.data.verify) {
                navigate("/account/settings");
              }
              setVerify(response.data.verify);
            }
          }
        } else {
          navigate("/account/setup");
        }
      })
      .catch((err) => console.log(err));
  };

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

  const handleSubmit = async () => {
    const { name, link, location } = formInput;
    if (
      !name ||
      !tempStartDate ||
      !tempEndDate ||
      !startTime ||
      !endTime ||
      !location ||
      !fileUrl
    )
      return;

    let startDate = formatter.formatDate(new Date(tempStartDate));
    let endDate = formatter.formatDate(new Date(tempEndDate));
    const data = JSON.stringify({
      name,
      link,
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

      await setUri(params.eventId, url).then((result) =>
        navigate(`/event/${params.eventId}`)
      );
    } catch (err) {
      console.log("Error uploading file: ", err);
    }
  };

  const handleNameChange = (e) => {
    setFormInput({
      ...formInput,
      name: e.target.value,
    });
    !e.target.value.length ? setNameRequired(true) : setNameRequired(false);
  };

  const handleLocatinChange = (e) => {
    setFormInput({
      ...formInput,
      location: e.target.value,
    });
    !e.target.value.length
      ? setLocationRequired(true)
      : setLocationRequired(false);
  };

  if (verify)
    return (
      <div className="h-full w-full p-10 bg-background">
        <div className="h-full mx-28 text-white">
          <p className="text-4xl font-bold py-5">Create new event</p>
          <div className="flex space-x-1 py-3 items-center">
            <p className="text-red-500">*</p>
            <p className="text-text text-sm">Required fields</p>
          </div>
          <div className="h-full w-full flex space-x-20">
            <div className="h-full w-3/12">
              <div className="flex space-x-1">
                <p>Image</p>
                <p className="text-red-500">*</p>
              </div>
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
                <div className="flex space-x-1">
                  <p>Event name</p>
                  <p className="text-red-500">*</p>
                </div>
                <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                  <input
                    type="text"
                    value={formInput.name}
                    placeholder="Event name"
                    className="h-full w-full bg-transparent"
                    onChange={handleNameChange}
                  />
                </div>
                {nameRequired && (
                  <div className="flex items-center space-x-3 text-sm text-red-400">
                    <Close className="h-2 w-2" />
                    <p>Event name is required.</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p>External Link</p>
                  <p className="text-sm text-sub-text">
                    You are welcome to link to your own webpage with more
                    details.
                  </p>
                </div>
                <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                  <input
                    type="text"
                    value={formInput.link}
                    placeholder="https://yoursite.com/event/details"
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
              {/* <div className="space-y-3">
              <p>Description</p>
              <div className="h-fit px-3 py-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <textarea
                  type="text"
                  rows="8"
                  placeholder="Event detailed description."
                  className="h-full w-full bg-transparent"
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div> */}
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
                            "input" +
                              (focus === START_DATE ? " -focused" : "") &&
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
                    value={formInput.location}
                    placeholder="Location"
                    className="h-full w-full bg-transparent"
                    onChange={handleLocatinChange}
                  />
                </div>
                {locationRequired && (
                  <div className="flex items-center space-x-3 text-sm text-red-400">
                    <Close className="h-2 w-2" />
                    <p>Location is required.</p>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className={`${
                  !fileUrl ||
                  !formInput.name.length ||
                  nameRequired ||
                  !tempStartDate ||
                  !tempEndDate ||
                  startTime === "Start Time" ||
                  endTime === "End Time" ||
                  locationRequired
                    ? "opacity-50"
                    : ""
                } h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary`}
                onClick={handleSubmit}
                disabled={
                  !fileUrl ||
                  !formInput.name.length ||
                  nameRequired ||
                  !tempStartDate ||
                  !tempEndDate ||
                  startTime === "Start Time" ||
                  endTime === "End Time" ||
                  locationRequired
                }
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return <div className="h-full w-full bg-background"></div>;
}

export default EditEvent;
