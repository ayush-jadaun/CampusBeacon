import React from "react";
import { motion } from "framer-motion";

function Profile({ vals, header }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-ink rounded-sm border border-ink-line p-6 relative group hover:border-beacon/50 transition-colors"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-dim">
        {header}
      </p>
      <p className="text-paper text-lg font-medium mt-1.5">{vals}</p>
    </motion.div>
  );
}

export default Profile;
