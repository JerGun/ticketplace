import { React, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { ReactComponent as Search } from "../assets/icons/search.svg";
import { ReactComponent as Wallet } from "../assets/icons/wallet.svg";
import logo from "../assets/images/logo.png";

function Navbar({ connectWallet, account }) {
  const location = useLocation();

  useEffect(() => {}, [location]);

  return (
    <nav
      className={`${
        location.pathname === "/" ? " bg-indigo-500" : "shadow-lg bg-background"
      } sticky top-0 w-full z-30 h-18 grid grid-cols-8 items-center`}
    >
      <div className="col-span-2 px-5 text-white">
        <Link to="/" className="flex items-center space-x-5">
          <div className="p-2 rounded-full bg-white">
            <img src={logo} alt="logo" className="h-7 w-7" />
          </div>
          <p className="text-4xl">Ticketplace</p>
        </Link>
      </div>
      <div className="col-span-3 h-full w-full flex items-center text-white">
        {location.pathname !== "/" && (
          <div className="h-11 w-full space-x-3 px-3 flex items-center rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
            <Search className="h-1/2" />
            <input
              type="text"
              placeholder="Search tickets, organizers"
              className="h-full w-full bg-transparent"
            />
          </div>
        )}
      </div>
      <div
        className={`${
          location.pathname === "/" ? "text-white" : "text-text"
        } col-span-3 h-full flex justify-end items-center`}
      >
        <div className="relative h-full flex items-center hover:text-white">
          <Link
            to="/tickets"
            className={`h-full w-full px-5 flex items-center`}
          >
            Explore
          </Link>
          {location.pathname === "/tickets" ? (
            <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
          ) : null}
        </div>
        <span
          className={
            location.pathname === "/" ? "h-1/2 divider-y-w" : "h-1/2 divider-y"
          }
        ></span>
        <div className="h-full flex items-center">
          {account.length !== 0 && (
            <div className="relative h-full w-fit flex items-center hover:text-white">
              <Link
                to="/event/create"
                className="h-full w-full px-5 flex items-center"
              >
                Create Event
              </Link>
              {location.pathname === "/ticket/create" ? (
                <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
              ) : null}
            </div>
          )}
          <div className="relative h-full w-fit hover:text-white">
            <Link
              to={account.length !== 0 && "/account"}
              className="h-full flex items-center space-x-3 px-5"
              onClick={() => {
                connectWallet();
              }}
            >
              {account.length !== 0 && (
                <p>{`${account.slice(0, 5)} ... ${account.slice(-6)}`}</p>
              )}
              {account.length === 0 && <p>Connect wallet</p>}
              <Wallet />
            </Link>
            {location.pathname === "/account" ||
            location.pathname === "/account/setup" ||
            location.pathname === "/account/settings" ? (
              <span className="absolute h-1 w-full bottom-0 left-0 rounded-t-lg bg-primary"></span>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
