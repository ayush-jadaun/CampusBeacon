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

const getSocialDetails = (link = "") => {
  if (typeof link !== "string" || !link)
    return { Icon: FaGlobe, colorClass: "text-dim hover:text-beacon" };
  if (link.includes("instagram.com"))
    return { Icon: FaInstagram, colorClass: "text-dim hover:text-beacon" };
  if (link.includes("linkedin.com"))
    return { Icon: FaLinkedin, colorClass: "text-dim hover:text-beacon" };
  if (link.includes("facebook.com"))
    return { Icon: FaFacebookF, colorClass: "text-dim hover:text-beacon" };
  if (link.includes("twitter.com"))
    return { Icon: FaTwitter, colorClass: "text-dim hover:text-beacon" };
  if (link.includes("mailto:"))
    return { Icon: FiMail, colorClass: "text-dim hover:text-beacon" };
  return { Icon: FaGlobe, colorClass: "text-dim hover:text-beacon" };
};

const ListLoadingSkeleton = () => (
  <div className="flex justify-center items-center py-16">
    <div className="flex flex-col items-center space-y-3">
      <FiLoader className="animate-spin text-beacon text-5xl" />
      <span className="text-dim animate-pulse text-lg">
        Loading Team Members...
      </span>
    </div>
  </div>
);

const ListErrorState = ({ error, onRetry, clubId }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-10 text-red-400 bg-ink-2 rounded-sm border border-red-500/40 p-6 flex flex-col items-center space-y-4"
  >
    <FiUsers size={40} className="text-red-400/70" />
    <p className="font-semibold text-lg">Oops! Could not load the team.</p>
    <p className="text-red-400/80 text-sm max-w-md">
      {typeof error === "string" ? error : "An unknown error occurred."}
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onRetry(clubId)}
      className="mt-3 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm transition-colors"
    >
      Try Again
    </motion.button>
  </motion.div>
);

const NoCoordinatorsMessage = ({ isAdmin, isPassedData }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`${
      isPassedData
        ? "py-4 text-center"
        : "bg-ink-2 border border-ink-line rounded-sm p-8 md:p-12 text-center"
    } flex flex-col items-center space-y-4`}
  >
    <FiUsers
      className={`text-4xl ${isPassedData ? "text-dim" : "text-dim mb-3"}`}
    />
    <h3 className="font-display text-lg font-semibold text-paper">
      {isPassedData ? "No Coordinators Assigned" : "No Team Members Yet"}
    </h3>
    <p className="text-dim text-sm max-w-xs">
      {isPassedData
        ? "This event doesn't have any coordinators listed."
        : "Looks like the team roster is currently empty for this club."}
    </p>
    {!isPassedData && isAdmin && (
      <p className="text-xs text-dim mt-1">
        Use the "+ Add Coordinator" button above to build the team!
      </p>
    )}
  </motion.div>
);

const CoordinatorList = ({
  isAdmin = false,
  openModal,
  clubId = null,
  coordinators: passedCoordinators = null,
  showTitleSection = true,
  showContact = true,
  showSocial = true,
  gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  cardLayout = "detailed",
  maxVisible = 4,
}) => {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(null);
  const [confirmDeleteData, setConfirmDeleteData] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const isUsingPassedData = Array.isArray(passedCoordinators);
  const shouldFetch = !isUsingPassedData && clubId != null;

  const {
    coordinators: fetchedCoordinators,
    loading: fetchedLoading,
    error: fetchedError,
  } = useSelector((state) =>
    shouldFetch
      ? state.coordinators
      : { coordinators: [], loading: false, error: null }
  );

  const listToDisplay = isUsingPassedData ? passedCoordinators : fetchedCoordinators;
  const isLoading = shouldFetch && fetchedLoading;
  const displayError = shouldFetch && fetchedError;

  useEffect(() => {
    if (shouldFetch) {
      dispatch(fetchCoordinators(clubId));
    }
  }, [dispatch, clubId, shouldFetch]);

  useEffect(() => {
    if (displayError) {
      const toastId = `coord-error-${clubId || "passed"}`;
      toast.error(`Error loading team: ${displayError}`, { id: toastId });
    }
  }, [displayError, clubId, dispatch]);

  const handleRetryFetch = (id) => {
    if (shouldFetch && id) {
      dispatch(fetchCoordinators(id));
    }
  };

  const handleDeleteCoordinator = (id, name) => {
    if (!isAdmin) return;
    setConfirmDeleteData({ id, name });
  };

  const performDelete = async (id, name) => {
    if (!isAdmin) return;
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

  const containerVariants = {};

  const itemVariants = {};

  const adminButtonVariants = {};

  const coordinatorsToRender = listToDisplay ?? [];
  const displayedCoordinators = showAll
    ? coordinatorsToRender
    : coordinatorsToRender.slice(0, maxVisible);

  const renderCoordinatorCard = (coord) => {
    const isSimpleLayout = cardLayout === "simple";
    const cardClasses = isSimpleLayout
      ? "bg-ink-2 rounded-sm p-4 border border-ink-line group relative flex items-center gap-4"
      : "bg-ink-2 rounded-sm p-6 border border-ink-line group relative overflow-hidden hover:border-beacon/60 transition-colors duration-300 ease-out flex flex-col";
    const imageSizeClass = isSimpleLayout ? "w-16 h-16" : "w-24 h-24";
    const imageWrapperSizeClass = isSimpleLayout ? "w-16 h-16" : "w-28 h-28";
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      coord.name || "N A"
    )}&background=1c232e&color=efe9dd&size=${
      isSimpleLayout ? "96" : "128"
    }&font-size=0.4&bold=true`;
    const imageUrl =
      Array.isArray(coord.images) && coord.images.length > 0
        ? coord.images[0]
        : avatarUrl;

    return (
      <motion.div
        layout
        key={coord.id}
        variants={itemVariants}
        exit="exit"
        className={cardClasses}
        whileHover={!isSimpleLayout ? { y: -5 } : {}}
      >
        {isAdmin && openModal && (
          <div className="absolute top-3 right-3 z-20 flex space-x-1.5">
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
                    onClick={() => openModal("coordinator", "edit", coord)}
                    className="p-1.5 bg-ink border border-ink-line hover:bg-beacon hover:border-beacon hover:text-ink rounded-full text-paper transition-colors"
                    aria-label="Edit Coordinator"
                  >
                    <FiEdit size={13} />
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
                      handleDeleteCoordinator(coord.id, coord.name)
                    }
                    className={`p-1.5 bg-ink border border-ink-line hover:bg-red-500 hover:border-red-500 hover:text-white rounded-full text-red-400 transition-colors ${
                      isDeleting === coord.id ? "cursor-not-allowed" : ""
                    }`}
                    aria-label="Delete Coordinator"
                    disabled={isDeleting === coord.id}
                  >
                    {isDeleting === coord.id ? (
                      <FiLoader className="animate-spin" size={13} />
                    ) : (
                      <FiTrash2 size={13} />
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
                className="p-1.5 rounded-full bg-ink border border-ink-line"
              >
                <FiLoader className="animate-spin text-red-400" size={14} />
              </motion.div>
            )}
          </div>
        )}

        {isSimpleLayout ? (
          <>
            <img
              src={imageUrl}
              alt={coord.name || "Coordinator"}
              className={`${imageSizeClass} rounded-full object-cover border-2 border-ink-line flex-shrink-0`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = avatarUrl;
              }}
              loading="lazy"
            />
            <div className="flex-grow overflow-hidden">
              <h3 className="text-base sm:text-lg font-semibold text-paper mb-0.5 leading-tight truncate">
                {coord.name || "Unnamed Coordinator"}
              </h3>
              <span className="text-dim font-mono text-xs uppercase tracking-widest block truncate">
                {coord.designation || "Team Member"}
              </span>
              {showContact && coord.contact && (
                <a
                  href={`tel:${coord.contact}`}
                  className="text-xs text-dim hover:text-beacon mt-1 flex items-center gap-1 truncate"
                >
                  <FiPhone size={11} /> {coord.contact}
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center pt-4 flex-grow">
            <div
              className={`relative mb-4 ${imageWrapperSizeClass} group-hover:scale-105 transition-transform duration-300 ease-out`}
            >
              <img
                src={imageUrl}
                alt={coord.name || "Coordinator"}
                className={`${imageSizeClass} rounded-full object-cover border-2 border-ink-line group-hover:border-beacon/70 transition-colors duration-300 relative z-10`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatarUrl;
                }}
                loading="lazy"
              />
            </div>
            <h3 className="font-display text-lg font-semibold text-paper mb-1 tracking-tight leading-tight">
              {coord.name || "Unnamed Coordinator"}
            </h3>
            <span className="inline-block px-3 py-0.5 rounded-full text-dim font-mono text-[10px] uppercase tracking-widest mb-3 border border-ink-line">
              {coord.designation || "Team Member"}
            </span>
            <div className="flex-grow"></div>
            {showContact && coord.contact && (
              <p className="text-xs text-dim mt-2 flex items-center justify-center group-hover:text-paper transition-colors">
                <FiPhone size={12} className="mr-1.5 text-dim" />
                <a href={`tel:${coord.contact}`} className="hover:underline">
                  {coord.contact}
                </a>
              </p>
            )}
            {showSocial &&
              Array.isArray(coord.social_media_links) &&
              coord.social_media_links.length > 0 && (
                <div className="flex justify-center gap-3 mt-3 pt-3 border-t border-ink-line w-full">
                  {coord.social_media_links
                    .filter((link) => link?.trim())
                    .slice(0, 4)
                    .map((link, i) => {
                      const { Icon, colorClass } = getSocialDetails(link);
                      return (
                        <motion.a
                          key={i}
                          whileHover={{ scale: 1.25, y: -2 }}
                          whileTap={{ scale: 1.1 }}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-lg transition-colors duration-200 ${colorClass}`}
                          aria-label={`${coord.name}'s social media profile ${i + 1}`}
                        >
                          <Icon />
                        </motion.a>
                      );
                    })}
                </div>
              )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <section
      className={`${
        isUsingPassedData || !showTitleSection ? "py-4" : "py-8 md:py-12"
      }`}
    >
      {showTitleSection && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-paper pb-1">
              Meet the <em className="italic text-beacon">team</em>
            </h2>
            <p className="text-dim mt-1 text-base">
              The driving force behind the club's success.
            </p>
          </div>
          {isAdmin && openModal && !isUsingPassedData && (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                openModal("coordinator", "create", { club_id: clubId })
              }
              className="flex items-center px-5 py-2.5 bg-beacon hover:bg-beacon-soft text-ink rounded-full text-sm transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <FiPlus className="mr-2" size={18} /> Add Coordinator
            </motion.button>
          )}
        </div>
      )}

      {isLoading && <ListLoadingSkeleton />}

      {!isLoading && displayError && (
        <ListErrorState
          error={displayError}
          onRetry={handleRetryFetch}
          clubId={clubId}
        />
      )}

      {!isLoading && !displayError && (
        <>
          {coordinatorsToRender.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid ${gridClass} gap-5 md:gap-6`}
              >
                <AnimatePresence>
                  {displayedCoordinators.map(renderCoordinatorCard)}
                </AnimatePresence>
              </motion.div>

              {coordinatorsToRender.length > maxVisible && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="px-5 py-2 rounded-full border border-ink-line text-paper hover:border-beacon hover:text-beacon font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-beacon/50 focus:ring-offset-2 focus:ring-offset-ink"
                  >
                    {showAll ? "Show Less" : "Show More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <NoCoordinatorsMessage
              isAdmin={isAdmin}
              isPassedData={isUsingPassedData}
            />
          )}
        </>
      )}

      {isAdmin && confirmDeleteData && (
        <div className="fixed inset-0 bg-ink/85 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="bg-ink-2 rounded-sm p-6 w-full max-w-sm text-center border border-ink-line"
          >
            <p className="text-paper text-lg mb-3">
              Remove <span className="font-semibold text-beacon">{confirmDeleteData.name}</span>?
            </p>
            <p className="text-dim text-sm mb-6">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  performDelete(confirmDeleteData.id, confirmDeleteData.name)
                }
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDeleteData(null)}
                className="px-5 py-2 border border-ink-line text-dim hover:text-paper hover:border-dim rounded-full font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-beacon/40"
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
