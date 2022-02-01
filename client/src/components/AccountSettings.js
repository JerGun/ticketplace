import React, { Fragment, useEffect, useState } from "react";
import Web3 from "web3";
import axios from "axios";
import { API_URL } from "../config";
import { Dialog, Transition } from "@headlessui/react";

import { ReactComponent as Email } from "../assets/icons/email.svg";
import { ReactComponent as Close } from "../assets/icons/close.svg";
import { ReactComponent as Check } from "../assets/icons/check.svg";

function SettingAccount() {
  const [formInput, setFormInput] = useState({
    address: "",
    name: "",
    email: "",
  });
  const [account, setAccount] = useState();
  const [info, setInfo] = useState({
    address: "",
    name: "",
    email: "",
    verify: false,
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [success, setSuccess] = useState();
  const [isChange, setIsChange] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      await axios
        .get(`${API_URL}/account/${accounts[0]}`)
        .then((response) => {
          if (response) {
            setInfo({
              ...info,
              name: response.data.name,
              email: response.data.email,
              img: response.data.img,
              verify: response.data.verify,
            });
            setFormInput({
              ...formInput,
              address: accounts[0],
              name: response.data.name,
              email: response.data.email,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

  const handleSubmit = async () => {
    const { name, email } = formInput;
    if (!name || !email) return;

    if (formInput.email !== info.email) {
      await axios
        .put(`${API_URL}/email/update`, formInput)
        .then((response) => {
          setShowModal(true);
          setSendingEmail(true);
          setTimeout(() => {
            setShowModal(false);
            setSendingEmail(false);
          }, 5000);
        })
        .catch((err) => console.log(err));
    } else {
      await axios
        .put(`${API_URL}/account/update`, formInput)
        .then((response) => {
          setShowModal(true);
          setSuccess(true);
          setTimeout(() => {
            setShowModal(false);
            setSuccess(false);
          }, 5000);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleNameChange = (e) => {
    if (e.target.value !== info.name) {
      setIsChange(true);
    } else {
      setIsChange(false);
    }
  };

  const handleEmailChange = (e) => {
    if (e.target.value !== info.email) {
      setIsChange(true);
    } else {
      setIsChange(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="fixed h-full w-full p-10 bg-background">
        <div className="h-full mx-28 space-y-5 text-white">
          <p className="text-4xl font-bold py-5">Profile Settings</p>
          <div className="space-y-3">
            <p className="text-text">You are signed in as</p>
            <p className="text-3xl font-bold">{account}</p>
          </div>
          <div className="space-y-3">
            <p>Name</p>
            <div className="h-11 w-1/3 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
              <input
                type="text"
                placeholder="Name"
                value={formInput.name}
                className="h-full w-full bg-transparent"
                onChange={(e) => {
                  setFormInput({
                    ...formInput,
                    name: e.target.value,
                  }),
                    handleNameChange(e);
                }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <p>Email</p>
            <div className="h-11 w-1/3 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
              <input
                type="text"
                placeholder="email@email.com"
                value={formInput.email}
                className="h-full w-full bg-transparent"
                onChange={(e) => {
                  setFormInput({
                    ...formInput,
                    email: e.target.value,
                  }),
                    handleEmailChange(e);
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`${
              !isChange && "opacity-50"
            } h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary`}
            onClick={handleSubmit}
            disabled={!isChange, showModal}
          >
            Save
          </button>
          {!info.verify && (
            <div className="flex">
              <p className="text-text">
                Please check {info.email} and verify your new email address.
                Still no email after a couple minutes?{" "}
                <button className="text-primary">Click here to resend.</button>
              </p>
            </div>
          )}
        </div>
      </div>
      <Transition show={showModal}>
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
            onClose={closeModal}
            className="absolute max-w-md bottom-10 right-10 py-3 px-6  rounded-lg shadow-lg bg-hover text-white"
          >
            {sendingEmail && (
              <div className="flex items-center space-x-5">
                <Email className="h-6 w-6" />
                <p>
                  Please check {formInput.email} and verify your new email
                  address.
                </p>
                <button onClick={closeModal}>
                  <Close />
                </button>
              </div>
            )}
            {success && (
              <div className="flex items-center space-x-5">
                <Check />
                <p>Profile successfully updated</p>
                <button onClick={closeModal}>
                  <Close />
                </button>
              </div>
            )}
          </Dialog>
        </Transition.Child>
      </Transition>
    </>
  );
}

export default SettingAccount;
