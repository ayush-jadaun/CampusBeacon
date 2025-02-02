import React, { useState } from "react";
import { Code, MessageSquare, Search } from "lucide-react";
import { motion } from "framer-motion";

const CommunityPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = {
    id: "1",
    name: "Ayush Jadaun",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ayush",
    role: "Student",
  };
  // Channels configuration
  const channels = [
    {
      id: "general",
      name: "General Chat",
      icon: MessageSquare,
      description: "Campus-wide discussions and announcements",
      color: "text-purple-500",
    },
    {
      id: "coding",
      name: "Coding Doubts",
      icon: Code,
      description: "Get help with programming questions",
      color: "text-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6 bg-black/40 rounded-2xl backdrop-blur-xl border border-purple-500/20 overflow-hidden h-[85vh]">
          {/* Side Channel Bar */}
          <div className="col-span-3 border-r border-purple-500/20 p-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Community Channel
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform-transform y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search channels..."
                    className="w-full bg-purple-500/10 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3 border-r border-purple-500/20 p-4"></div>
        </div>
      </div>
    </div>
  );
};
export default CommunityPage;
