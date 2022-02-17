import { React, useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import Web3 from "web3";
import axios from "axios";
import { API_URL } from "../../config";
import { create as ipfsHttpClient } from "ipfs-http-client";

import { ReactComponent as Copy } from "../../assets/icons/copy.svg";
import { ReactComponent as Check } from "../../assets/icons/check.svg";
import { ReactComponent as Setting } from "../../assets/icons/setting.svg";
import { ReactComponent as Share } from "../../assets/icons/share.svg";
import { ReactComponent as Edit } from "../../assets/icons/edit.svg";
import { ReactComponent as Verify } from "../../assets/icons/verify.svg";

import Owned from "../Account/Owned";
import Created from "../Account/Created";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function Account() {
  const [account, setAccount] = useState("");
  const [info, setInfo] = useState({
    address: "",
    name: "Unnamed",
    email: "",
    verify: false,
  });
  const [path, setPath] = useState();
  const [copy, setCopy] = useState(false);
  const [share, setShare] = useState(false);
  const [copyDisabled, setCopyDisabled] = useState();
  const [shareDisabled, setShareDisabled] = useState();
  const [image, setImage] = useState({ preview: "", raw: "" });

  const navigate = useNavigate();

  useEffect(async () => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    if (accounts.length === 0) {
      return navigate("/");
    }

    await axios
      .get(`${API_URL}/account/${accounts[0]}`)
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
  }, []);

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

  const watchPath = (path) => {
    setPath(path);
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
        <div className="h-full w-10/12">
          <div className="relative flex flex-col space-y-5 items-center">
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
                {share === true ? <Check className="text-white" /> : <Share />}
              </button>
              <Link
                to={info.email.length ? "/account/settings" : "/account/setup"}
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
                    <div className="relative h-full w-full group">
                      <div className="absolute top-0 z-10 h-full w-full p-14 text-white opacity-0 group-hover:opacity-100">
                        <Edit />
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
                    <div className="relative h-full w-full group">
                      <div className="h-full w-full rounded-full bg-gradient-to-tr from-primary to-sky-200 group-hover:opacity-50"></div>
                      <div className="absolute top-0 z-10 h-full w-full p-14 text-white opacity-0 group-hover:opacity-100">
                        <Edit />
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
            <div className="w-full flex flex-col items-center">
              <div className="h-18 flex items-center text-text">
                <Link
                  to=""
                  onClick={() => {
                    watchPath("");
                  }}
                  className="relative h-full flex px-10 items-center"
                >
                  <p>On Sale</p>
                  {path === "" ? (
                    <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
                  ) : null}
                </Link>
                <Link
                  to={"owned"}
                  onClick={() => {
                    watchPath("owned");
                  }}
                  className="relative h-full flex px-10 items-center"
                >
                  <p>Owned</p>
                  {path === "owned" ? (
                    <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
                  ) : null}
                </Link>
                <Link
                  to={"created"}
                  onClick={() => {
                    watchPath("created");
                  }}
                  className="relative h-full flex px-10 items-center"
                >
                  <p>Created</p>
                  {path === "created" ? (
                    <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
                  ) : null}
                </Link>
              </div>
              <span className="h-1 w-full divider-x"></span>
            </div>
          </div>
          <div className="h-full flex justify-center text-white">
            <Routes>
              <Route path="" element={<p>No items to display</p>} />
              <Route path=":owned" element={<Created />} />
              <Route path=":create" element={<Created />} />
            </Routes>
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
