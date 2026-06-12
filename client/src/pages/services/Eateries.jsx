import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  Phone,
  Star,
  X,
  Edit,
  Trash2,
  Plus,
  Search, // Added Search icon
  Loader2, // Added Loader icon
  AlertTriangle, // Added Alert icon
} from "lucide-react";
import { IoFastFoodOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEateries,
  createEatery,
  updateEatery,
  deleteEatery,
  submitRating,
  // Removed setSelectedEatery as it wasn't used here
} from "../../slices/eateriesSlice";
import StarRating from "../../components/eateries/StarRating";
import EateryForm from "../../components/eateries/EateryForm"; // Assuming this path is correct

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  exit: { y: -10, opacity: 0 },
};

const modalOverlay = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContent = {
  hidden: { scale: 0.95, opacity: 0, y: 10 },
  show: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const CollegeEateries = () => {
  const dispatch = useDispatch();
  const { eateries, loading, error } = useSelector((state) => state.eateries);
  const { roles } = useSelector((state) => state.auth);
  const isAdmin = useMemo(
    () => Array.isArray(roles) && roles.includes("admin"),
    [roles]
  );

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [ratingModal, setRatingModal] = useState(null); // Store eatery ID
  const [currentRating, setCurrentRating] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEatery, setEditingEatery] = useState(null); // Store full eatery object
  const [confirmDelete, setConfirmDelete] = useState(null); // Store eatery object
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch eateries on mount
  useEffect(() => {
    dispatch(fetchEateries());
  }, [dispatch]);

  // Filter eateries based on search term (Memoized for performance)
  const filteredEateries = useMemo(() => {
    if (!eateries) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return eateries.filter(
      (eatery) =>
        eatery.name?.toLowerCase().includes(lowerSearchTerm) ||
        eatery.location?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [eateries, searchTerm]);

  // Handlers
  const handleSubmitRating = () => {
    if (!ratingModal) return;
    dispatch(submitRating({ eateryId: ratingModal, rating: currentRating }));
    setRatingModal(null);
    setCurrentRating(0);
  };

  const handleFormSubmit = async (formData, menuImage) => {
    try {
      if (editingEatery) {
        await dispatch(
          updateEatery({
            id: editingEatery.id,
            eateryData: formData,
            menuImage,
          })
        ).unwrap(); // unwrap to catch potential errors
        setEditingEatery(null);
      } else {
        await dispatch(
          createEatery({ eateryData: formData, menuImage })
        ).unwrap();
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to save eatery:", err);
      // Optionally show an error toast to the user
    }
  };

  const handleEdit = (eatery) => {
    setEditingEatery(eatery);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await dispatch(deleteEatery(confirmDelete.id)).unwrap();
      setConfirmDelete(null);
    } catch (err) {
      console.error("Failed to delete eatery:", err);
      // Optionally show an error toast to the user
      setConfirmDelete(null); // Close modal even on error
    }
  };

  const openImageModal = (images) => images?.length && setSelectedImage(images);
  const openMenuModal = (menuUrl) => menuUrl && setSelectedMenu(menuUrl);
  const openRatingModal = (eateryId) => eateryId && setRatingModal(eateryId);
  const openDeleteModal = (eatery) => eatery && setConfirmDelete(eatery);
  const openAddForm = () => {
    setEditingEatery(null);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEatery(null);
  };

  return (
    <div className="min-h-screen bg-ink text-paper p-4 pt-24 sm:p-8 sm:pt-28">
      <div className="container mx-auto max-w-7xl">
        {/* --- Header Section --- */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Title Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center sm:text-left"
            >
              <p className="font-mono text-[11px] tracking-[0.3em] text-beacon uppercase mb-2">
                Chai stalls · Canteens · Late-night bites
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-paper">
                Campus <em className="italic text-beacon">Eateries</em>
              </h1>
              <p className="text-sm text-dim mt-2">
                Discover dining options at MNNIT
              </p>
            </motion.div>

            {/* Controls Area */}
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-center sm:justify-end w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-ink-2 border border-ink-line rounded-full py-2 px-4 pl-10 text-paper placeholder-dim focus:outline-none focus:border-beacon transition-colors w-full sm:w-64 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim h-5 w-5 pointer-events-none" />
              </div>
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openAddForm}
                  className="bg-beacon hover:bg-beacon-soft text-ink py-2 px-5 rounded-full transition-colors text-sm font-semibold flex items-center"
                >
                  <Plus size={18} className="mr-1.5" /> Add New
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* --- Content Area --- */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-beacon animate-spin" />
            <span className="ml-4 text-xl text-dim">
              Loading Eateries...
            </span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-xl text-red-400 mb-2">Failed to load eateries</p>
            <p className="text-dim">{error}</p>
            <button
              onClick={() => dispatch(fetchEateries())}
              className="mt-6 bg-beacon hover:bg-beacon-soft text-ink py-2 px-5 rounded-full transition-colors text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && eateries && (
          <motion.div
            key={searchTerm} // Re-trigger animation on filter change
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit" // Add exit prop if needed elsewhere
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredEateries.map((eatery) => (
              <motion.div
                key={eatery.id}
                variants={item}
                layoutId={`card-${eatery.id}`} // For potential future animated modal opening
                className="bg-ink-2 rounded-sm overflow-hidden border border-ink-line relative transition-colors duration-300 hover:border-beacon/60 group"
              >
                {/* Admin Controls */}
                {isAdmin && (
                  <div className="absolute top-2.5 right-2.5 z-20 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(eatery)}
                      aria-label="Edit Eatery"
                      className="bg-ink/90 border border-ink-line p-1.5 rounded-full text-paper hover:bg-beacon hover:border-beacon hover:text-ink transition-colors"
                    >
                      <Edit size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openDeleteModal(eatery)}
                      aria-label="Delete Eatery"
                      className="bg-ink/90 border border-ink-line p-1.5 rounded-full text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                )}

                {/* Image/Placeholder */}
                <div
                  className="relative h-48 cursor-pointer overflow-hidden group/image" // group/image for nested hover
                  onClick={() => openImageModal(eatery.images)}
                >
                  {eatery.images?.[0] ? (
                    <img
                      src={eatery.images[0]}
                      alt={`${eatery.name} view`}
                      loading="lazy" // Performance: Lazy load images
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover/image:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-ink-3 flex items-center justify-center">
                      <IoFastFoodOutline className="text-dim w-16 h-16 opacity-50" />
                    </div>
                  )}
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-ink/85 px-2.5 py-1 rounded-full flex items-center border border-ink-line">
                    <Star className="w-4 h-4 text-beacon fill-beacon mr-1.5" />
                    <span className="text-paper font-mono text-sm">
                      {eatery.averageRating?.toFixed(1) ?? "N/A"}
                    </span>
                  </div>
                  {/* Open/Closed Badge */}
                  <div
                    className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest ${
                      eatery.isOpen
                        ? "bg-paper text-ink"
                        : "bg-ink/85 text-dim border border-ink-line"
                    }`}
                  >
                    {eatery.isOpen ? "Open Now" : "Closed"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <h2
                    className="font-display text-xl font-medium text-paper mb-2 line-clamp-1"
                    title={eatery.name}
                  >
                    {eatery.name}
                  </h2>
                  <div className="space-y-2 mb-4 text-sm flex-grow">
                    <p className="text-dim flex items-start">
                      <MapPin
                        size={15}
                        className="mr-2 mt-0.5 text-dim flex-shrink-0"
                      />
                      <span className="line-clamp-1" title={eatery.location}>
                        {eatery.location}
                      </span>
                    </p>
                    <p className="text-dim flex items-center">
                      <Clock
                        size={15}
                        className="mr-2 text-dim flex-shrink-0"
                      />
                      {eatery.openingTime ?? "N/A"} -{" "}
                      {eatery.closingTime ?? "N/A"}
                    </p>
                    <p className="text-dim flex items-center">
                      <Phone
                        size={15}
                        className="mr-2 text-dim flex-shrink-0"
                      />
                      {eatery.phoneNumber ?? "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openRatingModal(eatery.id)}
                      className="flex-1 bg-beacon hover:bg-beacon-soft text-ink py-2 px-3 rounded-full transition-colors text-sm font-semibold"
                    >
                      Rate
                    </motion.button>
                    {eatery.menuImageUrl && (
                      <motion.button
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openMenuModal(eatery.menuImageUrl)}
                        className="flex-1 border border-ink-line text-paper hover:bg-paper hover:border-paper hover:text-ink py-2 px-3 rounded-full transition-colors text-sm font-medium"
                      >
                        Menu
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results Message */}
        {!loading && !error && filteredEateries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-dim"
          >
            <IoFastFoodOutline className="mx-auto h-16 w-16 opacity-50 mb-4" />
            <p className="font-display text-xl text-paper mb-2">
              {eateries?.length > 0
                ? "No eateries match your search."
                : "No eateries found."}
            </p>
            {eateries?.length > 0 && searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="link-sweep mt-2 font-mono text-sm tracking-wide text-beacon px-1 py-1"
              >
                Clear search
              </button>
            )}
            {!isAdmin && eateries?.length === 0 && (
              <p className="text-sm mt-2">
                Check back later for new additions!
              </p>
            )}
            {isAdmin && eateries?.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddForm}
                className="mt-4 bg-beacon hover:bg-beacon-soft text-ink py-2 px-5 rounded-full transition-colors text-sm font-semibold flex items-center mx-auto"
              >
                <Plus size={18} className="mr-1.5" /> Add the First Eatery
              </motion.button>
            )}
          </motion.div>
        )}

        {/* --- Modals --- */}
        <AnimatePresence>
          {/* Image Viewer Modal */}
          {selectedImage && (
            <motion.div
              variants={modalOverlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 bg-ink/85 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                variants={modalContent}
                className="relative max-w-4xl w-full bg-ink-2 p-4 rounded-sm border border-ink-line"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
              >
                <motion.button
                  className="absolute -top-3 -right-3 text-paper bg-ink-3 border border-ink-line hover:bg-beacon hover:border-beacon hover:text-ink p-1.5 rounded-full transition-colors z-10"
                  onClick={() => setSelectedImage(null)}
                  aria-label="Close image viewer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[80vh] overflow-y-auto">
                  {selectedImage.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="overflow-hidden rounded-sm"
                    >
                      <img
                        src={img}
                        alt={`Eatery view ${index + 1}`}
                        className="w-full h-64 object-cover rounded-sm hover:scale-105 transition-transform duration-200"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Menu Viewer Modal */}
          {selectedMenu && (
            <motion.div
              variants={modalOverlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 bg-ink/85 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedMenu(null)}
            >
              <motion.div
                variants={modalContent}
                className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden bg-ink-2 rounded-sm border border-ink-line"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  className="absolute -top-3 -right-3 text-paper bg-ink-3 border border-ink-line hover:bg-beacon hover:border-beacon hover:text-ink p-1.5 rounded-full transition-colors z-10"
                  onClick={() => setSelectedMenu(null)}
                  aria-label="Close menu viewer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
                <img
                  src={selectedMenu}
                  alt="Menu"
                  className="w-full h-auto object-contain max-h-[85vh] rounded-sm"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Rating Modal */}
          {ratingModal && (
            <motion.div
              variants={modalOverlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 bg-ink/85 flex items-center justify-center z-50 p-4"
              onClick={() => setRatingModal(null)} // Allow closing by clicking overlay
            >
              <motion.div
                variants={modalContent}
                className="bg-ink-2 p-6 rounded-sm max-w-md w-full border border-ink-line"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-xl font-semibold text-paper mb-4 text-center">
                  Rate {eateries?.find((e) => e.id === ratingModal)?.name ?? ""}
                </h3>
                <div className="flex justify-center mb-6">
                  <StarRating
                    rating={currentRating}
                    setRating={setCurrentRating}
                    size={32}
                  />
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmitRating}
                    className="flex-1 bg-beacon hover:bg-beacon-soft text-ink py-2.5 px-4 rounded-full transition-colors font-semibold text-sm"
                  >
                    Submit Rating
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setRatingModal(null);
                      setCurrentRating(0);
                    }}
                    className="flex-1 border border-ink-line text-dim hover:text-paper hover:border-dim py-2.5 px-4 rounded-full transition-colors font-medium text-sm"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Add/Edit Form Modal */}
          {isFormOpen && (
            <motion.div
              variants={modalOverlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 bg-ink/85 flex items-center justify-center z-50 p-4"
              onClick={closeForm}
            >
              <motion.div
                variants={modalContent}
                className="bg-ink-2 p-6 rounded-sm max-w-lg w-full border border-ink-line max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-xl font-semibold text-paper mb-6 flex items-center">
                  {editingEatery ? (
                    <>
                      {" "}
                      <Edit size={20} className="mr-2.5 text-beacon" /> Edit
                      Eatery{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Plus size={20} className="mr-2.5 text-beacon" /> Add
                      New Eatery{" "}
                    </>
                  )}
                  <button
                    onClick={closeForm}
                    className="ml-auto text-dim hover:text-paper"
                  >
                    <X size={20} />
                  </button>
                </h3>
                <EateryForm
                  initialData={editingEatery}
                  onSubmit={handleFormSubmit}
                  onCancel={closeForm}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          {confirmDelete && (
            <motion.div
              variants={modalOverlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 bg-ink/85 flex items-center justify-center z-50 p-4"
              onClick={() => setConfirmDelete(null)}
            >
              <motion.div
                variants={modalContent}
                className="bg-ink-2 p-6 rounded-sm max-w-md w-full border border-red-500/40"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-xl font-semibold text-paper mb-4 flex items-center">
                  <AlertTriangle size={20} className="mr-2.5 text-red-400" />{" "}
                  Confirm Deletion
                </h3>
                <p className="text-dim mb-6 text-sm">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-paper">
                    {confirmDelete.name}
                  </span>
                  ?
                  <br />
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDeleteConfirm}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-full transition-colors font-medium text-sm"
                  >
                    Delete Permanently
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 border border-ink-line text-dim hover:text-paper hover:border-dim py-2.5 px-4 rounded-full transition-colors font-medium text-sm"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollegeEateries;
