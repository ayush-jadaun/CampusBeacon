import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.25 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-pink-500/20 hover:border-pink-200/40 transition-all"
    >
      <div className="flex flex-col items-center text-center space-y-4 ">
        <Icon className="h-11 w-20 text-pink-500" />
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
