import React, { useState, useEffect, useRef } from "react";
import { Hash, Search, Send, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { FaCode } from "react-icons/fa";
import { TiMessages } from "react-icons/ti";
import { useChat } from "../contexts/chatContext";
import { useAuth } from "../contexts/AuthContext";

const MessageBubble = ({ message, onDelete, isOwnMessage }) => {
  const { userProfiles } = useChat();
  const userProfile = userProfiles[message.userId];

  return (
    <div className="group flex items-start space-x-3 p-2 hover:bg-purple-500/10 rounded-lg">
      {/* User Avatar */}
      <img
        src={
          userProfile?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userId}`
        }
        alt={userProfile?.name || message.userId}
        className="w-10 h-10 rounded-full"
      />

      {/* Message Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">
              {userProfile?.name || "Unknown User"}
            </span>
            <span className="text-xs text-gray-400">
              {userProfile?.registration_number || "No Reg. Number"}
            </span>
          </div>

          {isOwnMessage && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this message?"
                  )
                ) {
                  onDelete(message.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-red-500"
              title="Delete Message"
            >
              <Trash size={18} />
            </motion.button>
          )}
        </div>

        <p className="text-gray-300">{message.content}</p>
      </div>
    </div>
  );
};

const CommunityPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const {
    messages,
    channels,
    currentChannel,
    loading: isLoading,
    sendMessage,
    joinChannel,
    fetchChannels,
    handleTyping,
    typingUsers,
    deleteMessage,
  } = useChat();
  const [newMessage, setNewMessage] = useState("");

  // Fetch channels when the component mounts
  useEffect(() => {
    fetchChannels();
  }, []);

  // Scroll to the bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleChannelClick = (channelId) => {
    joinChannel(channelId);
  };

  const channelList = [
    {
      id: "general",
      name: "General Chat",
      icon: TiMessages,
      description: "Campus-wide discussions",
      color: "text-purple-500",
    },
    {
      id: "coding",
      name: "Coding Doubts",
      icon: FaCode,
      description: "Get help with programming questions",
      color: "text-pink-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6 bg-black/40 rounded-2xl backdrop-blur-xl border border-purple-500/20 overflow-hidden h-[85vh]">
          {/* Sidebar */}
          <div className="col-span-3 border-r border-purple-500/20 p-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">
                  Community Channel
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search channels..."
                    className="w-full bg-purple-500/10 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {channelList.map((channel) => (
                  <motion.div
                    key={channel.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChannelClick(channel.id)}
                    className={`cursor-pointer p-4 rounded-lg flex items-center space-x-3 ${
                      currentChannel === channel.id
                        ? "bg-purple-600/30 border border-purple-500/50"
                        : "hover:bg-purple-600/10"
                    }`}
                  >
                    <channel.icon className={`w-5 h-5 ${channel.color}`} />
                    <div>
                      <p className="text-white font-medium">{channel.name}</p>
                      <p className="text-gray-400 text-sm">
                        {channel.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="col-span-9 flex flex-col">
            <div className="p-4 border-b border-purple-500/20">
              {currentChannel ? (
                <>
                  <div className="flex items-center space-x-4">
                    <Hash className="w-6 h-6 text-purple-500" />
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {channelList.find((c) => c.id === currentChannel)?.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {
                          channelList.find((c) => c.id === currentChannel)
                            ?.description
                        }
                      </p>
                    </div>
                  </div>
                  {typingUsers.size > 0 && (
                    <div className="text-sm text-purple-400 mt-1">
                      {Array.from(typingUsers).join(", ")} is typing...
                    </div>
                  )}
                </>
              ) : (
                <h3 className="text-xl font-bold text-white">
                  Select a channel to join conversation
                </h3>
              )}
            </div>
            {/* Chat Content */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              ref={messagesContainerRef}
            >
              {currentChannel ? (
                isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <MessageBubble
                        key={message.id || `${message.userId}-${index}`}
                        message={message}
                        isOwnMessage={user?.id === message.userId}
                        onDelete={deleteMessage}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-white font-medium">
                  Please select a channel from the sidebar.
                </div>
              )}
            </div>
            {currentChannel && (
              <div className="p-4 border-t border-purple-500/20">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder={`Message #${currentChannel}`}
                    className="flex-1 bg-purple-500/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping(true);
                    }}
                    onBlur={() => handleTyping(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                    title="Send Message"
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
