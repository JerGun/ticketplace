import React, { useEffect, useState } from "react";
import Web3 from "web3";
import axios from "axios";
import { API_URL } from "../config";

function SetUpOrganizer() {
  const [formInput, setFormInput] = useState({
    address: "",
    name: "",
    email: "",
    verify: false,
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [account, setAccount] = useState();

  useEffect(async () => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    setFormInput({
      ...formInput,
      address: accounts[0],
    });
  }, []);

  const handleSubmit = async (e) => {
    const { name, email } = formInput;
    if (!name || !email) return;

    e.preventDefault();
    setSendingEmail(true);
    console.log("pass");

    await axios
      .post(`${API_URL}/email`, formInput)
      .then((response) => {
        // Everything has come back successfully, time to update the state to
        // reenable the button and stop the <Spinner>. Also, show a toast with a
        // message from the server to give the user feedback and reset the form
        // so the user can start over if she chooses.
        setSendingEmail(false);
        console.log(response.data.msg);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="fixed h-full w-full p-10 bg-background">
      <div className="h-full mx-28 space-y-5 text-white">
        <p className="text-4xl font-bold py-5">
          Setup Your Ticketplace Organizer Account
        </p>
        <div className="space-y-3">
          <p className="text-text">You are signed in as</p>
          <p className="text-3xl font-bold">{account}</p>
          <p className="text-text">
            We will use this wallet to create your organizer account
          </p>
        </div>
        <div className="space-y-3">
          <p>Organizer name</p>
          <div className="h-11 w-1/3 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
            <input
              type="text"
              placeholder="Your organizer name"
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
          <p>Email</p>
          <div className="h-11 w-1/3 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
            <input
              type="text"
              placeholder="email@email.com"
              className="h-full w-full bg-transparent"
              onChange={(e) =>
                setFormInput({
                  ...formInput,
                  email: e.target.value,
                })
              }
            />
          </div>
        </div>
        <button
          type="submit"
          className="h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default SetUpOrganizer;
