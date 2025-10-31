import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};

export const MessagesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await apiService.messages.getConversations();
      setUnreadCount(response.data.totalUnread || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      // Poll every 30 seconds for updates
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  const value = {
    unreadCount,
    setUnreadCount,
    refreshUnreadCount: fetchUnreadCount,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
