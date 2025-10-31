import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../contexts/SocketContext";
import { useMessages } from "../contexts/MessagesContext";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import SimplePeer from "simple-peer";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import VideoCallModal from "../components/ui/VideoCallModal";
import ScheduleSessionModal from "../components/ui/ScheduleSessionModal";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  TrashIcon,
  CalendarIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { format, isToday, isYesterday } from "date-fns";

const MessagesPage = () => {
  const { userId: selectedUserId } = useParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { refreshUnreadCount } = useMessages();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [peer, setPeer] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fetchingConversationsRef = useRef(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      fetchUserProfile(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on("new_message", handleNewMessage);
      socket.on("typing_start", handleTypingStart);
      socket.on("typing_stop", handleTypingStop);
      socket.on("incoming_call", handleIncomingCall);
      socket.on("call_accepted", handleCallAccepted);
      socket.on("call_rejected", handleCallRejected);
      socket.on("call_ended", handleCallEnded);
      socket.on("ice_candidate", handleIceCandidate);
      socket.on("call_signal", handleCallSignal);

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("typing_start", handleTypingStart);
        socket.off("typing_stop", handleTypingStop);
        socket.off("incoming_call", handleIncomingCall);
        socket.off("call_accepted", handleCallAccepted);
        socket.off("call_rejected", handleCallRejected);
        socket.off("call_ended", handleCallEnded);
        socket.off("ice_candidate", handleIceCandidate);
        socket.off("call_signal", handleCallSignal);
      };
    }
  }, [socket, isConnected, selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    // Prevent duplicate fetches
    if (fetchingConversationsRef.current) return;

    try {
      fetchingConversationsRef.current = true;
      setLoading(true);
      const response = await apiService.messages.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Only show toast once, not repeatedly
      if (!error.isShown) {
        error.isShown = true;
        toast.error("Failed to load conversations");
      }
    } finally {
      setLoading(false);
      fetchingConversationsRef.current = false;
    }
  };

  const fetchMessages = async (userId) => {
    try {
      console.log(`[DEBUG] Fetching messages for user: ${userId}`);
      const response = await apiService.messages.getConversation(userId);
      console.log(`[DEBUG] Received response:`, response.data);
      console.log(`[DEBUG] Messages count:`, response.data.messages?.length);
      setMessages(response.data.messages || []);
      // Mark as read
      await apiService.messages.markAsRead(userId);
      // Refresh conversations to update unread count
      fetchConversations();
      // Refresh global unread count for navbar badge
      refreshUnreadCount();
    } catch (error) {
      console.error("Error fetching messages:", error);
      console.error("Error details:", error.response?.data);
      // Don't show toast error repeatedly
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await apiService.users.getProfile(userId);
      setSelectedUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleNewMessage = (message) => {
    console.log("Received new message:", message);
    console.log("Current user:", user);
    console.log("Selected user ID:", selectedUserId);

    const currentUserId = user?.uid || user?.id;

    if (
      message.senderId === selectedUserId ||
      message.recipientId === currentUserId
    ) {
      setMessages((prev) => [...prev, message]);
      // Mark as read if conversation is open
      if (message.senderId === selectedUserId) {
        apiService.messages.markAsRead(selectedUserId).catch((err) => {
          console.error("Error marking as read:", err);
        });
      }
    }
    // Update conversations list
    fetchConversations();
    // Refresh global unread count for navbar badge
    refreshUnreadCount();
  };

  const handleTypingStart = ({ userId }) => {
    if (userId === selectedUserId) {
      setIsTyping(true);
    }
  };

  const handleTypingStop = ({ userId }) => {
    if (userId === selectedUserId) {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId || sending) return;

    try {
      setSending(true);
      const response = await apiService.messages.sendMessage({
        recipientId: selectedUserId,
        content: messageText.trim(),
        type: "text",
      });

      // Add message to local state
      setMessages((prev) => [...prev, response.data.message]);
      setMessageText("");

      // Stop typing indicator
      if (socket) {
        socket.emit("typing_stop", { recipientId: selectedUserId });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (!socket || !selectedUserId) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socket.emit("typing_start", { recipientId: selectedUserId });

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { recipientId: selectedUserId });
    }, 2000);
  };

  const handleSelectConversation = (userId) => {
    navigate(`/messages/${userId}`);
  };

  // Menu handlers
  const handleDeleteConversation = async () => {
    try {
      await apiService.messages.deleteConversation(selectedUserId);
      toast.success("Conversation deleted");
      setShowDeleteConfirm(false);
      setShowMenu(false);
      navigate("/messages");
      fetchConversations();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleScheduleSession = () => {
    setShowMenu(false);
    setShowScheduleModal(true);
  };

  const handleInstantMeeting = async () => {
    try {
      setShowMenu(false);

      // Create instant meeting session
      await apiService.sessions.createInstantMeeting(selectedUserId);

      // Initiate call
      initiateCall();

      toast.success("Starting instant meeting...");
    } catch (error) {
      console.error("Error starting instant meeting:", error);
      toast.error("Failed to start meeting");
    }
  };

  // Video call handlers
  const initiateCall = async () => {
    try {
      console.log("Initiating call to:", selectedUserId);

      // Get media stream FIRST before creating peer
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Got media stream before peer creation:", stream);

      const newPeer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream, // Pass stream directly
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      newPeer.on("signal", (data) => {
        console.log("=== SENDING CALL ===");
        console.log("Sending call signal to:", selectedUserId);
        console.log("Caller ID:", user.uid || user.id);
        console.log("Caller name:", user.profile?.name || user.username);
        socket.emit("call_user", {
          recipientId: selectedUserId,
          signalData: data,
          from: user.uid || user.id,
          name: user.profile?.name || user.username,
        });
        console.log("Call signal sent successfully");
      });

      newPeer.on("stream", (remoteStream) => {
        console.log("Initiator received remote stream");
      });

      newPeer.on("error", (err) => {
        console.error("Peer error:", err);
        // Don't destroy on certain errors that are recoverable
        if (err.message && err.message.includes("Ice connection failed")) {
          console.log("ICE connection issue, but keeping peer alive");
        } else {
          toast.error("Call connection failed: " + err.message);
          setShowVideoCall(false);
          setPeer(null);
          // Stop tracks
          stream.getTracks().forEach((track) => track.stop());
        }
      });

      newPeer.on("close", () => {
        console.log("Peer closed");
        setShowVideoCall(false);
        setPeer(null);
        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      });

      setPeer(newPeer);
      setShowVideoCall(true);
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Failed to access camera/microphone");
    }
  };

  const handleIncomingCall = ({ from, name, signal }) => {
    console.log("=== INCOMING CALL RECEIVED ===");
    console.log("From:", from);
    console.log("Name:", name);
    console.log("Signal:", signal);
    console.log("Current user:", user?.uid || user?.id);
    console.log("Setting incomingCall state...");
    setIncomingCall({ from, name, signal });
    toast("📞 Incoming call from " + name);
  };

  const acceptCall = async () => {
    try {
      console.log("Accepting call from:", incomingCall.from);

      // Get media stream FIRST before creating peer
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Got media stream before peer creation:", stream);

      const newPeer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream, // Pass stream directly
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      newPeer.on("signal", (data) => {
        console.log("Sending accept signal");
        socket.emit("accept_call", {
          signal: data,
          to: incomingCall.from,
        });
      });

      newPeer.on("stream", (remoteStream) => {
        console.log("Accepter received remote stream");
      });

      newPeer.on("error", (err) => {
        console.error("Peer error:", err);
        toast.error("Call connection failed: " + err.message);
        setShowVideoCall(false);
        setPeer(null);
        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      });

      newPeer.on("close", () => {
        console.log("Peer closed");
        setShowVideoCall(false);
        setPeer(null);
        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      });

      console.log("Signaling peer with incoming data");
      newPeer.signal(incomingCall.signal);
      setPeer(newPeer);
      setShowVideoCall(true);
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to access camera/microphone");
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    socket.emit("reject_call", { to: incomingCall.from });
    setIncomingCall(null);
    toast("Call rejected");
  };

  const handleCallAccepted = ({ signal }) => {
    console.log("Call accepted, signaling peer with response");
    if (peer && !peer.destroyed) {
      try {
        peer.signal(signal);
        console.log("Successfully signaled peer with accept response");
      } catch (err) {
        console.error("Error signaling peer:", err);
      }
    } else {
      console.error("Cannot signal - peer is", peer ? "destroyed" : "null");
    }
  };

  const handleCallRejected = () => {
    toast.error("Call was rejected");
    if (peer) {
      // Get the stream before destroying peer
      if (peer.streams && peer.streams.length > 0) {
        peer.streams[0].getTracks().forEach((track) => track.stop());
      }
      if (!peer.destroyed) {
        peer.destroy();
      }
    }
    setPeer(null);
    setShowVideoCall(false);
  };

  const handleCallEnded = () => {
    toast("Call ended");
    if (peer) {
      // Get the stream before destroying peer
      if (peer.streams && peer.streams.length > 0) {
        peer.streams[0].getTracks().forEach((track) => track.stop());
      }
      if (!peer.destroyed) {
        peer.destroy();
      }
    }
    setPeer(null);
    setShowVideoCall(false);
  };

  const handleIceCandidate = ({ candidate }) => {
    if (peer) {
      peer.signal(candidate);
    }
  };

  const handleCallSignal = ({ signal }) => {
    if (peer) {
      peer.signal(signal);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const formatMessageDate = (date) => {
    if (!date) return "";

    try {
      const messageDate = new Date(date);
      if (isNaN(messageDate.getTime())) return "";

      if (isToday(messageDate)) {
        return format(messageDate, "h:mm a");
      } else if (isYesterday(messageDate)) {
        return "Yesterday";
      } else {
        return format(messageDate, "MMM d");
      }
    } catch (error) {
      return "";
    }
  };

  const formatMessageTime = (date) => {
    if (!date) return "";

    try {
      const messageDate = new Date(date);
      if (isNaN(messageDate.getTime())) return "";

      return format(messageDate, "h:mm a");
    } catch (error) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-16 bg-neutral-50">
      <div className="h-full flex overflow-hidden border-t border-neutral-200">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              Messages
            </h2>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const otherUser = conv.participant || {};
                const isSelected = selectedUserId === otherUser.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(otherUser.id)}
                    className={`w-full p-4 flex items-start space-x-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${
                      isSelected ? "bg-primary-50" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="avatar avatar-md relative flex-shrink-0">
                      {otherUser.profile?.avatar ? (
                        <img
                          src={otherUser.profile.avatar}
                          alt={otherUser.profile?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-500 font-semibold">
                            {(
                              otherUser.profile?.name ||
                              otherUser.username ||
                              "U"
                            ).charAt(0)}
                          </span>
                        </div>
                      )}
                      {otherUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-neutral-900 truncate">
                          {otherUser.profile?.name || otherUser.username}
                        </span>
                        {conv.lastMessage && conv.lastMessage.timestamp && (
                          <span className="text-xs text-neutral-500">
                            {formatMessageDate(conv.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-600 truncate flex-1">
                          {conv.lastMessage?.content ||
                            conv.lastMessage?.message ||
                            "Start a conversation"}
                        </p>
                      </div>
                    </div>

                    {/* Unread Badge */}
                    {conv.unreadCount > 0 && (
                      <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUserId && selectedUser ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="avatar avatar-md relative">
                  {selectedUser.profile?.avatar ? (
                    <img
                      src={selectedUser.profile.avatar}
                      alt={selectedUser.profile?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-500 font-semibold">
                        {(
                          selectedUser.profile?.name ||
                          selectedUser.username ||
                          "U"
                        ).charAt(0)}
                      </span>
                    </div>
                  )}
                  {selectedUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {selectedUser.profile?.name || selectedUser.username}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {selectedUser.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <EllipsisVerticalIcon className="w-5 h-5 text-neutral-600" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-10">
                    <button
                      onClick={handleScheduleSession}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-3"
                    >
                      <CalendarIcon className="w-5 h-5 text-neutral-500" />
                      <span>Schedule Session</span>
                    </button>
                    <button
                      onClick={handleInstantMeeting}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-3"
                    >
                      <VideoCameraIcon className="w-5 h-5 text-neutral-500" />
                      <span>Instant Meeting</span>
                    </button>
                    <hr className="my-2 border-neutral-200" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                      <span>Delete Conversation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const currentUserId = user?.uid || user?.id;
                const isOwn = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${
                        isOwn
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-200 text-neutral-900"
                      }`}
                    >
                      <p className="text-sm">
                        {message.content || message.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-primary-100" : "text-neutral-500"
                        }`}
                      >
                        {formatMessageTime(
                          message.timestamp || message.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-200 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-neutral-200 p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <PhotoIcon className="w-6 h-6 text-neutral-600" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="input flex-1"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="btn btn-primary"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-h3 mb-2">Select a conversation</h3>
              <p className="text-neutral-600">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Delete Conversation?
            </h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete this conversation with{" "}
              {selectedUser?.profile?.name || selectedUser?.username}? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        recipientId={selectedUserId}
        recipientName={selectedUser?.profile?.name || selectedUser?.username}
      />

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => {
          setShowVideoCall(false);
          if (peer) {
            peer.destroy();
            setPeer(null);
          }
        }}
        peer={peer}
        remoteUserId={selectedUserId}
        remoteUserName={selectedUser?.profile?.name || selectedUser?.username}
        isInitiator={true}
      />

      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed top-20 right-4 z-50 bg-white rounded-lg shadow-xl border border-neutral-200 p-6 w-80">
          <div className="flex items-center space-x-3 mb-4">
            <VideoCameraIcon className="w-8 h-8 text-primary-500 animate-pulse" />
            <div>
              <h4 className="font-bold text-neutral-900">Incoming Call</h4>
              <p className="text-sm text-neutral-600">{incomingCall.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={rejectCall}
              className="flex-1 btn bg-red-500 hover:bg-red-600 text-white"
            >
              Decline
            </button>
            <button onClick={acceptCall} className="flex-1 btn btn-primary">
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
