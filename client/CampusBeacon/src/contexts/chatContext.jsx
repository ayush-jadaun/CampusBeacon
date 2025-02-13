import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ChatContextProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [userProfiles, setUserProfiles] = useState({});

  const fetchUserProfile = async (userId) => {
    try {
      const response = await api.get(`/api/users/user/${userId}`);

      if (response.data.success) {
        setUserProfiles((prev) => ({
          ...prev,
          [userId]: response.data.data.user,
        }));
        return response.data.data.user;
      }
    } catch (error) {
      console.error(`Failed to fetch user profile for ${userId}:`, error);
    }
    return null;
  };

  const fetchMessages = async (channelId) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/chat/channels/${channelId}/messages`
      );

      // Extract unique userIds from messages
      const userIds = [...new Set(data.data.map((msg) => msg.userId))];

      // Fetch details for users not yet stored
      const uncachedUserIds = userIds.filter((id) => !userProfiles[id]);
      await Promise.all(uncachedUserIds.map(fetchUserProfile));

      // Set messages after fetching user details
      setMessages(data.data.reverse());
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleSocketRequest = () => {
      socket.on("connect", () => {
        console.log("Socket connected, fetching channels...");
        fetchChannels();
      });

      socket.on("channel-update", () => {
        console.log("Channel update received, refreshing channels...");
        fetchChannels();
      });

      socket.on("message-update", () => {
        if (currentChannel) {
          console.log("Message update received, refreshing messages...");
          fetchMessages(currentChannel);
        }
      });
    };

    handleSocketRequest();

    return () => {
      socket.off("connect");
      socket.off("channel-update");
      socket.off("message-update");
    };
  }, [socket, currentChannel]);

  useEffect(() => {
    if (user?.id) {
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setError("Failed to connect to chat server");
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (message) => {
      console.log("Received new message from socket:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message-deleted", (messageId) => {
      console.log("Received message deletion event from socket:", messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    });

    socket.on("user-typing", ({ userId }) => {
      console.log("User typing event received for user:", userId);
      setTypingUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user-stop-typing", ({ userId }) => {
      console.log("User stop typing event received for user:", userId);
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socket.off("new-message");
      socket.off("message-deleted");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [socket, currentChannel]);

  const fetchChannels = async () => {
    try {
      const { data } = await api.get("/api/chat/channels");
      setChannels(data.data);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to fetch channels");
    }
  };

  const sendMessage = async (content) => {
    if (!currentChannel || !content.trim()) return;
    try {
      const tempId = Date.now();
      const optimisticMessage = {
        id: tempId,
        content,
        userId: user.id,
        timestamp: new Date().toISOString(),
        temp: true,
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      const response = await api.post(
        `/api/chat/channels/${currentChannel}/messages`,
        {
          content,
          timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        }
      );
      const actualMessage = response.data.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? actualMessage : m))
      );
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to send message");
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/api/chat/messages/${messageId}`);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to delete message");
    }
  };

  const joinChannel = (channelId) => {
    if (socket && channelId) {
      console.log("Joining channel:", channelId);
      socket.emit("join-channel", channelId);
      setCurrentChannel(channelId);
      fetchMessages(channelId);
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && currentChannel) {
      socket.emit(isTyping ? "typing-start" : "typing-stop", currentChannel);
    }
  };

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setError("Please login again");
        } else if (error.response?.status === 404) {
          setError("Resource not found");
        } else if (!error.response) {
          setError("Network error - please check your connection");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = {
    socket,
    messages,
    channels,
    currentChannel,
    loading,
    error,
    typingUsers,
    sendMessage,
    deleteMessage,
    joinChannel,
    handleTyping,
    fetchChannels,
    user,
    userProfiles,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
