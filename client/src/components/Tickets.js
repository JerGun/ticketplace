import { React, Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Scrollbars } from "react-custom-scrollbars";

import { ReactComponent as Info } from "../assets/info.svg";

const listOption = [
  { title: "Recently Listed", value: "recently" },
  { title: "Oldest", value: "oldest" },
  { title: "Price: High to Low", value: "high" },
  { title: "Price: Low to High", value: "low" },
];

function Tickets() {
  const [sortBy, setSortBy] = useState(listOption[0]);

  const handleChange = (event) => {
    let { value } = event.target;
    value = !!value && Math.abs(value) >= 0 ? Math.abs(value) : null;
  };

  return (
    <div className="h-full w-full flex text-white bg-background">
      <div className="h-full w-2/12 p-5 space-y-10 flex flex-col items-center shadow-lg bg-modal-button">
        <div className="w-full space-y-3">
          <p className="w-full text-2xl font-bold">Sort by</p>
          <Listbox value={sortBy} onChange={setSortBy}>
            <div className="w-full relative inline-block rounded-lg shadow-lg bg-hover hover:bg-hover-light">
              <Listbox.Button className="h-11 w-full inline-flex px-3 items-center space-x-3 text-white rounded-lg">
                {<p>{sortBy.title}</p>}
              </Listbox.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options className="absolute w-full mt-3 p-1 bg-white rounded-xl shadow-lg">
                  {listOption?.map((item, i) => (
                    <Listbox.Option key={i} value={item}>
                      {({ active }) => (
                        <button
                          className={`
                                    ${
                                      active && "bg-background"
                                    } group flex rounded-xl items-center space-x-5 w-full px-5 py-2 text-lg`}
                        >
                          <div className="flex flex-col items-start">
                            <p className={active ? "text-white" : "text-input"}>
                              {item.title}
                            </p>
                          </div>
                        </button>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        <div className="w-full space-y-3">
          <p className="text-2xl font-bold">Min Price</p>
          <div className="h-11 w-full space-x-3 px-3 flex items-center rounded-lg shadow-lg bg-hover hover:bg-hover-light focus-within:bg-hover-light">
            <input
              type="number"
              placeholder="1"
              min="1"
              onChange={handleChange}
              className="h-full w-full bg-transparent"
            />
          </div>
        </div>
        <div className="w-full space-y-3">
          <p className="text-2xl font-bold">Max Price</p>
          <div className="h-11 w-full space-x-3 px-3 flex items-center rounded-lg shadow-lg bg-hover hover:bg-hover-light focus-within:bg-hover-light">
            <input
              type="number"
              placeholder="1"
              min="1"
              onChange={handleChange}
              className="h-full w-full bg-transparent"
            />
          </div>
        </div>
      </div>
      <div className="h-ful w-10/12 p-10 space-x-10 flex flex-wrap">
        {[...Array(4)].map((x, i) => (
          <div
            key={i}
            className="h-96 w-60 p-3 flex flex-col space-y-3 rounded-lg shadow-lg bg-modal-button"
          >
            <div className="h-full w-full rounded-lg bg-white"></div>
            <div className="flex justify-between">
              <div>
                <p>Cat Radio</p>
                <p>LEO presents Cat Expo</p>
                <p>1.0 BNB</p>
              </div>
              <Info />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tickets;
