import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import { FiX, FiSave, FiLoader, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  markAttendance,
  updateAttendance,
  clearAttendanceError,
} from "../../slices/attendanceSlice";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    background: "transparent",
    border: "none",
    padding: 0,
    overflow: "visible",
    maxWidth: "90vw",
    width: "500px",
  },
  overlay: {
    backgroundColor: "rgba(14, 17, 22, 0.85)",
    zIndex: 50,
  },
};

Modal.setAppElement("#root");

const AttendanceFormModal = ({
  isOpen,
  onClose,
  mode = "create",
  initialData,
}) => {
  const dispatch = useDispatch();
  const { loading: attendanceLoading, error: attendanceError } = useSelector(
    (state) => state.attendance
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStatus(mode === "edit" ? initialData.status || "" : "");
      if (attendanceError) {
        dispatch(clearAttendanceError());
      }
    }
  }, [isOpen, mode, initialData, dispatch, attendanceError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      toast.error("Please select Present or Absent.");
      return;
    }

    let action;
    let actionPayload;

    if (mode === "create") {
      actionPayload = {
        userId: initialData.userId,
        subjectId: initialData.subjectId,
        date: initialData.date,
        status,
      };
      action = markAttendance(actionPayload);
    } else {
      actionPayload = {
        recordId: initialData.recordId,
        status,
      };
      action = updateAttendance(actionPayload);
    }

    try {
      await dispatch(action).unwrap();
      onClose();
    } catch (err) {
      console.error("Attendance submission failed:", err);
    }
  };

  const handleClose = () => {
    if (attendanceError) {
      dispatch(clearAttendanceError());
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel={
        mode === "create" ? "Mark Attendance Modal" : "Edit Attendance Modal"
      }
      closeTimeoutMS={300}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-ink-2 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.45)] border border-ink-line text-paper p-6 relative overflow-hidden"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-dim hover:text-beacon transition-colors"
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>
        <h2 className="font-display text-2xl font-semibold mb-4 text-paper">
          {mode === "create" ? "Mark Attendance" : "Edit Attendance"}
        </h2>
        <div className="mb-5 bg-ink p-3 rounded-sm border border-ink-line">
          <p className="text-dim text-sm">
            <strong className="font-mono text-xs uppercase tracking-widest text-dim">
              Subject:
            </strong>{" "}
            <span className="text-paper">
              {initialData?.subjectName || "N/A"}
            </span>
          </p>
          <p className="text-dim text-sm mt-1">
            <strong className="font-mono text-xs uppercase tracking-widest text-dim">
              Date:
            </strong>{" "}
            <span className="text-paper font-mono">
              {initialData?.date || "N/A"}
            </span>
          </p>
        </div>
        {attendanceError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-sm mb-4 text-sm flex items-center"
          >
            <FiAlertCircle className="mr-2 flex-shrink-0" /> {attendanceError}
          </motion.div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-2">
              Status <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="present"
                className={`flex items-center p-3 rounded-sm border cursor-pointer transition-all duration-200 flex-1 ${
                  status === "Present"
                    ? "bg-green-500/10 border-green-500 text-green-400"
                    : "bg-ink border-ink-line text-dim hover:border-green-500/50"
                }`}
              >
                <input
                  type="radio"
                  id="present"
                  name="status"
                  value="Present"
                  checked={status === "Present"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="hidden"
                />
                <span className="ml-2 font-medium">Present</span>
              </label>
              <label
                htmlFor="absent"
                className={`flex items-center p-3 rounded-sm border cursor-pointer transition-all duration-200 flex-1 ${
                  status === "Absent"
                    ? "bg-red-500/10 border-red-500 text-red-400"
                    : "bg-ink border-ink-line text-dim hover:border-red-500/50"
                }`}
              >
                <input
                  type="radio"
                  id="absent"
                  name="status"
                  value="Absent"
                  checked={status === "Absent"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="hidden"
                />
                <span className="ml-2 font-medium">Absent</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={attendanceLoading}
              className={`px-7 py-2.5 rounded-full font-semibold flex items-center justify-center transition-colors duration-300 ${
                attendanceLoading
                  ? "bg-ink-3 text-dim cursor-not-allowed"
                  : "bg-beacon text-ink hover:bg-beacon-soft"
              }`}
            >
              {attendanceLoading ? (
                <>
                  <FiLoader className="animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default AttendanceFormModal;
