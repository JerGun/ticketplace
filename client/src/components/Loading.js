import React from "react";
import * as loadingData from "../assets/loading.json";
import FadeIn from "react-fade-in";
import { Player } from "@lottiefiles/react-lottie-player";

function Loading() {
  return (
    <FadeIn>
      <div>
        <Player
          autoplay
          loop
          src={loadingData.default}
          style={{ height: "150px", width: "150px" }}
        />
      </div>
    </FadeIn>
  );
}

export default Loading;
