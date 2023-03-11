import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./App.css";

function App() {
  const [peerId, setpeerId] = useState(null);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerInstance = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentUserVideRef = useRef(null);

  useEffect(() => {
    console.log("ur peer id: " + peerId);
    console.log("remote peer id: " + remotePeerIdValue);
    const peer = new Peer();

    peer.on("open", (id) => {
      setpeerId(id);
    });

    peer.on("call", (call) => {
      if (call.metadata && call.metadata.callerPeerId != null) {
        setRemotePeerIdValue(call.metadata.callerPeerId);
      }

      var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        currentUserVideRef.current.srcObject = mediaStream;
        currentUserVideRef.current.onloadedmetadata = () => {
          currentUserVideRef.current.play();
        };
        call.answer(mediaStream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current.play();
          };
        });
      });
    });

    peerInstance.current = peer;
  }, []);

  const call = (remotePeerID) => {
    console.log("ur peer id: " + peerId);
    console.log("remote peer id: " + remotePeerID);

    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (mediaStream) => {
      currentUserVideRef.current.srcObject = mediaStream;
      currentUserVideRef.current.onloadedmetadata = () => {
        currentUserVideRef.current.play();
      };

      const call = peerInstance.current.call(remotePeerID, mediaStream, {
        metadata: {
          callerPeerId: peerId,
        },
      });
      call.on(
        "stream",
        (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current.play();
          };
          console.log("metadata:", call.metadata); // wyświetlenie obiektu metadata w konsoli
        },
        function (err) {
          console.log("Failed to get local stream", err);
        }
      );
    });
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    const audioTracks = currentUserVideRef.current.srcObject.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
  };

  const toggleCamera = () => {
    const tracks = currentUserVideRef.current.srcObject.getTracks();
    tracks.forEach((track) => {
      if (track.kind === "video") {
        track.enabled = !isCameraOff;
        setIsCameraOff(!isCameraOff);
      }
    });
  };

  const toggleScreenSharing = async () => {
    try {
      if (!isScreenSharing) {
        console.log("remote peer id in sharing: " + remotePeerIdValue);
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        currentUserVideRef.current.srcObject = stream;
        currentUserVideRef.current.play();

        const call = peerInstance.current.call(remotePeerIdValue, stream);

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });

        setIsScreenSharing(true);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        currentUserVideRef.current.srcObject = stream;
        currentUserVideRef.current.play();

        const call = peerInstance.current.call(remotePeerIdValue, stream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });

        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  return (
    <div className="App">
      <h1>Your current id is: {peerId}</h1>
      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
      />
      <button onClick={() => call(remotePeerIdValue)}>Call</button>
      <br />
      <>
        <button onClick={() => toggleAudio()}>
          {!audioEnabled ? "Disable Audio" : "Enable Audio"}
        </button>
        <button onClick={() => toggleCamera()}>
          {!isCameraOff ? "Turn on camera" : "Turn off camera"}
        </button>
        <button onClick={() => toggleScreenSharing()}>
          {!isScreenSharing ? "Share screen" : "Stop sharing screen"}
        </button>
      </>
      <div>
        <video preload="none" ref={remoteVideoRef} />
      </div>
      <div>
        <video preload="none" ref={currentUserVideRef} />
      </div>
    </div>
  );
}

export default App;
