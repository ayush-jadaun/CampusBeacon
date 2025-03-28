import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "../../config/chatConfig/supabaseClient";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Edit,
  Trash2,
  Info,
  Image,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

/**
 * Subscribe to real-time messages using Supabase's real-time API.
 * @param {number} channelId - The channel ID to subscribe to.
 * @param {function} callback - Callback invoked with new messages.
 * @returns {Object} Subscription object.
 */
const subscribeToMessages = (channelId, callback) => {
  const subscription = supabase
    .channel(`messages-channel-${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Messages",
        filter: `channelId=eq.${channelId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
  return subscription;
};

/**
 * Subscribe to real-time updates for users table.
 * @param {function} callback - Callback invoked with new user data.
 * @returns {Object} Subscription object.
 */
const subscribeToUsers = (callback) => {
  const subscription = supabase
    .channel("users")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users",
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  return subscription;
};

/**
 * Returns a random avatar URL using robohash.org.
 * @param {string} userId - Unique user identifier.
 */
const getAvatarURL = (userId) =>
  `https://robohash.org/${userId}?set=set4&size=150x150`;

const ChatApp = ({ channelId, channelName, darkMode, currentUser }) => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const { user: profileUser } = useSelector((state) => state.profile);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Fetch messages and subscribe to real-time updates.
  useEffect(() => {
    const fetchMessages = async () => {
      setMessages([]);
      setIsTyping(true);
      setTimeout(async () => {
        const { data, error } = await supabase
          .from("Messages")
          .select("*")
          .eq("channelId", channelId)
          .order("createdAt", { ascending: true });
        if (error) {
          console.error("Error fetching messages:", error);
        } else {
          setMessages(data);
        }
        setIsTyping(false);
      }, 800);
    };

    fetchMessages();
    const subscription = subscribeToMessages(channelId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId]);

  // Fetch users and subscribe to real-time updates.
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    };
    fetchUsers();
    const usersSubscription = subscribeToUsers((payload) => {
      if (payload.event === "INSERT") {
        setUsers((prev) => [...prev, payload.new]);
      } else if (payload.event === "UPDATE") {
        setUsers((prev) =>
          prev.map((user) => (user.id === payload.new.id ? payload.new : user))
        );
      } else if (payload.event === "DELETE") {
        setUsers((prev) => prev.filter((user) => user.id !== payload.old.id));
      }
    });
    return () => {
      supabase.removeChannel(usersSubscription);
    };
  }, []);

  // Handle sending a new message.
  const sendMessage = async () => {
    if (!newMessageContent.trim()) return;
    if (!authUser) {
      console.error("User not authenticated.");
      return;
    }
    const timestamp = new Date().toISOString();
    const { error } = await supabase.from("Messages").insert([
      {
        content: newMessageContent.trim(),
        userId: authUser.id,
        channelId,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]);
    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessageContent("");
    }
  };

  // Trigger delete confirmation.
  const confirmAndDeleteMessage = (messageId) => {
    setDeleteConfirmation(messageId);
  };

  // Handle delete confirmation.
  const handleDeleteResponse = async (confirmed) => {
    if (confirmed && deleteConfirmation) {
      const { error } = await supabase
        .from("Messages")
        .delete()
        .eq("id", deleteConfirmation);
      if (error) {
        console.error("Error deleting message:", error);
      } else {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== deleteConfirmation)
        );
      }
    }
    setDeleteConfirmation(null);
  };

  // Handle message editing.
  const updateMessage = async (messageId, newContent) => {
    const timestamp = new Date().toISOString();
    const { error } = await supabase
      .from("Messages")
      .update({ content: newContent, updatedAt: timestamp })
      .eq("id", messageId);
    if (error) {
      console.error("Error updating message:", error);
    } else {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
      setEditingMessageId(null);
      setEditingMessageContent("");
    }
  };

  // Helper to format time.
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const timeOptions = { hour: "numeric", minute: "numeric" };
    const time = date.toLocaleTimeString([], timeOptions);
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${time}`;
    } else {
      const dateOptions = { month: "short", day: "numeric" };
      return `${date.toLocaleDateString([], dateOptions)} at ${time}`;
    }
  };

  // Get full user data from the "users" state.
  const getUserData = (userId) => {
    if (currentUser && userId === currentUser.id) {
      return currentUser;
    }
    const found = users.find((u) => u.id === userId);
    if (found) return found;
    return {
      name: "Unknown User",
      registration_number: userId,
      avatar: getAvatarURL(userId),
    };
  };

  // Group messages by date.
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-b from-[#0B1026] to-[#1A1B35] text-white"
          : "bg-white text-gray-800"
      }`}
    >
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`py-4 px-6 flex justify-between items-center border-b transition-colors duration-300 ${
          darkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center text-amber-500 transition-all duration-200 ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-200 hover:bg-gray-100"
            }`}
          >
            <ChevronDown size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{channelName}</h2>
            <p className="text-sm text-gray-400">{messages.length} messages</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-700">
            <Info size={20} className="text-gray-400" />
          </button>
          <button className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-700">
            <MoreVertical size={20} className="text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {isTyping ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-800">
              <Image size={24} className="text-amber-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">No messages yet</h3>
            <p className="text-sm text-gray-400">
              Be the first to send a message in this channel!
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-6">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-dashed border-gray-500" />
                <span className="px-3 text-xs font-medium text-gray-400">
                  {new Date(date).toLocaleDateString([], {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <div className="flex-grow border-t border-dashed border-gray-500" />
              </div>
              {dateMessages.map((message, i) => {
                const userData = getUserData(message.userId);
                const isFirstInGroup =
                  i === 0 || dateMessages[i - 1].userId !== message.userId;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${!isFirstInGroup ? "pl-12 mt-1" : ""}`}
                  >
                    {isFirstInGroup && (
                      <div className="flex items-center mb-3">
                        <img
                          src={userData.avatar}
                          alt={userData.name}
                          className="w-10 h-10 rounded-full mr-3 shadow-md"
                        />
                        <div>
                          <span className="font-semibold">{userData.name}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {userData.registration_number}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="relative">
                      {editingMessageId === message.id ? (
                        <div className="p-4 rounded-lg bg-gray-800 shadow-2xl">
                          <textarea
                            value={editingMessageContent}
                            onChange={(e) =>
                              setEditingMessageContent(e.target.value)
                            }
                            className="w-full p-2 rounded bg-gray-900 text-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateMessage(message.id, editingMessageContent)
                              }
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded text-white font-medium"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditingMessageContent("");
                              }}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group">
                          <p className="bg-gray-900/50 p-4 rounded-xl text-gray-200">
                            {message.content}
                          </p>
                          {authUser && authUser.id === message.userId && (
                            <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingMessageId(message.id);
                                  setEditingMessageContent(message.content);
                                }}
                                className="p-1 bg-gray-800 rounded-full hover:bg-gray-700 text-amber-400"
                                title="Edit Message"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  confirmAndDeleteMessage(message.id)
                                }
                                className="p-1 bg-gray-800 rounded-full hover:bg-gray-700 text-red-400"
                                title="Delete Message"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Message Input Form */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/80">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <Smile size={20} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="absolute bottom-16 left-4 bg-gray-800 rounded-xl shadow-lg p-3 z-10"
                >
                  <div className="flex flex-wrap gap-2">
                    {[
                      "😊",
                      "😂",
                      "❤️",
                      "👍",
                      "🔥",
                      "✨",
                      "🎉",
                      "🙌",
                      "😎",
                      "🤔",
                    ].map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setNewMessageContent((prev) => prev + emoji);
                          setShowEmoji(false);
                        }}
                        className="text-xl p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input
            type="text"
            placeholder={`Message #${channelName}`}
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={sendMessage}
            className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Confirm Deletion
              </h3>
              <p className="text-sm mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleDeleteResponse(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteResponse(true)}
                  className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatApp;
