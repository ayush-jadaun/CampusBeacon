import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  IndianRupee,
  Phone,
  Edit,
  Trash2,
  User,
  Loader2,
  Eye,
  Calendar,
} from "lucide-react";
import { formatDateTime, isRideActive } from "../../utils/dateUtils";
import { useSelector } from "react-redux";
import ParticipantsModal from "./ParticipantsModal";

const RideCard = ({
  ride,
  onEdit,
  onDelete,
  currentUser,
  onJoin,
  onUnjoin,
  isLoading,
}) => {
  const { roles } = useSelector((state) => state.auth);
  const isAdmin = Array.isArray(roles) && roles.includes("admin");
  const isCreator = ride.creatorId === currentUser?.id;
  const hasJoined = ride.participants?.some(
    (p) => p.participant?.id === currentUser?.id
  );

  const [showParticipants, setShowParticipants] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!ride) {
    return <div className="p-6 text-red-400">Invalid ride data</div>;
  }

  const isActive = isRideActive(ride.departureDateTime);
  const cardStatusClass = isCreator
    ? "border-l-2 border-l-beacon"
    : !isActive
    ? "border-l-2 border-l-ink-line"
    : ride.availableSeats === 0
    ? "border-l-2 border-l-red-500/70"
    : "border-l-2 border-l-beacon-deep";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`p-5 bg-ink-2 ${cardStatusClass} overflow-hidden relative h-full`}
    >
      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <motion.h2
              layout
              className="font-display text-xl sm:text-2xl font-semibold text-paper mb-2 leading-snug"
            >
              {ride.pickupLocation} &rarr; {ride.dropLocation}
            </motion.h2>
            <div className="flex items-center font-mono text-xs text-dim mb-1.5">
              <Calendar className="w-3.5 h-3.5 mr-2 text-beacon" />
              <span>{formatDateTime(ride.departureDateTime)}</span>
            </div>
            <div className="flex items-center text-sm text-dim">
              <User className="w-3.5 h-3.5 mr-2 text-beacon" />
              <span>
                {ride.creator?.name || ride.creator?.email || "Anonymous"}
              </span>
            </div>
          </div>

          <AnimatePresence>
            <div className="flex space-x-2">
              {ride.participants && ride.participants.length > 0 && (
                <motion.button
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowParticipants(true)}
                  className="border border-ink-line p-2 rounded-full text-dim hover:border-beacon hover:text-beacon transition-colors"
                  aria-label="View participants"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
              )}
              {(isCreator || isAdmin) && (
                <>
                  <motion.button
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(ride)}
                    className="border border-ink-line p-2 rounded-full text-dim hover:border-beacon hover:text-beacon transition-colors"
                    aria-label="Edit ride"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(ride.id)}
                    className="border border-ink-line p-2 rounded-full text-red-400 hover:border-red-500/60 hover:text-red-300 transition-colors"
                    aria-label="Delete ride"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          </AnimatePresence>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <motion.div
              className="flex items-center border border-ink-line px-3 py-1 rounded-full font-mono text-xs text-dim"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-3.5 h-3.5 mr-2 text-beacon" />
              <span>
                {ride.availableSeats}/{ride.totalSeats} seats
              </span>
            </motion.div>
            <motion.div
              className="flex items-center border border-beacon/40 px-3 py-1 rounded-full font-mono text-xs text-beacon"
              whileHover={{ scale: 1.05 }}
            >
              <IndianRupee className="w-3.5 h-3.5 mr-1" />
              <span>{ride.estimatedCost || "Free"}</span>
            </motion.div>
          </div>

          {ride.phoneNumber && (
            <motion.div
              className="text-dim flex items-center font-mono text-xs"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1, x: 5 }}
            >
              <Phone className="w-3.5 h-3.5 mr-2 text-beacon" />{" "}
              {ride.phoneNumber}
            </motion.div>
          )}

          {ride.description && (
            <motion.div
              className="bg-ink p-3 rounded-sm mt-2 text-dim text-sm italic border-l-2 border-ink-line"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              "{ride.description}"
            </motion.div>
          )}

          {ride.participants && ride.participants.length > 0 && (
            <motion.div
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
              className="mt-3"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-2">
                Participants
              </p>
              <div className="flex flex-wrap gap-2">
                {ride.participants.slice(0, 3).map((participant) => (
                  <span
                    key={participant.id}
                    className="border border-ink-line text-dim text-xs px-3 py-1 rounded-full"
                  >
                    {participant.participant?.name ||
                      participant.participant?.email}
                  </span>
                ))}
                {ride.participants.length > 3 && (
                  <span className="border border-beacon/40 text-beacon text-xs px-3 py-1 rounded-full">
                    +{ride.participants.length - 3} more
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Button */}
        {!isCreator && isActive && (
          <div className="mt-4">
            {hasJoined ? (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onUnjoin(ride.id)}
                disabled={isLoading}
                className={`w-full py-2 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium transition-colors ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </div>
                ) : (
                  "Cancel Join"
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onJoin(ride.id)}
                disabled={ride.availableSeats === 0 || isLoading}
                className={`w-full py-2 rounded-full font-semibold transition-colors ${
                  ride.availableSeats === 0 || isLoading
                    ? "bg-ink-3 cursor-not-allowed text-dim"
                    : "bg-beacon hover:bg-beacon-soft text-ink"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </div>
                ) : ride.availableSeats === 0 ? (
                  "No Seats Available"
                ) : (
                  "Join Ride"
                )}
              </motion.button>
            )}
          </div>
        )}

        {isCreator && (
          <motion.div
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
            className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-beacon py-2 rounded-sm border border-beacon/40"
          >
            Your Ride Offering
          </motion.div>
        )}
      </div>

      <ParticipantsModal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        participants={ride.participants || []}
        rideDetails={ride}
      />
    </motion.div>
  );
};

export default RideCard;
