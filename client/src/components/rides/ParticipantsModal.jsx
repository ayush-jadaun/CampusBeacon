import React from "react";
import { motion } from "framer-motion";
import { Users, X } from "lucide-react";

const ParticipantsModal = ({ isOpen, onClose, participants, rideDetails }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-ink-2 p-6 sm:p-8 rounded-sm max-w-2xl w-full border border-ink-line shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-2xl font-semibold text-paper flex items-center">
            <Users className="mr-3 text-beacon" /> Ride Participants
          </h3>
          <button
            onClick={onClose}
            className="text-dim hover:text-paper transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 pb-6 border-b border-ink-line">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-dim mb-2">
            Ride Details
          </h4>
          <p className="text-paper font-display text-lg">
            {rideDetails.pickupLocation} → {rideDetails.dropLocation}
          </p>
          <p className="font-mono text-xs text-dim mt-1">
            {new Date(rideDetails.departureDateTime).toLocaleString()}
          </p>
        </div>

        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-dim mb-4">
            Participants ({participants.length})
          </h4>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-ink border border-ink-line p-4 rounded-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-paper font-medium">
                    {participant.participant.name ||
                      participant.participant.email}
                  </p>
                  <p className="text-dim font-mono text-xs mt-0.5">
                    {participant.participant.email}
                  </p>
                </div>
                <div className="text-beacon">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            ))}
            {participants.length === 0 && (
              <p className="text-dim text-center py-4">
                No participants yet
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParticipantsModal;
