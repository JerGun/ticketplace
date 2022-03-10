import React from "react";

function ConnectWallet() {
  return (
    <div className="h-full w-full flex justify-center">
      <div className="w-1/2 text-white">
        <div className="py-5 space-y-2">
          <p className="text-3xl font-bold ">Connect your wallet.</p>
          <p className="text-lg text-text">
            Connect with one of our available wallet providers or create a new
            one.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConnectWallet;
