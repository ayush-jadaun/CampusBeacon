import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit,
  FiTrash2,
  FiPhone,
  FiPlus,
  FiLoader,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import {
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
  FaTwitter,
  FaGlobe,
} from "react-icons/fa";
import {
  fetchCoordinators,
  deleteCoordinator,
  clearCoordinatorError,
} from "../../slices/coordinatorSlice";
import toast from "react-hot-toast";

// Helper to get social icon and brand color class
const getSocialDetails = (link = "") => {
  if (typeof link !== "string" || !link)
    return { Icon: FaGlobe, colorClass: "text-gray-400 hover:text-gray-300" };

  if (link.includes("instagram.com"))
    return {
      Icon: FaInstagram,
      colorClass: "text-[#E1306C] hover:text-[#c72a5f]",
    };
  if (link.includes("linkedin.com"))
    return {
      Icon: FaLinkedin,
      colorClass: "text-[#0077B5] hover:text-[#005e90]",
    };
  if (link.includes("facebook.com"))
    return {
      Icon: FaFacebookF,
      colorClass: "text-[#1877F2] hover:text-[#125fb3]",
    };
  if (link.includes("twitter.com"))
    return {
      Icon: FaTwitter,
      colorClass: "text-[#1DA1F2] hover:text-[#17a8de]",
    };
  if (link.includes("mailto:"))
    return { Icon: FiMail, colorClass: "text-amber-400 hover:text-amber-300" };

  // Default for other web links
  return { Icon: FaGlobe, colorClass: "text-gray-400 hover:text-gray-300" };
};

const CoordinatorList = ({ isAdmin, openModal, clubId }) => {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(null); // Store ID being deleted
  const [confirmDeleteData, setConfirmDeleteData] = useState(null); // Stores { id, name } for deletion confirmation
  const [showAll, setShowAll] = useState(false); // Toggle for showing all coordinators
  const { coordinators, loading, error } = useSelector(
    (state) => state.coordinators
  );

  useEffect(() => {
    if (clubId) {
      dispatch(fetchCoordinators(clubId));
    }
  }, [dispatch, clubId]);

  useEffect(() => {
    if (error) {
      toast.error(`Error loading team: ${error}`);
      dispatch(clearCoordinatorError());
    }
  }, [error, dispatch]);

  // Function to trigger the confirmation box
  const handleDeleteCoordinator = (id, name) => {
    setConfirmDeleteData({ id, name });
  };

  // Actual deletion function, invoked after confirmation
  const performDelete = async (id, name) => {
    setIsDeleting(id);
    try {
      await dispatch(deleteCoordinator(id)).unwrap();
      toast.success(`${name} removed successfully`);
    } catch (err) {
      const errorMessage =
        err?.message || err?.error || "Failed to remove coordinator";
      toast.error(`Error: ${errorMessage}`);
      console.error("Failed to delete coordinator:", err);
    } finally {
      setIsDeleting(null);
      setConfirmDeleteData(null);
    }
  };

  // Variants for Framer Motion animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.85,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const adminButtonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, type: "spring", stiffness: 300, damping: 15 },
    },
    exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
  };

  // Determine the coordinators to show (limit to 4 if not expanded)
  const displayedCoordinators = showAll
    ? coordinators
    : coordinators.slice(0, 4);

  return (
    <section className="py-8 md:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 pb-1">
            Meet the Team
          </h2>
          <p className="text-gray-400 mt-1 text-base">
            The driving force behind the club&apos;s success.
          </p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              openModal("coordinator", "create", { club_id: clubId })
            }
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm transition-all shadow-lg hover:shadow-cyan-500/30 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <FiPlus className="mr-2" size={18} /> Add Coordinator
          </motion.button>
        )}
      </div>

      {loading && !coordinators?.length && (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center space-y-3">
            <FiLoader className="animate-spin text-cyan-400 text-5xl" />
            <span className="text-gray-400 animate-pulse text-lg">
              Loading Team Members...
            </span>
          </div>
        </div>
      )}

      {!loading && error && !coordinators?.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10 text-red-400 bg-red-900/10 backdrop-blur-sm rounded-xl border border-red-700/30 p-6 shadow-lg flex flex-col items-center space-y-4"
        >
          <FiUsers size={40} className="text-red-500/70" />
          <p className="font-semibold text-lg">
            Oops! Could not load the team.
          </p>
          <p className="text-red-400/80 text-sm max-w-md">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (clubId) dispatch(fetchCoordinators(clubId));
            }}
            className="mt-3 px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-sm transition-colors shadow-lg"
          >
            Try Again
          </motion.button>
        </motion.div>
      )}

      {!loading && !error && (
        <>
          {coordinators.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              >
                <AnimatePresence>
                  {displayedCoordinators.map((coord) => (
                    <motion.div
                      layout
                      key={coord.id}
                      variants={itemVariants}
                      exit="exit"
                      className="bg-gradient-to-br from-gray-800/70 via-gray-800/40 to-gray-900/70 rounded-2xl p-6 border border-gray-700/60 shadow-xl hover:shadow-cyan-500/15 backdrop-blur-lg group relative overflow-hidden hover:border-cyan-600/70 transition-all duration-300 ease-out flex flex-col"
                      whileHover={{ y: -5 }}
                    >
                      {isAdmin && (
                        <div className="absolute top-3 right-3 z-20 flex space-x-2">
                          <AnimatePresence>
                            {isDeleting !== coord.id && (
                              <>
                                <motion.button
                                  key={`edit-${coord.id}`}
                                  variants={adminButtonVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  whileHover={{ scale: 1.15, rotate: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    openModal("coordinator", "edit", coord)
                                  }
                                  className="p-1.5 bg-blue-600/80 hover:bg-blue-500/90 rounded-full text-white shadow-lg hover:shadow-blue-500/40 transition"
                                  aria-label="Edit Coordinator"
                                  style={{ backdropFilter: "blur(4px)" }}
                                >
                                  <FiEdit size={14} />
                                </motion.button>
                                <motion.button
                                  key={`delete-${coord.id}`}
                                  variants={adminButtonVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  whileHover={{ scale: 1.15, rotate: -5 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleDeleteCoordinator(
                                      coord.id,
                                      coord.name
                                    )
                                  }
                                  className={`p-1.5 bg-red-600/80 hover:bg-red-500/90 rounded-full text-white shadow-lg hover:shadow-red-500/40 transition ${
                                    isDeleting === coord.id
                                      ? "cursor-not-allowed"
                                      : ""
                                  }`}
                                  aria-label="Delete Coordinator"
                                  disabled={isDeleting === coord.id}
                                  style={{ backdropFilter: "blur(4px)" }}
                                >
                                  {isDeleting === coord.id ? (
                                    <FiLoader
                                      className="animate-spin"
                                      size={14}
                                    />
                                  ) : (
                                    <FiTrash2 size={14} />
                                  )}
                                </motion.button>
                              </>
                            )}
                          </AnimatePresence>
                          {isDeleting === coord.id && (
                            <motion.div
                              key={`deleting-${coord.id}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm"
                            >
                              <FiLoader
                                className="animate-spin text-red-400"
                                size={16}
                              />
                            </motion.div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col items-center text-center pt-4 flex-grow">
                        <div className="relative mb-5 w-28 h-28 group-hover:scale-105 transition-transform duration-300 ease-out">
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-400/70 via-blue-500/70 to-indigo-600/70 blur opacity-60 group-hover:opacity-80 group-hover:blur-md transition-all duration-400 animate-pulse-slow"></div>
                          <img
                            src={
                              Array.isArray(coord.images) &&
                              coord.images.length > 0
                                ? coord.images[0]
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    coord.name || "N A"
                                  )}&background=1d4ed8&color=fff&size=128&font-size=0.45&bold=true`
                            }
                            alt={coord.name || "Coordinator"}
                            className="w-28 h-28 rounded-full object-cover shadow-lg border-3 border-gray-600/50 group-hover:border-cyan-500/70 transition-colors duration-300 relative z-10"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                coord.name || "N A"
                              )}&background=1d4ed8&color=fff&size=128&font-size=0.45&bold=true`;
                            }}
                            loading="lazy"
                          />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 tracking-tight leading-tight">
                          {coord.name || "Unnamed Coordinator"}
                        </h3>
                        <span className="inline-block px-3 py-0.5 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 rounded-full text-cyan-300 text-xs font-medium mb-4 border border-cyan-600/30">
                          {coord.designation || "Team Member"}
                        </span>
                        <div className="flex-grow"></div>
                        {coord.contact && (
                          <p className="text-sm text-gray-300/80 mt-3 flex items-center justify-center group-hover:text-gray-200 transition-colors">
                            <FiPhone
                              size={13}
                              className="mr-2 text-cyan-400/80"
                            />
                            <a
                              href={`tel:${coord.contact}`}
                              className="hover:underline"
                            >
                              {coord.contact}
                            </a>
                          </p>
                        )}
                        {Array.isArray(coord.social_media_links) &&
                          coord.social_media_links.length > 0 && (
                            <div className="flex justify-center gap-4 mt-5 pt-4 border-t border-gray-700/40 w-full">
                              {coord.social_media_links
                                .slice(0, 4)
                                .map((link, i) => {
                                  const { Icon, colorClass } =
                                    getSocialDetails(link);
                                  return (
                                    <motion.a
                                      key={i}
                                      whileHover={{ scale: 1.25, y: -3 }}
                                      whileTap={{ scale: 1.1 }}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-xl transition-colors duration-200 ${colorClass}`}
                                      aria-label={`${
                                        coord.name
                                      }'s social media profile ${i + 1}`}
                                    >
                                      <Icon />
                                    </motion.a>
                                  );
                                })}
                            </div>
                          )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              {/* Show More / Show Less button */}
              {coordinators.length > 4 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  >
                    {showAll ? "Show Less" : "Show More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/70 border border-gray-700/40 rounded-xl p-10 md:p-16 text-center shadow-lg flex flex-col items-center space-y-6"
            >
              <FiUsers className="text-5xl text-gray-500/80 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300">
                No Team Members Yet
              </h3>
              <p className="text-gray-400/90 max-w-sm">
                Looks like the team roster is currently empty for this club.
              </p>
              {isAdmin && (
                <p className="text-sm text-gray-500 mt-2">
                  Use the "+ Add Coordinator" button to build your team!
                </p>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-80 text-center shadow-xl border border-gray-700"
          >
            <p className="text-white text-lg mb-4">
              Remove{" "}
              <span className="font-semibold">{confirmDeleteData.name}</span>?
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to remove {confirmDeleteData.name} from the
              team? This action cannot be undone.
            </p>
            <div className="flex justify-around">
              <button
                onClick={() =>
                  performDelete(confirmDeleteData.id, confirmDeleteData.name)
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDeleteData(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default CoordinatorList;
