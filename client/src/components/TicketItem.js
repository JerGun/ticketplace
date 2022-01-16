import React from "react";

import { ReactComponent as Price } from "../assets/price.svg";
import { ReactComponent as Binance } from "../assets/binance.svg";
import { ReactComponent as External } from "../assets/external.svg";
import { ReactComponent as Share } from "../assets/share.svg";
import { ReactComponent as Description } from "../assets/description.svg";
import { ReactComponent as Location } from "../assets/location.svg";
import { ReactComponent as Calendar } from "../assets/calendar.svg";
import { ReactComponent as Clock } from "../assets/clock.svg";
import { ReactComponent as History } from "../assets/history.svg";

function TicketItem() {
  return (
    <div className="h-fit w-full p-10 bg-background">
      <div className="h-full mx-28 text-white">
        <div className="h-full w-full flex space-x-5">
          <div className="w-3/12 space-y-5">
            <div className="h-80 w-full rounded-xl bg-white"></div>
            <div className="h-fit w-full flex justify-between items-center p-3 rounded-lg bg-input">
              <p>Token ID</p>
              <p>383641...45654</p>
            </div>
            <div className="h-fit w-full p-3 space-y-3 rounded-lg bg-input">
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
          <div className="w-full pr-40 space-y-5">
            <div className="w-full space-y-1">
              <div className="w-full flex justify-between items-center">
                <p className="text-3xl">LEO presents Cat Expo</p>
                <div className="flex space-x-5">
                  <button className="h-11 w-11 flex justify-center items-center rounded-lg bg-input">
                    <External />
                  </button>
                  <button className="h-11 w-11 flex justify-center items-center rounded-lg bg-input">
                    <Share />
                  </button>
                </div>
              </div>
              <div className="flex text-sm space-x-1">
                <p className="text-text">Organized by </p>
                <p className="text-primary">Cat Radio</p>
              </div>
              <div className="flex text-sm space-x-1">
                <p className="text-text">Owned by</p>
                <p>0x4e...06C7</p>
              </div>
            </div>
            <div className="h-fit w-full p-5 rounded-lg bg-input">
              <div className="max-h-72 space-y-3 overflow-auto">
                <div className="flex items-center space-x-3">
                  <Description />
                  <p>Description</p>
                </div>
                <div className="">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Quisque sodales, neque in ullamcorper ultrices, eros erat
                  venenatis libero, quis accumsan libero augue in libero.
                  Pellentesque sollicitudin eu tortor quis fermentum.Lorem ipsum
                  dolor sit amet, consectetur adipiscing elit. Quisque sodales,
                  neque in ullamcorper ultrices, eros erat venenatis libero,
                  quis accumsan libero augue in libero. Pellentesque
                  sollicitudin eu tortor quis fermentum.Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit. Quisque sodales, neque in
                  ullamcorper ultrices, eros erat venenatis libero, quis
                  accumsan libero augue in libero. Pellentesque sollicitudin eu
                  tortor quis fermentum.Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Quisque sodales, neque in ullamcorper
                  ultrices, eros erat venenatis libero, quis accumsan libero
                  augue in libero. Pellentesque sollicitudin eu tortor quis
                  fermentum.Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit. Quisque sodales, neque in ullamcorper ultrices, eros
                  erat venenatis libero, quis accumsan libero augue in libero.
                </div>
              </div>
            </div>
            <div className="h-fit w-full p-5 space-y-3 rounded-lg bg-input">
              <div className="flex items-center space-x-3">
                <Location className="mx-1" />
                <p>Centralplaza Chiangmai Airport</p>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="scale-75" />
                <p>16/05/2021</p>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="scale-75" />
                <div className="flex space-x-2">
                  <p>15:00</p>
                  <p>-</p>
                  <p>18:00</p>
                </div>
              </div>
            </div>
            <div className="h-fit w-full p-5 space-y-3 rounded-lg bg-input">
              <div className="flex items-center space-x-3">
                <History />
                <p>History</p>
              </div>
              <div className="flex space-x-1 text-text">
                <p>Listed for</p>
                <p className="text-white">1.0 BNB</p>
                <p>by</p>
                <p className="text-white">0x4e...06C7 </p>
                <p>on 16/03/2021 - 15:46</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketItem;
