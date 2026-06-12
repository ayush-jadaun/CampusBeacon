import React from "react";
import { motion } from "framer-motion";
import { Plus, Edit } from "lucide-react";
import RideForm from "./RideForm";

const RideFormModal = ({ isOpen, editingRide, onSubmit, onCancel }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink/80 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-ink-2 p-4 sm:p-6 rounded-sm w-full max-w-md md:max-w-lg border border-ink-line shadow-[0_10px_30px_rgba(0,0,0,0.45)] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 pb-4 border-b border-ink-line">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-beacon mb-2">
            {editingRide ? "( Edit ride )" : "( New ride )"}
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-paper flex items-center">
            {editingRide ? (
              <>
                <Edit className="mr-2 h-5 w-5 text-beacon" />
                <span className="truncate">Edit Ride</span>
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5 text-beacon" />
                <span className="truncate">Offer New Ride</span>
              </>
            )}
          </h3>
        </div>
        <RideForm
          initialData={editingRide}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </motion.div>
    </motion.div>
  );
};

export default RideFormModal;
