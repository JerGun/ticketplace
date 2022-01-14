import React from "react";
import { Router, Link } from "react-router-dom";
import "./Navbar.css";

import { ReactComponent as Search } from "../assets/search.svg";
import { ReactComponent as Wallet } from "../assets/wallet.svg";

function Navbar({ connectWallet, accounts }) {
  return (
    <div className="w-full h-18 grid grid-cols-8 items-center text-white shadow-lg bg-background">
      <div className="col-span-2 px-5">
        <p className="text-4xl">Ticketplace</p>
      </div>
      <div className="col-span-3 h-7/12 w-full space-x-3 px-3 flex items-center rounded-lg bg-search hover:bg-hover focus-within:bg-hover">
        <Search className="h-1/2" />
        <input
          type="text"
          placeholder="Search tickets, organizers"
          className="h-full w-full bg-transparent"
        />
      </div>
      <div className="col-span-3 h-full flex justify-end items-center text-text">
        <div className="px-5">
          <Link to="/tickets">Explore</Link>
        </div>
        <span className="h-1/2 divider-y"></span>
        <div className="h-full flex">
          {accounts.length !== 0 && (
            <button className="px-5">
              <Link to="/ticket/create">Create Ticket</Link>
            </button>
          )}
          <button
            className="h-full flex items-center space-x-3 px-5"
            onClick={connectWallet}
          >
            {accounts.length !== 0 && <p>{accounts}</p>}
            {accounts.length === 0 && <p>Connect wallet</p>}
            <Wallet />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
