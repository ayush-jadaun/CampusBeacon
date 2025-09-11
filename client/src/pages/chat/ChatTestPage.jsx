import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Hash,
  Bell,
  Menu,
  X,
  Search,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import supabase from "../../config/chatConfig/supabaseClient";
import ChatApp from "./ChatApp";

const ChatTestPage = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { user: authUser } = useSelector((state) => state.auth);

  // Add local state for dark mode instead of using Redux
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("chatDarkMode") === "false" || true
  );

  // Check if user is admin
  const isAdmin = authUser?.roles?.includes("admin");

  // Toggle dark mode function
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("chatDarkMode", newMode);
  };

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("Channels")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching channels:", error);
        } else {
          // Filter out channels that start with "Event" (case-insensitive)
          const communityChannels = data.filter(
            (channel) => !channel.name.toLowerCase().startsWith("event")
          );

          setChannels(communityChannels);

          // Select first community channel by default if none selected
          if (communityChannels.length > 0 && !selectedChannel) {
            setSelectedChannel(communityChannels[0]);
          }
          // If currently selected channel is an event channel, switch to first community channel
          else if (
            selectedChannel &&
            selectedChannel.name.toLowerCase().startsWith("event")
          ) {
            if (communityChannels.length > 0) {
              setSelectedChannel(communityChannels[0]);
            } else {
              setSelectedChannel(null);
            }
          }
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchChannels();

    // Subscribe to channel changes
    const channelSubscription = supabase
      .channel("public:Channels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Channels" },
        (payload) => {
          console.log("Channel change:", payload);
          fetchChannels(); // Refresh channels on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [selectedChannel]);

  // Add new channel (admin only)
  const addNewChannel = async () => {
    if (!isAdmin) return;

    const channelName = prompt("Enter channel name:");
    if (!channelName || !channelName.trim()) return;

    // Prevent creating channels that start with "Event" from this interface
    if (channelName.toLowerCase().startsWith("event")) {
      alert(
        'Channel names starting with "Event" are reserved for event-specific chats. Please choose a different name.'
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("Channels")
        .insert([{ name: channelName.trim() }]);

      if (error) {
        console.error("Error creating channel:", error);
        alert("Failed to create channel");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Filter channels based on search query (only community channels)
  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      {/* Mobile sidebar toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-50 p-2 rounded-md ${
            darkMode ? "bg-gray-800" : "bg-gray-200"
          } ${sidebarOpen ? "hidden" : "block"}`}
        >
          <Menu
            size={20}
            className={darkMode ? "text-white" : "text-gray-800"}
          />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-full max-w-xs md:max-w-[280px] h-full flex-shrink-0 border-r ${
              darkMode
                ? "bg-gray-900 border-gray-800"
                : "bg-gray-50 border-gray-200"
            } ${isMobile ? "fixed z-40 left-0 top-0" : ""}`}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  darkMode ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      darkMode ? "bg-amber-500" : "bg-amber-500"
                    } text-white`}
                  >
                    <Users size={18} />
                  </div>
                  <h1 className="font-bold text-lg">CampusBeacon</h1>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Dark mode toggle button */}
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-md transition-colors ${
                      darkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-amber-400"
                        : "bg-gray-200 hover:bg-gray-300 text-amber-600"
                    }`}
                    aria-label={
                      darkMode ? "Switch to light mode" : "Switch to dark mode"
                    }
                  >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  {isMobile && (
                    <button
                      onClick={toggleSidebar}
                      className={`p-2 rounded-md ${
                        darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                      }`}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Search */}
              <div
                className={`p-4 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    darkMode ? "bg-gray-800" : "bg-gray-200"
                  }`}
                >
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search community channels"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`bg-transparent w-full focus:outline-none text-sm ${
                      darkMode
                        ? "text-white placeholder-gray-400"
                        : "text-gray-800 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              {/* Channel List */}
              <div className="flex-1 overflow-y-auto py-2 px-2">
                <div className="mb-2 px-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Community Channels
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={addNewChannel}
                      className={`p-1 rounded-md ${
                        darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                      }`}
                      title="Add new community channel (Admin only)"
                    >
                      <Plus size={16} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {filteredChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannel(channel);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={`w-full px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                        selectedChannel?.id === channel.id
                          ? darkMode
                            ? "bg-gray-800 text-amber-500"
                            : "bg-gray-200 text-amber-600"
                          : darkMode
                          ? "hover:bg-gray-800 text-gray-300"
                          : "hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Hash
                        size={18}
                        className={
                          selectedChannel?.id === channel.id
                            ? "text-amber-500"
                            : "text-gray-400"
                        }
                      />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  ))}
                  {filteredChannels.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      {searchQuery
                        ? "No matching channels found"
                        : "No community channels available"}
                    </div>
                  )}
                </div>
              </div>

              {/* User Profile */}
              <div
                className={`p-4 border-t ${
                  darkMode ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={
                        authUser?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${
                          authUser?.name || "User"
                        }&background=random`
                      }
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                  </div>
                  <div className="flex flex-col ml-3">
                    <span className="font-medium text-sm">
                      {authUser?.name ||
                        authUser?.email?.split("@")[0] ||
                        "User"}
                    </span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        {authUser?.registration_number || ""}
                      </span>
                      {isAdmin && (
                        <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedChannel ? (
          <ChatApp
            key={selectedChannel.id}
            channelId={selectedChannel.id}
            channelName={selectedChannel.name}
            darkMode={darkMode}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <Hash size={24} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">No channel selected</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Select a community channel from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTestPage;
