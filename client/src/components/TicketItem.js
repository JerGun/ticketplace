import React from "react";

import { ReactComponent as Price } from "../assets/price.svg";
import { ReactComponent as Binance } from "../assets/binance.svg";

function TicketItem() {
  return (
    <div className="h-fit w-full p-10 bg-background">
      <div className="h-full mx-28 text-white">
        <div className="h-full w-full flex space-x-5">
          <div className="w-3/12 space-y-5">
            <div className="h-80 w-full rounded-xl bg-white"></div>
            <div className="h-fit w-full flex justify-between items-center py-3 px-3 rounded-lg bg-input">
              <p>Token ID</p>
              <p>383641...45654</p>
            </div>
            <div className="h-fit w-full py-3 px-3 space-y-3 rounded-lg bg-input">
              <div className="flex items-center space-x-3">
                <Price />
                <p>Price</p>
              </div>
              <div className="flex space-x-5">
                <Binance />
                <p className="text-4xl font-bold">1.0 BNB</p>
              </div>
              <button className="h-11 w-full flex justify-center items-center rounded-lg font-bold text-black bg-primary">
                Buy for 1.0 BNB
              </button>
            </div>
          </div>
          <div className="w-full space-y-10 bg-red-200">
            <p className="text-3xl">LEO presents Cat Expo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketItem;
