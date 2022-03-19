import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useParams } from "react-router-dom";

import { ReactComponent as ConfirmIcon } from "../assets/icons/confirm.svg";

function Confirm() {
  const [confirming, setConfirming] = useState(true);
  const { id } = useParams();

  useEffect(async () => {
    await axios
      .get(`${API_URL}/email/confirm/${id}`)
      .then((response) => {
        setConfirming(false);
        console.log(response.data.msg);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="fixed h-full w-full p-20 flex justify-center text-white bg-background">
      {confirming ? (
        <div className="h-full w-1/2 flex flex-col items-center space-y-10">
          <p className="text-2xl font-bold">
            There was an issue verifying your email.
          </p>
          <p className="text-lg text-text">
            Perhaps you've changed your Ticketplace email since you received
            this email. Please check your email address for a more recent
            verification email or navigate to your Account Settings page to
            request a new verification email.
          </p>
          <a
            href="/#/account/settings"
            type="submit"
            className="h-11 w-fit px-10 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
          >
            Go to Account Settings
          </a>
        </div>
      ) : (
        <div className="h-full w-1/2 flex flex-col items-center space-y-10">
          <ConfirmIcon />
          <p className="text-2xl font-bold">Your email has been verified!</p>
          <a
            href="/#/event/create"
            className="h-11 w-fit px-10 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
          >
            Back to Ticketplace
          </a>
        </div>
      )}
    </div>
  );
}
export default Confirm;
