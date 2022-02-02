import React, { Fragment, useEffect, useState } from "react";
import Web3 from "web3";
import axios from "axios";
import { API_URL } from "../config";
import { Dialog, Transition } from "@headlessui/react";

import { ReactComponent as Email } from "../assets/icons/email.svg";
import { ReactComponent as Close } from "../assets/icons/close.svg";
import { ReactComponent as Check } from "../assets/icons/check.svg";

function AccountSettings() {
  const [account, setAccount] = useState();
  const [info, setInfo] = useState({
    address: "",
    name: "",
    email: "",
    verify: false,
  });
  const [formInput, setFormInput] = useState({
    address: "",
    name: "",
    email: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [nameRequired, setNameRequired] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [emailPattern, setEmailPattern] = useState(false);
  const [submitDisable, setSubmitDisable] = useState(true);
  const [success, setSuccess] = useState();
  const [showModal, setShowModal] = useState(false);

  useEffect(async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      await axios
        .get(`${API_URL}/account/${accounts[0]}`)
        .then((response) => {
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
        })
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    formInput.name !== info.name && formInput.emai !== info.email
      ? formInput.name.length > 0 && formInput.email.length > 0
        ? !nameRequired && !emailRequired && !emailPattern
          ? setSubmitDisable(false)
          : setSubmitDisable(true)
        : setSubmitDisable(true)
      : setSubmitDisable(true);
  }, [formInput.name, formInput.email]);

  const handleSubmit = async () => {
    const { name, email } = formInput;
    if (!name || !email) return;

    if (formInput.email !== info.email) {
      await axios
        .put(`${API_URL}/email/update`, formInput)
        .then((response) => {
          setSubmitDisable(true);
          setShowModal(true);
          setSendingEmail(true);
          setTimeout(() => {
            setSubmitDisable(false);
            setShowModal(false);
            setSendingEmail(false);
          }, 4000);
        })
        .catch((err) => console.log(err));
    } else {
      await axios
        .put(`${API_URL}/account/update`, formInput)
        .then((response) => {
          setSubmitDisable(true);
          setShowModal(true);
          setSuccess(true);
          setTimeout(() => {
            setSubmitDisable(false);
            setShowModal(false);
            setSuccess(false);
          }, 4000);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleResend = async () => {
    await axios
      .put(`${API_URL}/email/update`, formInput)
      .then((response) => {
        setSubmitDisable(true);
        setShowModal(true);
        setSendingEmail(true);
        setTimeout(() => {
          setSubmitDisable(false);
          setShowModal(false);
          setSendingEmail(false);
        }, 4000);
      })
      .catch((err) => console.log(err));
  };

  const handleNameChange = (e) => {
    setFormInput({
      ...formInput,
      name: e.target.value,
    });
    e.target.value.length === 0
      ? setNameRequired(true)
      : setNameRequired(false);
  };

  const handleEmailChange = (e) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setFormInput({
      ...formInput,
      email: e.target.value,
    });
    e.target.value.length === 0
      ? (setEmailRequired(true), setEmailPattern(false))
      : !pattern.test(e.target.value)
      ? (setEmailRequired(false), setEmailPattern(true))
      : (setEmailRequired(false), setEmailPattern(false));
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
            <div className="space-y-1">
              <div
                className={`${nameRequired && "border border-red-400"}
              h-11 w-1/3 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover
              `}
              >
                <input
                  type="text"
                  placeholder="Name"
                  value={formInput.name}
                  className="h-full w-full bg-transparent"
                  onChange={handleNameChange}
                />
              </div>
              {nameRequired && (
                <div className="flex items-center space-x-3 text-sm text-red-400">
                  <Close className="h-2 w-2" />
                  <p>Name is required.</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <p>Email</p>
            <div className="space-y-1">
              <div
                className={`${
                  (emailRequired && "border border-red-400") ||
                  (emailPattern && "border border-red-400")
                }
              h-11 w-1/3 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover
              `}
              >
                <input
                  type="text"
                  placeholder="email@email.com"
                  value={formInput.email}
                  className="h-full w-full bg-transparent"
                  onChange={handleEmailChange}
                />
              </div>
              {emailRequired && (
                <div className="flex items-center space-x-3 text-sm text-red-400">
                  <Close className="h-2 w-2" />
                  <p>Email is required.</p>
                </div>
              )}
              {emailPattern && (
                <div className="flex items-center space-x-3 text-sm text-red-400">
                  <Close className="h-2 w-2" />
                  <p>Entered value does not match email format.</p>
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className={`${
              submitDisable && "opacity-50"
            } h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary`}
            onClick={handleSubmit}
            disabled={submitDisable}
          >
            Save
          </button>
          {!info.verify && (
            <div className="flex">
              <p className="text-text">
                Please check {info.email} and verify your new email address.
                Still no email after a couple minutes?{" "}
                <button className="text-primary" onClick={handleResend}>
                  Click here to resend.
                </button>
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

export default AccountSettings;
