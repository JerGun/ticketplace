import { React, useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import { ReactComponent as Copy } from "../assets/icons/copy.svg";
import { ReactComponent as Check } from "../assets/icons/check.svg";
import { ReactComponent as Setting } from "../assets/icons/setting.svg";
import { ReactComponent as Share } from "../assets/icons/share.svg";

import Owned from "./Owned";

function Account({ account, info }) {
  const [path, setPath] = useState();
  const [copy, setCopy] = useState(false);
  const [share, setShare] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState();

  const navigate = useNavigate();

  const copyURL = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${account}`);
    setShare(true);
    setButtonDisabled(true);
    setTimeout(() => {
      setShare(false);
      setButtonDisabled(false);
    }, 2000);
  };

  const watchPath = (path) => {
    setPath(path);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopy(true);
    setButtonDisabled(true);
    setTimeout(() => {
      setCopy(false);
      setButtonDisabled(false);
    }, 2000);
  };

  useEffect(() => {
    if (account.length === 0) {
      console.log(account);
      return navigate("/");
    }
  }, []);

  return (
    <>
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
            className="absolute bottom-10 left-10 py-3 px-6 rounded-lg shadow-lg bg-white"
          >
            <p>Copied</p>
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
            className="absolute bottom-10 left-10 py-3 px-6 rounded-lg shadow-lg bg-white"
          >
            <p>Link Copied</p>
          </Dialog>
        </Transition.Child>
      </Transition>
      <div className="h-full w-full text-wh flex justify-center py-10 bg-background">
        <div className="h-full w-10/12">
          <div className="relative flex flex-col space-y-5 items-center">
            <div className="absolute flex right-0 space-x-5">
              <a
                data-tip="Setting"
                className="h-11 w-11 p-3 flex justify-center items-center rounded-lg text-white bg-input"
              >
                <Setting />
              </a>
              <ReactTooltip
                effect="solid"
                place="top"
                offset={{ top: 2, left: 20 }}
                backgroundColor="#353840"
                style={{ opacity: 1 }}
              />
              <button
                data-tip="Share"
                className="h-11 w-11 flex justify-center items-center rounded-lg bg-input"
                onClick={copyURL}
                disabled={buttonDisabled}
              >
                {copy === true ? <Check className="text-white" /> : <Share />}
              </button>
            </div>
            <div className="h-36 w-36">
              <img
                src={info.img}
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <p className="text-4xl text-white">{info.name}</p>
            <div className="flex space-x-3 text-text">
              <p>{`${account.slice(0, 5)} ... ${account.slice(-6)}`}</p>
              <button onClick={copyAddress} disabled={buttonDisabled}>
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
          <div className="h-full flex justify-center items-center text-3xl text-white">
            <Routes>
              <Route path="" element={<p>No items to display</p>} />
              <Route path=":owned" element={<Owned />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

export default Account;
