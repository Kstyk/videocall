import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./App.css";

function App() {
  const [peerId, setpeerId] = useState(null);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");

  const peerInstance = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentUserVideRef = useRef(null);

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setpeerId(id);
    });

    peer.on("call", (call) => {
      var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        currentUserVideRef.current.srcObject = mediaStream;
        currentUserVideRef.current.play();

        call.answer(mediaStream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      });
    });

    peerInstance.current = peer;
  }, []);

  const call = (remotePeerID) => {
    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (mediaStream) => {
      currentUserVideRef.current.srcObject = mediaStream;
      currentUserVideRef.current.play();

      const call = peerInstance.current.call(remotePeerID, mediaStream);
      call.on(
        "stream",
        (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        },
        function (err) {
          console.log("Failed to get local stream", err);
        }
      );
    });
  };

  console.log(peerId);

  return (
    <div className="App">
      <h1>Your current id is: {peerId}</h1>
      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
      />
      <button onClick={() => call(remotePeerIdValue)}>Call</button>
      <div>
        <video ref={currentUserVideRef} />
      </div>
      <div>
        <video ref={remoteVideoRef} />
      </div>
    </div>
  );
}

export default App;
