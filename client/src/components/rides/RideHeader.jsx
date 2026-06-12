import React from "react";
import { motion } from "framer-motion";
import { Car, Plus } from "lucide-react";

const RideHeader = ({ onOfferRide }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="font-mono text-xs sm:text-sm text-beacon tracking-[0.25em] uppercase">
          ( Ride Sharing )
        </span>
        <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-paper flex items-center">
            <Car className="mr-3 text-beacon h-8 w-8" aria-hidden="true" />
            Ride sharing
          </h1>
          <p className="text-dim mt-3 max-w-xl">
            Split a cab to Prayagraj Junction. Save money, make friends.
          </p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOfferRide}
          className="bg-beacon hover:bg-beacon-soft text-ink font-semibold py-2.5 px-6 rounded-full transition-colors flex items-center self-start sm:self-auto"
        >
          <Plus className="mr-2 h-5 w-5" /> Offer Ride
        </motion.button>
      </div>
    </div>
  );
};

export default RideHeader;
