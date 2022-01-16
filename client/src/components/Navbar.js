import { React, useState } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as Search } from "../assets/search.svg";
import { ReactComponent as Wallet } from "../assets/wallet.svg";

function Navbar({ connectWallet, account }) {
  const [path, setPath] = useState("");

  function watchPath(path) {
    setPath(path);
  }

  return (
    <div className="fixed w-full h-18 grid grid-cols-8 items-center text-white shadow-lg bg-background">
      <div className="col-span-2 px-5">
        <Link
          to="/"
          onClick={() => {
            watchPath("/");
          }}
        >
          <p className="text-4xl">Ticketplace</p>
        </Link>
      </div>
      <div className="col-span-3 h-full w-full flex items-center">
        <div className="h-11 w-full space-x-3 px-3 flex items-center rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
          <Search className="h-1/2" />
          <input
            type="text"
            placeholder="Search tickets, organizers"
            className="h-full w-full bg-transparent"
          />
        </div>
      </div>
      <div className="col-span-3 h-full flex justify-end items-center text-text ">
        <div className="relative h-full flex items-center hover:text-white">
          <Link
            to="/tickets"
            className="h-full w-full px-5 flex items-center hover:text-white"
            onClick={() => {
              watchPath("/tickets");
            }}
          >
            Explore
          </Link>
          {path === "/tickets" ? (
            <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
          ) : null}
        </div>
        <span className="h-1/2 divider-y"></span>
        <div className="h-full flex items-center">
          {account.length !== 0 && (
            <div className="relative h-full w-fit flex items-center">
              <Link
                to="/ticket/create"
                className="h-full w-full px-5 flex items-center hover:text-white"
                onClick={() => {
                  watchPath("/ticket/create");
                }}
              >
                Create Ticket
              </Link>
              {path === "/ticket/create" ? (
                <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
              ) : null}
            </div>
          )}
          <div className="relative h-full w-fit">
            <Link
              to={account.length !== 0 ? "/account" : ""}
              className="h-full flex items-center space-x-3 px-5 hover:text-white"
              onClick={() => {
                connectWallet();
                watchPath("/account");
              }}
            >
              {account.length !== 0 && <p>{`${account.slice(0, 5)} ... ${account.slice(-6)}`}</p>}
              {account.length === 0 && <p>Connect wallet</p>}
              <Wallet />
            </Link>
            {path === "/account" ? (
              <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
