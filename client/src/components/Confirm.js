import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useParams } from "react-router-dom";

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
    <div className="h-full w-full">
      {confirming ? (
        <div>No</div>
      ) : (
        // <Link to="/">
        //   <Spinner size="8x" spinning={""} />
        // </Link>
        <div>yay</div>
      )}
    </div>
  );
}
export default Confirm;
