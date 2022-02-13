import React from "react";
import * as loadingData from "../assets/loading.json";
import FadeIn from "react-fade-in";
import { Player } from "@lottiefiles/react-lottie-player";

function Loading({ loading }) {
  return (
    <FadeIn>
      {/* {
        loading && (
            <Player
              autoplay={false}
              loop={true}
              controls={true}
              animationData={loadingData.default}
              style={{ height: "300px", width: "300px" }}
            ></Player>
          
        )
        : (
          <Lottie options={defaultOptions2} height={140} width={140} />
        )
      } */}
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
