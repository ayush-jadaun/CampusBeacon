import React from "react";
import { motion } from "framer-motion";
import { Car, Plus } from "lucide-react";

const EmptyState = ({ activeFilterCount, onOfferRide, onClearFilters }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-dashed border-ink-line rounded-sm text-center p-10 mt-8 bg-ink-2/40"
    >
      <Car className="w-12 h-12 mx-auto text-dim mb-4" />
      <div className="font-display text-2xl font-semibold text-paper mb-3">
        {activeFilterCount > 0
          ? "No rides found matching your filters"
          : "No rides available"}
      </div>
      <p className="text-dim mb-6 max-w-md mx-auto">
        {activeFilterCount > 0
          ? "Try adjusting your search criteria or clearing filters"
          : "Be the first to offer a ride and help connect the campus community!"}
      </p>
      {activeFilterCount > 0 ? (
        <button
          onClick={onClearFilters}
          className="border border-ink-line text-dim hover:border-beacon hover:text-beacon py-2 px-6 rounded-full transition-colors"
        >
          Clear all filters
        </button>
      ) : (
        <button
          onClick={onOfferRide}
          className="bg-beacon hover:bg-beacon-soft text-ink font-semibold py-2 px-6 rounded-full transition-colors flex items-center mx-auto"
        >
          <Plus className="mr-2" /> Offer a Ride
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
