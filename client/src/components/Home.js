import { React, useState } from "react";
import { Link } from "react-router-dom";
import { Tab } from "@headlessui/react";

import logo from "../assets/images/logo.png";

function Home() {
  return (
    <div className="fixed h-10/12 w-full flex justify-center text-white  bg-gradient-to-b from-indigo-500 to-background">
      <div className="h-full w-11/12 grid grid-cols-2">
        <div className="w-10/12 pr-2 pt-32 space-y-10 justify-self-end">
          <p className="text-5xl">Buy, sell, and discover exclusive tickets.</p>
          <p className="text-2xl text-text">
            Ticketplace is a ticket exchange website. that uses Blockchain
            technology to solve the problem of ticket fraud.
          </p>
          <Link to="/tickets" className="h-12 w-24 px-14 flex justify-center items-center rounded-lg font-bold text-black bg-primary">
            Explore
          </Link>
        </div>
        <div className="px-5 py-20 space-y-10 flex justify-center">
          <div className="h-96 w-96 rounded-full bg-white">
            <img src={logo} alt="Logo" className="scale-75" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
