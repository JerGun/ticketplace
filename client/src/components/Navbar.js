import React from "react";

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
          className="h-1/3 w-full bg-transparent"
        />
      </div>
      <div className="col-span-3 space-x-5 flex justify-end px-5">
        <button>Explore</button>
        <button className="flex items-center space-x-3 border-l pl-5">
          {accounts.length !== 0 && <p>{accounts}</p>}
          {accounts.length === 0 && <p>Connect wallet</p>}
          <Wallet />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
