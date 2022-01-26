import React from "react";
import QueryNavLink from "./QueryNavLink";

import { ReactComponent as Info } from "../assets/icons/info.svg";

function Home() {
  return (
    <div className="h-10/12 w-full flex justify-center text-white">
      <div className="h-full w-11/12 grid grid-cols-2">
        <div className="w-10/12 pr-2 pt-32 space-y-10 justify-self-end">
          <p className="text-5xl">Buy, sell, and discover exclusive tickets.</p>
          <p className="text-2xl text-text">
            Ticketplace is a ticket exchange website. that uses Blockchain
            technology to solve the problem of ticket fraud.
          </p>
          <button className="h-12 px-14 flex justify-center items-center rounded-lg font-bold text-black bg-primary">
            Explore
          </button>
        </div>
        <div className="px-5 py-10 space-y-10 bg-white">
          <div className="h-full w-full bg-black">
            <QueryNavLink
              to={`/tickets/1`}
              className="relative h-fit w-56 p-3 pb-10 space-y-3 rounded-lg shadow-lg float-right bg-modal-button"
            >
              <div className="h-64 w-full rounded-lg bg-white"></div>
              <div className="w-full flex flex-col items-start">
                <p className="text-text">Cat Radio</p>
                <div className="w-full flex justify-between items-center text-left">
                  <p className="w-10/12 truncate">LEO presents Cat Expo</p>
                  <Info />
                </div>
                <p className="text-lg">1.0 BNB</p>
              </div>
            </QueryNavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
