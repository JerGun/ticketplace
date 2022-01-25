import { React, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useParams } from 'react-router-dom';

import { ReactComponent as Price } from "../assets/price.svg";
import { ReactComponent as Binance } from "../assets/binance.svg";
import { ReactComponent as External } from "../assets/external.svg";
import { ReactComponent as Share } from "../assets/share.svg";
import { ReactComponent as Description } from "../assets/description.svg";
import { ReactComponent as Location } from "../assets/location.svg";
import { ReactComponent as Calendar } from "../assets/calendar.svg";
import { ReactComponent as Clock } from "../assets/clock.svg";
import { ReactComponent as History } from "../assets/history.svg";
import { ReactComponent as Close } from "../assets/close.svg";
import { ReactComponent as Check } from "../assets/check.svg";

function TicketItem() {
  const [copy, setCopy] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  const params = useParams();

  function copyURL() {
    navigator.clipboard.writeText(window.location.href);
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
      <div className="h-fit w-full p-10 bg-background">
        <div className="h-full mx-28 text-white">
          <div className="h-full w-full flex space-x-5">
            <div className="w-3/12 space-y-5">
              <div className="h-80 w-full rounded-xl bg-white"></div>
              <div className="h-fit w-full flex justify-between items-center p-3 rounded-lg bg-input">
                <p>Token ID</p>
                <p>{params.ticketId}</p>
              </div>
              <div className="h-fit w-full p-3 space-y-3 rounded-lg bg-input">
                <div className="flex items-center space-x-3">
                  <Price />
                  <p>Price</p>
                </div>
                <div className="flex space-x-5">
                  <Binance />
                  <p className="text-4xl font-bold">1.0 BNB</p>
                </div>
                <button
                  className="h-11 w-full flex justify-center items-center rounded-lg font-bold text-black bg-primary"
                  onClick={() => setShowCheckoutModal(true)}
                >
                  Buy for 1.0 BNB
                </button>
              </div>
            </div>
            <div className="w-full pr-40 space-y-5">
              <div className="w-full space-y-1">
                <div className="w-full flex justify-between items-center">
                  <p className="text-3xl">LEO presents Cat Expo</p>
                  <div className="flex space-x-5">
                    <a
                      target={"_blank"}
                      href="https://www.pawaret.dev"
                      className="h-11 w-11 flex justify-center items-center rounded-lg bg-input"
                    >
                      <External />
                    </a>
                    <button
                      className="h-11 w-11 flex justify-center items-center rounded-lg bg-input"
                      onClick={copyURL}
                      disabled={buttonDisabled}
                    >
                      {copy === true ? (
                        <Check className="text-white" />
                      ) : (
                        <Share />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex text-sm space-x-1">
                  <p className="text-text">Organized by </p>
                  <p className="text-primary">Cat Radio</p>
                </div>
                <div className="flex text-sm space-x-1">
                  <p className="text-text">Owned by</p>
                  <p>0x4e...06C7</p>
                </div>
              </div>
              <div className="h-fit w-full py-5 pl-5 pr-3 rounded-lg bg-input">
                <div className="h-full max-h-72 overflow-auto">
                  <div className="sticky top-0 w-full pb-5 flex items-center space-x-3 bg-input">
                    <Description />
                    <p>Description</p>
                  </div>
                  <div className="pr-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Quisque sodales, neque in ullamcorper ultrices, eros erat
                    venenatis libero, quis accumsan libero augue in libero.
                    Pellentesque sollicitudin eu tortor quis fermentum.Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                    sodales, neque in ullamcorper ultrices, eros erat venenatis
                    libero, quis accumsan libero augue in libero. Pellentesque
                    sollicitudin eu tortor quis fermentum.Lorem ipsum dolor sit
                    amet, consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero. Pellentesque sollicitudin
                    eu tortor quis fermentum.Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero. Pellentesque sollicitudin
                    eu tortor quis fermentum.Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero.Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero. Pellentesque sollicitudin
                    eu tortor quis fermentum.Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero. Pellentesque sollicitudin
                    eu tortor quis fermentum.Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero. Pellentesque sollicitudin
                    eu tortor quis fermentum.Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero. Pellentesque sollicitudin
                    eu tortor quis fermentum.Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Quisque sodales, neque in
                    ullamcorper ultrices, eros erat venenatis libero, quis
                    accumsan libero augue in libero.
                  </div>
                </div>
              </div>
              <div className="h-fit w-full p-5 space-y-3 rounded-lg bg-input">
                <div className="flex items-center space-x-3">
                  <Location className="mx-1" />
                  <p>Centralplaza Chiangmai Airport</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="scale-75" />
                  <p>16/05/2021</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="scale-75" />
                  <div className="flex space-x-2">
                    <p>15:00</p>
                    <p>-</p>
                    <p>18:00</p>
                  </div>
                </div>
              </div>
              <div className="h-fit w-full p-5 space-y-3 rounded-lg bg-input">
                <div className="flex items-center space-x-3">
                  <History />
                  <p>History</p>
                </div>
                <div className="flex space-x-1 text-text">
                  <p>Listed for</p>
                  <p className="text-white">1.0 BNB</p>
                  <p>by</p>
                  <p className="text-white">0x4e...06C7 </p>
                  <p>on 16/03/2021 - 15:46</p>
                </div>
              </div>
            </div>
          </div>
          <Transition
            show={showCheckoutModal}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Dialog
              as="div"
              className="fixed inset-0 z-10 overflow-y-auto "
              onClose={() => setShowCheckoutModal(false)}
            >
              <div className="px-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="inline-block h-screen align-middle"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform text-white bg-background shadow-lg rounded-2xl">
                    {/*header*/}
                    <div className="relative flex items-center justify-center p-5 border-b border-solid border-white">
                      <h3 className="text-2xl">Complete checkout</h3>
                      <button
                        className="absolute right-5 p-3 text-white"
                        onClick={() => setShowCheckoutModal(false)}
                      >
                        <Close />
                      </button>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 space-y-3">
                      <p>Items</p>
                      <div className="flex justify-between">
                        <div className="flex space-x-5">
                          <span className="h-24 w-16 rounded-lg bg-white"></span>
                          <div className="space-y-3">
                            <p>Cat Radio</p>
                            <p className="text-xl">LEO presents Cat Expo</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-5">
                          <Binance className="h-6" />
                          <p className="text-xl">1.0 BNB</p>
                        </div>
                      </div>
                    </div>
                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 space-x-5 border-t border-solid border-white">
                      <button
                        className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
                        type="button"
                        onClick={() => setShowCheckoutModal(false)}
                      >
                        Confirm checkout
                      </button>
                      <button
                        className="h-11 w-fit px-5 flex justify-center items-center rounded-lg font-bold text-white bg-modal-button"
                        type="button"
                        onClick={() => setShowAddFundsModal(true)}
                      >
                        Add funds
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        </div>
      </div>
    </>
  );
}

export default TicketItem;
