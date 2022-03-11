import { React, useState, Fragment, useEffect } from "react";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import ReactTooltip from "react-tooltip";
import axios from "axios";
import { API_URL } from "../../config";
import { create as ipfsHttpClient } from "ipfs-http-client";

import { ReactComponent as Copy } from "../../assets/icons/copy.svg";
import { ReactComponent as Check } from "../../assets/icons/check.svg";
import { ReactComponent as Setting } from "../../assets/icons/setting.svg";
import { ReactComponent as Share } from "../../assets/icons/share.svg";
import { ReactComponent as Edit } from "../../assets/icons/edit.svg";
import { ReactComponent as Down } from "../../assets/icons/down.svg";
import { ReactComponent as Verify } from "../../assets/icons/verify.svg";

import Owned from "../Account/Owned";
import Created from "../Account/Created";
import { getAccount } from "../../services/Web3";
import Listing from "./Listing";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const listOption = [
  { title: "Tickets", value: "tickets" },
  { title: "Events", value: "events" },
];

function Account() {
  const [account, setAccount] = useState("");
  const [info, setInfo] = useState({
    address: "",
    name: "Unnamed",
    email: "",
    verify: false,
  });
  const [copy, setCopy] = useState(false);
  const [share, setShare] = useState(false);
  const [copyDisabled, setCopyDisabled] = useState();
  const [shareDisabled, setShareDisabled] = useState();
  const [image, setImage] = useState({ preview: "", raw: "" });
  const [itemType, setItemType] = useState(listOption[0]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {}, [location]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const account = await getAccount();
    setAccount(account);

    if (account.length === 0) {
      return navigate("/");
    }

    await axios
      .get(`${API_URL}/account/${account}`)
      .then((response) => {
        if (response.data) {
          if (response.data.email) {
            setInfo({
              ...info,
              name: response.data.name,
              email: response.data.email,
              verify: response.data.verify,
            });
          } else {
            setInfo({
              ...info,
              name: "Unnamed",
              email: "",
            });
          }
          setImage({ ...image, preview: response.data.img });
        }
      })
      .catch((err) => console.log(err));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setImage({
        preview: url,
        raw: e.target.files[0],
      });
      await axios
        .put(`${API_URL}/account/update`, {
          address: account,
          img: url,
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const copyURL = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${account}`);
    setShare(true);
    setShareDisabled(true);
    setTimeout(() => {
      setShare(false);
      setShareDisabled(false);
    }, 2000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopy(true);
    setCopyDisabled(true);
    setTimeout(() => {
      setCopy(false);
      setCopyDisabled(false);
    }, 2000);
  };

  return (
    <>
      <div className="h-full w-full text-wh flex justify-center py-10 bg-background">
        <div className="h-full w-full flex flex-col items-center">
          <div className="w-full flex flex-col space-y-5 items-center">
            <div className="relative w-10/12 flex flex-col space-y-5 items-center">
              <div className="absolute flex right-0 space-x-5">
                <Link
                  to="/verify-request"
                  data-tip="Achieve Verify"
                  className="h-11 w-11 p-3 flex justify-center items-center rounded-lg text-white bg-input"
                >
                  <Verify />
                </Link>
                <button
                  data-tip="Share"
                  className="h-11 w-11 flex justify-center items-center rounded-lg bg-input"
                  onClick={copyURL}
                  disabled={shareDisabled}
                >
                  {share === true ? (
                    <Check className="text-white" />
                  ) : (
                    <Share />
                  )}
                </button>
                <Link
                  to={
                    info.email.length ? "/account/settings" : "/account/setup"
                  }
                  data-tip="Settings"
                  className="h-11 w-11 p-3 flex justify-center items-center rounded-lg text-white bg-input"
                >
                  <Setting />
                </Link>

                <ReactTooltip
                  effect="solid"
                  place="top"
                  offset={{ top: 2, left: 20 }}
                  backgroundColor="#353840"
                  style={{ opacity: 1 }}
                />
              </div>
              <div className="h-36 w-36">
                <div className="relative h-full w-full">
                  <label
                    htmlFor="upload-button"
                    className="absolute h-full w-full rounded-full hover:cursor-pointer"
                  >
                    {image.preview ? (
                      <div className="relative h-full w-full group rounded-full">
                        <div className="absolute z-10 h-full w-full flex justify-center items-center rounded-full text-white opacity-0 group-hover:opacity-100">
                          <Edit className="scale-50" />
                        </div>
                        <div className="h-full w-full rounded-full group-hover:opacity-50">
                          <img
                            src={image.preview}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full w-full group rounded-full">
                        <div className="h-full w-full rounded-full bg-gradient-to-tr from-primary to-sky-200 group-hover:opacity-50"></div>
                        <div className="absolute top-0 z-10 h-full w-full p-14 text-white opacity-0 group-hover:opacity-100">
                          <Edit className="scale-50" />
                        </div>
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
              <p className="text-4xl text-white">{info.name}</p>
              <div className="flex space-x-3 text-text">
                <p>{`${account.slice(0, 5)} ... ${account.slice(-6)}`}</p>
                <button onClick={copyAddress} disabled={copyDisabled}>
                  {copy === true ? <Check /> : <Copy />}
                </button>
              </div>
            </div>
            <div className="w-full flex flex-col">
              <div className="h-18 flex items-center text-lg  text-text">
                <Link to="" className="relative h-full flex px-20 items-center">
                  {location.pathname === "/account" ? (
                    <>
                      <p className="text-white">Listing</p>
                      <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
                    </>
                  ) : (
                    <p>Listing</p>
                  )}
                </Link>
                <Link
                  to={"owned"}
                  className="relative h-full flex px-20 items-center"
                >
                  {location.pathname === "/account/owned" ? (
                    <>
                      <p className="text-white">Owned</p>
                      <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
                    </>
                  ) : (
                    <p>Owned</p>
                  )}
                </Link>
                <div className="relative h-full flex items-center">
                  <Listbox value={itemType} onChange={setItemType}>
                    <div className="w-full relative inline-block">
                      <Listbox.Button
                        className={`${
                          location.pathname === "/account/created"
                            ? "text-white"
                            : "text-text"
                        } h-11 w-full inline-flex justify-between px-20 items-center rounded-lg`}
                      >
                        <p>Created</p>
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
                        <Listbox.Options className="absolute w-full mt-5 left-0 p-1 bg-input rounded-xl shadow-lg">
                          {listOption?.map((item, i) => (
                            <Listbox.Option key={i} value={item}>
                              {({ active }) => (
                                <Link
                                  to={`created${
                                    item.value === "events"
                                      ? `_${item.value}`
                                      : ""
                                  }`}
                                  className={`
                                      ${
                                        active && "bg-background"
                                      } group flex rounded-lg items-center space-x-5 w-full px-5 py-2 text-lg`}
                                >
                                  <div className="flex flex-col items-start">
                                    <p
                                      className={
                                        active ? "text-white" : "text-white"
                                      }
                                    >
                                      {item.title}
                                    </p>
                                  </div>
                                </Link>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                  {location.pathname === "/account/created" ? (
                    <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
                  ) : null}
                </div>
              </div>
              <span className="h-0.5 w-full divider-x"></span>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full w-full flex justify-center text-white">
              <Routes>
                <Route path="" element={<Listing />} />
                <Route path="/owned" element={<Owned />} />
                <Route
                  path="/created"
                  element={<Created itemType={listOption[0]} />}
                />
                <Route
                  path="/created_events"
                  element={<Created itemType={listOption[1]} />}
                />
              </Routes>
            </div>
          </div>
        </div>
      </div>
      <Transition show={copy}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog
            onClose={() => setCopy(false)}
            className="absolute max-w-md bottom-10 right-10 py-3 px-6  rounded-lg shadow-lg bg-hover text-white"
          >
            <p>Copied!</p>
          </Dialog>
        </Transition.Child>
      </Transition>
      <Transition show={share}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog
            onClose={() => setShare(false)}
            className="absolute max-w-md bottom-10 right-10 py-3 px-6  rounded-lg shadow-lg bg-hover text-white"
          >
            <p>Link Copied!</p>
          </Dialog>
        </Transition.Child>
      </Transition>
    </>
  );
}

export default Account;
