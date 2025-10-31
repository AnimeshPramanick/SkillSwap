import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../contexts/SocketContext";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { format, isToday, isYesterday } from "date-fns";

const MessagesPage = () => {
  const { userId: selectedUserId } = useParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fetchingConversationsRef = useRef(false);

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

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("typing_start", handleTypingStart);
        socket.off("typing_stop", handleTypingStop);
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
      <div className="h-full flex overflow-hidden">
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
              <button className="p-2 hover:bg-neutral-100 rounded-lg">
                <EllipsisVerticalIcon className="w-5 h-5 text-neutral-600" />
              </button>
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
    </div>
  );
};

export default MessagesPage;
