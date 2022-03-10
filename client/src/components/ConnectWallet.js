import React, { useState } from "react";
import { connectWallet, getAccount } from "../services/Web3";

import { ReactComponent as MetaMask } from "../assets/icons/metamask.svg";

function ConnectWallet() {
  const [account, setAccount] = useState("");

  const connect = async () => {
    if (account.length === 0) {
      const connectAccount = await connectWallet();
      if (connectAccount) {
        setAccount(connectAccount);
      }
    }
  };

  return (
    <div className="h-full w-full flex justify-center">
      <div className="w-1/2 text-white">
        <div className="py-10 space-y-2">
          <p className="text-3xl font-bold ">Connect your wallet.</p>
          <p className="text-lg text-text">
            Connect with one of our available wallet providers or create a new
            one.
          </p>
        </div>
        <button
          className="w-full flex items-center space-x-5 p-1 rounded-lg border-2 border-black border-opacity-30 hover:bg-hover"
          onClick={connect}
        >
          <MetaMask className="scale-75" />
          <p>MetaMask</p>
        </button>
      </div>
    </div>
  );
}

export default ConnectWallet;
