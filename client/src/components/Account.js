import { React, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Routes, Route, Link } from "react-router-dom";

import { ReactComponent as Copy } from "../assets/copy.svg";
import { ReactComponent as Check } from "../assets/check.svg";
import Owned from "./Owned";

function Account({ account }) {
  const [path, setPath] = useState();
  const [copy, setCopy] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState();

  function watchPath(path) {
    setPath(path);
  }

  function copyAddress() {
    navigator.clipboard.writeText(account);
    setCopy(true);
    setButtonDisabled(true);
    setTimeout(() => {
      setCopy(false);
      setButtonDisabled(false);
    }, 2000);
  }

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
      <div className="h-full w-full text-wh flex justify-center my-10 bg-background">
        <div className="h-full w-10/12">
          <div className="flex flex-col space-y-5 items-center">
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
