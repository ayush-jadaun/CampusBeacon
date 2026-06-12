// LostItemCard.jsx

import React, { useState } from "react";
import { IoMdCall, IoMdTime, IoMdPin } from "react-icons/io";
import {
  FaTrash,
  FaShareAlt,
  FaRegHeart,
  FaHeart,
  FaEdit,
  FaExclamationTriangle,
  FaExpand,
  FaRupeeSign,
  FaTimes,
} from "react-icons/fa";
import { Loader2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { deleteLostItem } from "../../../slices/lostAndFoundSlice";

function LostItemCard({ item, onEdit }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Allow admin to crud any card; otherwise only allow the owner to manage their card
  const isOwner =
    user?.id === item.userId || (user?.roles && user.roles.includes("admin"));

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true); // Indicate loading state
    try {
      await dispatch(deleteLostItem(item.id)).unwrap();
      showNotification("Item deleted successfully", "success");
      setShowDeleteModal(false); // Close modal on success
    } catch (error) {
      console.error("Error deleting item:", error);
      showNotification(
        "Failed to delete item: " +
          (error?.payload || error.message || "Unknown error"),
        "error"
      );
    } finally {
      setIsDeleting(false); // Reset loading state
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent image modal from opening
    if (onEdit && isOwner) {
      onEdit(item); // Call the function passed from LostAndFound component
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation(); // Prevent image modal from opening
    const shareUrl = `${window.location.origin}/lost-and-found/item/${item.id}`;
    try {
      if (navigator.share) {
        const shareData = {
          title: `Lost Item: ${item.item_name}`,
          text: `Found: ${item.item_name} at ${item.location_found}. Contact info available.`,
          url: shareUrl,
        };
        await navigator.share(shareData);
      } else {
        throw new Error("Share API not supported");
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showNotification("Link copied to clipboard!", "success");
      } catch (copyError) {
        showNotification("Could not copy link or share.", "error");
      }
    }
  };

  const toggleLike = (e) => {
    e.stopPropagation(); // Prevent image modal from opening
    setIsLiked(!isLiked);
  };

  const sanitizeDescription = (text) => {
    if (!text) return "No description provided.";
    if (/SELECT|INSERT|UPDATE|DELETE.*FROM/i.test(text)) {
      return "No description available";
    }
    return text;
  };

  const formatDate = (date) => {
    if (!date) return "a while ago";
    try {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(date).toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid date";
    }
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-ink-2 border border-ink-line rounded-sm p-6 max-w-md w-full shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="border border-red-500/40 p-3 rounded-full mb-4">
                <FaExclamationTriangle className="text-red-400" size={20} />
              </div>

              <h3 className="font-display text-2xl font-semibold text-paper mb-2">
                Delete item
              </h3>

              <p className="text-dim mb-6">
                Are you sure you want to delete "{item.item_name}"? This action
                cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-ink-line text-dim hover:text-paper hover:border-beacon py-2 rounded-full font-medium transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-paper py-2 rounded-full font-medium transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 inline" size={16} />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Image Modal Component
  const ImageModal = () => (
    <AnimatePresence>
      {showFullImage && item.image_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-screen overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 bg-ink-2 border border-ink-line hover:border-beacon text-paper p-2 rounded-full z-10 transition-colors"
            >
              <FaTimes size={16} />
            </motion.button>

            <div className="flex items-center justify-center">
              <motion.img
                src={item.image_url}
                alt={item.item_name}
                className="max-w-full max-h-screen object-contain rounded-sm border border-ink-line"
                layoutId={`lost-image-${item.id}`}
              />
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-ink-2/90 border border-ink-line text-paper px-4 py-2 rounded-sm">
              <h3 className="text-center font-display font-semibold">
                {item.item_name}
              </h3>
              {item.location_found && (
                <p className="text-center font-mono text-xs text-dim">
                  <IoMdPin className="inline mr-1" size={14} />
                  {item.location_found}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleShowDeleteModal = (e) => {
    e.stopPropagation(); // Prevent image modal from opening
    setShowDeleteModal(true);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden"
    >
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      {/* Image Modal */}
      <ImageModal />

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-2 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-sm bg-ink-2 border text-sm text-paper ${
              notification.type === "error"
                ? "border-red-500/50"
                : "border-beacon/50"
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-ink-2 border border-ink-line rounded-sm overflow-hidden hover:border-beacon transition-colors duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div
          className="relative group cursor-pointer"
          onClick={() => item.image_url && setShowFullImage(true)}
        >
          {item.image_url ? (
            <>
              <motion.div className="overflow-hidden">
                <motion.img
                  layoutId={`lost-image-${item.id}`}
                  src={item.image_url}
                  alt={item.item_name}
                  className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-ink-3 animate-pulse" />
                )}

                {/* View Image Overlay */}
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="bg-ink/80 border border-ink-line text-paper px-3 py-1.5 rounded-full font-mono text-xs uppercase tracking-widest">
                    View Image
                  </span>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="w-full h-40 sm:h-48 bg-ink-3 flex items-center justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-dim">
                No image available
              </p>
            </div>
          )}

          {/* Actions Overlay */}
          <div
            className="absolute top-2 right-2 flex space-x-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {isOwner && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEditClick}
                  className="p-1.5 text-beacon hover:text-ink hover:bg-beacon transition-colors rounded-full bg-ink/80 border border-ink-line"
                  title="Edit Item"
                >
                  <FaEdit size={14} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShowDeleteModal}
                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors rounded-full bg-ink/80 border border-ink-line"
                  title="Delete Item"
                >
                  <FaTrash size={14} />
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-1.5 text-beacon hover:text-ink hover:bg-beacon transition-colors rounded-full bg-ink/80 border border-ink-line"
              title="Share Item"
            >
              <FaShareAlt size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleLike}
              className={`p-1.5 transition-colors rounded-full bg-ink/80 border border-ink-line ${
                isLiked
                  ? "text-beacon hover:text-beacon-soft"
                  : "text-dim hover:text-paper"
              }`}
              title={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
            </motion.button>
          </div>

          {/* Location Tag */}
          <div className="absolute bottom-2 right-2">
            <motion.div
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              className="flex items-center bg-beacon px-2.5 py-1 rounded-full"
            >
              <IoMdPin className="mr-0.5 text-ink" size={12} />
              <span className="font-mono font-semibold text-ink text-xs truncate max-w-32">
                {item.location_found}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-grow flex flex-col">
          <div className="flex justify-between items-start">
            <h2 className="font-display text-lg sm:text-xl font-semibold text-paper line-clamp-1">
              {item.item_name}
            </h2>
          </div>

          <p className="text-dim text-sm leading-relaxed line-clamp-2 flex-grow">
            {sanitizeDescription(item.description)}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {item.status && (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border border-ink-line text-dim">
                {item.status}
              </span>
            )}
            {item.category && (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border border-beacon/40 text-beacon">
                {item.category}
              </span>
            )}
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center font-mono text-xs text-dim">
              <IoMdTime className="mr-1.5 flex-shrink-0" size={14} />
              <span className="truncate">
                Posted {formatDate(item.createdAt)}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent image modal from opening
                window.location.href = `tel:${item.owner_contact}`;
              }}
              className="flex items-center justify-center w-full bg-beacon hover:bg-beacon-soft text-ink px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300"
            >
              <IoMdCall size={16} className="mr-1.5 flex-shrink-0" />
              <span className="truncate font-mono">{item.owner_contact}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LostItemCard;
