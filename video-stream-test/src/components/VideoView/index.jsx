import React, { useEffect, useRef } from "react";
import { Client, LocalStream } from "ion-sdk-js";
import { IonSFUJSONRPCSignal } from "ion-sdk-js/lib/signal/json-rpc-impl";
import { v4 as uuidv4 } from "uuid";

const SFUAddress = process.env.REACT_APP_SFU_ADDRESS;

export default function VideoView(props) {
  const subVideo = useRef();
  const pubVideo = useRef();
  const config = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun.stunprotocol.org:3478",
      },
    ],
  };

  let client, signal = null;
  let streams = {};
  signal = new IonSFUJSONRPCSignal(SFUAddress);

  client = new Client(signal, config);
  signal.onopen = () => client.join(props.roomName, uuidv4());

  var doOnce = false;
  useEffect(() => {
    if (!doOnce) {
      client.ontrack = (track, stream) => {
        console.log("got track:", track.id, "kind:", track.kind, "for stream:", stream.id);
        if (!streams[stream.id]) {
          subVideo.current.srcObject = stream;
          subVideo.current.autoplay = true;
          stream.onremovetrack = () => {
            subVideo.current.srcObject = null;
          };
        }
        track.onunmute = () => {
          if (track.kind === "audio") {
            subVideo.current.muted = false;
          } else {
            subVideo.current.srcObject = stream;
            subVideo.current.autoplay = true;
          }
        };
      };
      start(true);
      doOnce = true;
    }
  }, []);

  window.onunload = async () => {
    if (client) client.close();
  };


  const start = (event) => {
    if (event) {
      LocalStream.getUserMedia({
        resolution: "vga",
        audio: true,
        codec: "vp8",
        simulcast: false,
      })
        .then((media) => {
          pubVideo.current.srcObject = media;
          pubVideo.current.autoplay = true;
          pubVideo.current.muted = true;
          client.publish(media);
        })
        .catch(console.error);
    } else {
      LocalStream.getDisplayMedia({
        resolution: "vga",
        video: true,
        audio: true,
        codec: "vp8",
        simulcast: false,
      })
        .then((media) => {
          pubVideo.current.srcObject = media;
          pubVideo.current.autoplay = true;
          pubVideo.current.muted = true;
          client.publish(media);
        })
        .catch(console.error);
    }
  };
  window.onunload = async () => {
    if (client) client.close();
  };

  return (
    <div>
      <div >
        <video
          id="pubVideo"
          className="bg-black"
          ref={pubVideo}
          style={
            {
              width: 500,
              position: "relative",
              overflow: "hidden",
            }
          }
        />
      </div>
      <div >
        <video
          id="subVideo"
          className="bg-black"
          ref={subVideo}
          autoPlay
          playsInline
          muted={true}
          style={
            {
              width: 500,
              position: "relative",
              overflow: "hidden",
            }
          }
        />
      </div>
    </div>
  );
}
