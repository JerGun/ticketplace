import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { Dialog, Transition, Disclosure } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { getAccount } from "../../services/Web3";

import { ReactComponent as Close } from "../../assets/icons/close.svg";
import { ReactComponent as Email } from "../../assets/icons/email.svg";
import { ReactComponent as Down } from "../../assets/icons/down.svg";

function AccountSetup() {
  const [account, setAccount] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [nameRequired, setNameRequired] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [emailPattern, setEmailPattern] = useState(false);
  const [emailExist, setEmailExist] = useState(false);
  const [formInput, setFormInput] = useState({
    address: "",
    name: "",
    email: "",
    verify: false,
    fullName: "",
    social: "",
    post: "",
  });

  const navigate = useNavigate();

  useEffect(async () => {
    if (window.ethereum) {
      await loadAccount();
    }
  }, []);

  const handleSubmit = async () => {
    const { name, email } = formInput;
    if (!name || !email) {
      setNameRequired(true);
      setEmailRequired(true);
      return;
    }

    setSendingEmail(true);

    await axios
      .post(`${API_URL}/email`, formInput)
      .then((response) => {
        setTimeout(() => {
          setSendingEmail(false);
        }, 4000);
        console.log(response.data.msg);
      })
      .catch((err) => console.log(err));
  };

  const handleNameChange = (e) => {
    setFormInput({
      ...formInput,
      name: e.target.value,
    });
    !e.target.value.length ? setNameRequired(true) : setNameRequired(false);
  };

  const handleEmailChange = async (e) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setFormInput({
      ...formInput,
      email: e.target.value.toLowerCase(),
    });
    await axios
      .get(`${API_URL}/${e.target.value.toLowerCase()}`)
      .then((response) => {
        console.log(response);
        !e.target.value.length
          ? (setEmailRequired(true),
            setEmailPattern(false),
            setEmailExist(false))
          : !pattern.test(e.target.value)
          ? (setEmailRequired(false),
            setEmailPattern(true),
            setEmailExist(false))
          : response.data
          ? (setEmailRequired(false),
            setEmailPattern(false),
            setEmailExist(true))
          : (setEmailRequired(false),
            setEmailPattern(false),
            setEmailExist(false));
      })
      .catch((err) => console.log(err));
  };

  const loadAccount = async () => {
    const connectAccount = await getAccount();
    setAccount(connectAccount);
    setFormInput({
      ...formInput,
      address: connectAccount,
    });
    await axios
      .get(`${API_URL}/account/${account}`)
      .then((response) => {
        if (response.data) {
          if (response.data.email) {
            navigate("/account/settings");
          }
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="h-fit w-full p-10 pb-32 bg-background">
        <div className="h-full mx-28 space-y-5 text-white">
          <p className="text-4xl font-bold py-5">
            Setup Your Ticketplace Account
          </p>
          <div className="space-y-3">
            <p className="text-text">You are signed in as</p>
            <p className="text-3xl font-bold">{account}</p>
            <p className="text-text">
              We will use this wallet to create your account
            </p>
          </div>
          <div className="w-1/2 space-y-5">
            <div className="flex space-x-1 items-center">
              <p className="text-red-500">*</p>
              <p className="text-text text-sm">Required fields</p>
            </div>
            <div className="space-y-3">
              <div className="flex space-x-1">
                <p>Name</p>
                <p className="text-red-500">*</p>
              </div>
              <div className="space-y-1">
                <div
                  className={`${nameRequired && "border border-red-400"}
              h-11 w-1/2 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover
              `}
                >
                  <input
                    type="text"
                    placeholder="Name"
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
              <div className="flex space-x-1">
                <p>Email</p>
                <p className="text-red-500">*</p>
              </div>
              <div className="space-y-1">
                <div
                  className={`${
                    (emailRequired && "border border-red-400") ||
                    (emailPattern && "border border-red-400")
                  }
              h-11 w-1/2 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover
              `}
                >
                  <input
                    type="text"
                    placeholder="email@email.com"
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
                {emailExist && (
                  <div className="flex items-center space-x-3 text-sm text-red-400">
                    <Close className="h-2 w-2" />
                    <p>Email already exist.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="w-1/2 transition-width duration-500 ease-out flex items-center justify-between px-4 py-2 text-left border-2 border-hover text-white rounded-lg focus:outline-none">
                      <p>Verification Form</p>
                      <div className="">
                        <Down
                          className={`${
                            open ? "transform rotate-180" : ""
                          } w-5 h-5 text-white`}
                        />
                      </div>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="w-full space-y-5 pt-5">
                        <p className="text-text">
                          This form allows users to apply for Ticketplace
                          account verification.
                        </p>
                        <div className="space-y-3">
                          <p>
                            Please provide a contact person's full name for your
                            account.
                          </p>
                          <div className="space-y-1">
                            <div className="h-11 w-1/2 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                              <input
                                type="text"
                                placeholder="Full name"
                                className="h-full w-full bg-transparent"
                                onChange={(e) =>
                                  setFormInput({
                                    ...formInput,
                                    fullName: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p>
                            Please provide proof of identity for your account,
                            in the form of a Facebook, Twitter, or Instagram
                            profile.
                          </p>
                          <div className="space-y-1">
                            <div className="h-11 w-1/2 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                              <input
                                type="text"
                                placeholder="https://www.social.com/user"
                                className="h-full w-full bg-transparent"
                                onChange={(e) =>
                                  setFormInput({
                                    ...formInput,
                                    social: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p>
                            Please provide a link to a public tweet / social
                            media post that includes the wallet address of the
                            Ticketplace profile you are requesting verification
                            for.
                          </p>
                          <div className="space-y-2 text-text ">
                            <p>
                              Please post a message including "Hello
                              @Ticketplace", followed by your wallet address.
                            </p>
                            <div className="w-fit p-3 space-y-2 rounded-lg bg-hover">
                              <p>Hello @Ticketplace !</p>
                              <p>
                                [0x198BD436995F602fD43E215b195E3EC0C4f2b610]
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-11 w-1/2 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                              <input
                                type="text"
                                placeholder="https://www.social.com/user/post"
                                className="h-full w-full bg-transparent"
                                onChange={(e) =>
                                  setFormInput({
                                    ...formInput,
                                    post: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            </div>
            <button
              type="submit"
              className={`${
                nameRequired || emailRequired || emailPattern || emailExist
                  ? "opacity-50"
                  : ""
              } h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary`}
              onClick={handleSubmit}
              disabled={
                (!formInput.name.length && nameRequired) ||
                emailRequired ||
                emailPattern ||
                emailExist
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <Transition show={sendingEmail}>
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
            onClose={() => setSendingEmail(false)}
            className="absolute max-w-md bottom-10 right-10 py-3 px-6  rounded-lg shadow-lg bg-hover text-white"
          >
            <div className="flex items-center space-x-5">
              <Email className="h-6 w-6" />
              <p>
                Please check {formInput.email} and verify your new email
                address.
              </p>
              <button onClick={() => setSendingEmail(false)}>
                <Close />
              </button>
            </div>
          </Dialog>
        </Transition.Child>
      </Transition>
    </>
  );
}

export default AccountSetup;
