import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onDeleteConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink/80 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-ink-2 p-6 sm:p-8 rounded-sm max-w-md w-full border border-ink-line shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl font-semibold text-paper mb-4 flex items-center">
          <Trash2 className="mr-3 text-red-400" /> Confirm Deletion
        </h3>
        <p className="text-dim mb-6">
          Are you sure you want to delete this ride? This action cannot be
          undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDeleteConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-paper py-3 rounded-full transition-colors font-medium"
          >
            Delete
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 border border-ink-line text-dim hover:text-paper hover:border-beacon py-3 rounded-full transition-colors font-medium"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmationModal;
