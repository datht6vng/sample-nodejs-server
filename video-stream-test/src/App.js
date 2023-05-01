import React, { useEffect, useRef } from "react";
import logo from './logo.svg';
import './App.css';
import VideoView from "./components/VideoView"
function App() {
  return (
    <div className="App">
      <VideoView
        roomName="rtsp://tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2"
      />
    </div>
  );
}

export default App;
