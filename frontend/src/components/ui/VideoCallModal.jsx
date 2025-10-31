import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import {
  PhoneXMarkIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../hooks/useAuth";

const VideoCallModal = ({
  isOpen,
  onClose,
  peer,
  remoteUserId,
  remoteUserName,
  isInitiator,
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const draggableRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting");
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 280,
    y: 80,
  }); // Initial position (top-right with margins)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const startCall = async () => {
      try {
        console.log("Starting call setup...");
        console.log("Peer object:", peer);
        console.log("Is initiator:", isInitiator);

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("Got local stream:", stream);
        console.log("Stream tracks:", stream.getTracks());
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("Set local video srcObject");
        }

        if (peer) {
          console.log("Adding stream to peer");
          console.log("Peer destroyed?", peer.destroyed);

          // Add stream to peer
          try {
            peer.addStream(stream);
            console.log("Stream added successfully");
          } catch (err) {
            console.error("Error adding stream:", err);
          }

          // Handle remote stream
          peer.on("stream", (remoteStream) => {
            console.log("Received remote stream:", remoteStream);
            console.log("Remote stream tracks:", remoteStream.getTracks());
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              console.log("Set remote video srcObject");
              // Force video to play
              remoteVideoRef.current.play().catch((err) => {
                console.error("Error playing remote video:", err);
              });
            }
            setHasRemoteStream(true);
            setCallStatus("connected");
          });

          peer.on("error", (err) => {
            console.error("Peer error:", err);
            setCallStatus("error");
          });

          peer.on("close", () => {
            console.log("Peer connection closed");
            handleEndCall();
          });

          peer.on("connect", () => {
            console.log("Peer connected");
            // Don't set to connected until we have remote stream
          });
        } else {
          console.error("No peer object provided");
          setCallStatus("error");
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Could not access camera/microphone. Please check permissions.");
        setCallStatus("error");
      }
    };

    startCall();

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, peer]);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    if (socket) {
      socket.emit("call_ended", { remoteUserId });
    }
    onClose();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Drag handlers for PIP window
  const handleMouseDown = (e) => {
    if (draggableRef.current) {
      setIsDragging(true);
      const rect = draggableRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Add boundaries to keep window within viewport with margins
      const margin = 20;
      const maxX = window.innerWidth - 224 - margin; // 224px is w-56
      const maxY = window.innerHeight - 160 - margin - 96; // 160px is h-40, 96px is controls height

      setPosition({
        x: Math.max(margin, Math.min(newX, maxX)),
        y: Math.max(margin, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote Video (Main) */}
      <div className="flex-1 relative bg-gray-900">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Show placeholder when no remote stream */}
        {!hasRemoteStream && callStatus === "connected" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <UserCircleIcon className="w-32 h-32 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Waiting for {remoteUserName}'s video...</p>
            </div>
          </div>
        )}

        {callStatus === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Connecting to {remoteUserName}...</p>
            </div>
          </div>
        )}

        {callStatus === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <p className="text-lg mb-2">Call failed</p>
              <p className="text-sm text-gray-300 mb-4">
                Please check camera/microphone permissions and try again
              </p>
              <button onClick={handleEndCall} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Local Video (Picture in Picture) - Draggable */}
        <div
          ref={draggableRef}
          onMouseDown={handleMouseDown}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          className="absolute w-56 h-40 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700"
        >
          {isVideoOff ? (
            // Show profile picture when camera is off
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <UserCircleIcon className="w-24 h-24 text-white opacity-80" />
              )}
            </div>
          ) : (
            // Show video when camera is on
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}
          {/* Drag indicator */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-500 rounded-full opacity-50"></div>
        </div>

        {/* User Info */}
        <div className="absolute top-6 left-6 bg-black bg-opacity-70 text-white px-5 py-3 rounded-xl shadow-lg">
          <p className="text-base font-semibold">{remoteUserName}</p>
          <p className="text-xs text-gray-300 capitalize">{callStatus}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 py-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="w-6 h-6 text-white" />
            ) : (
              <MicrophoneIcon className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isVideoOff ? (
              <VideoCameraSlashIcon className="w-6 h-6 text-white" />
            ) : (
              <VideoCameraIcon className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            <PhoneXMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
