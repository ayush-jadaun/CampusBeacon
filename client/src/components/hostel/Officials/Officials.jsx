import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Edit, Plus, X, ChevronDown } from "lucide-react";
import { FaUsersGear } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteOfficial,
  getOfficialsByHostel,
  createOfficial,
  editOfficial,
} from "../../../slices/hostelSlice";
const Officials = ({ hostelId }) => {
  const { officials, loading, error } = useSelector((state) => state.hostel);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [deleteError, setDeleteError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    phone: "",
    email: "",
    official_id: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const officialsContainerRef = useRef(null);

  // Updated permission check to use roles from auth state.
  const hasPermission = useMemo(() => {
    return (
      user &&
      (user.roles.includes("admin") || user.roles.includes("hostel_president"))
    );
  }, [user]);

  // Fetch officials on component mount
  useEffect(() => {
    if (hostelId) {
      dispatch(getOfficialsByHostel(hostelId));
    }
  }, [hostelId, dispatch]);

  // Memoize filtered officials for the current hostel
  const hostelOfficials = useMemo(() => {
    if (!Array.isArray(officials[hostelId])) return [];
    return officials[hostelId];
  }, [officials, hostelId]);

  // Check if scroll indicator should be shown
  useEffect(() => {
    if (hostelOfficials.length > 3 && officialsContainerRef.current) {
      setShowScrollIndicator(true);
    } else {
      setShowScrollIndicator(false);
    }
  }, [hostelOfficials]);

  // Handle scroll event to hide indicator when scrolled to bottom
  const handleScroll = () => {
    if (officialsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        officialsContainerRef.current;
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20;

      if (isScrolledToBottom) {
        setShowScrollIndicator(false);
      } else if (hostelOfficials.length > 3) {
        setShowScrollIndicator(true);
      }
    }
  };

  const handleDeleteOfficial = async (officialId) => {
    if (!officialId || !hasPermission) return;

    // Ask for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this official?")) {
      return;
    }

    try {
      setDeleteError("");
      await dispatch(deleteOfficial(officialId)).unwrap();
    } catch (error) {
      setDeleteError(
        error.message || "Error deleting official. Please try again."
      );
      console.error("Error deleting official:", error);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      name: "",
      designation: "",
      phone: "",
      email: "",
      official_id: null,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (official) => {
    setModalMode("edit");
    setFormData({
      name: official.name,
      designation: official.designation,
      phone: official.phone,
      email: official.email,
      official_id: official.official_id,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user changes input
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.designation.trim())
      errors.designation = "Designation is required";

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (modalMode === "create") {
        await dispatch(
          createOfficial({
            hostelId,
            name: formData.name,
            designation: formData.designation,
            phone: formData.phone,
            email: formData.email,
          })
        ).unwrap();
      } else {
        await dispatch(
          editOfficial({
            officialId: formData.official_id,
            name: formData.name,
            designation: formData.designation,
            phone: formData.phone,
            email: formData.email,
          })
        ).unwrap();
      }
      closeModal();
    } catch (error) {
      console.error("Error saving official:", error);
      setFormErrors((prev) => ({
        ...prev,
        form: error.message || "Error saving official. Please try again.",
      }));
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ink-2 rounded-sm p-6 border border-red-500/40"
      >
        <p className="text-red-400">Error: {error}</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ink-2 rounded-sm p-6 border border-ink-line"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-ink-3 rounded-sm w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-sm border border-ink-line bg-ink">
                <div className="h-6 bg-ink-3 rounded-sm w-1/3 mb-2"></div>
                <div className="h-4 bg-ink-3 rounded-sm w-1/2"></div>
                <div className="h-4 bg-ink-3 rounded-sm w-1/3 mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ink-2 rounded-sm p-6 border border-ink-line"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-2xl font-semibold text-paper flex items-center">
          <FaUsersGear className="mr-2 text-beacon" /> Hostel Officials
        </h2>
        {hasPermission && (
          <button
            onClick={openCreateModal}
            className="bg-beacon hover:bg-beacon-soft text-ink font-semibold px-4 py-2 rounded-full flex items-center text-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Official
          </button>
        )}
      </div>

      {deleteError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/40 rounded-sm">
          <p className="text-red-400">{deleteError}</p>
        </div>
      )}

      {/* Scrollable container with fixed height - removed scrollbars */}
      <div className="relative">
        <div
          ref={officialsContainerRef}
          className="space-y-4 max-h-96 overflow-y-auto pr-2"
          style={{
            msOverflowStyle: "none" /* IE and Edge */,
            scrollbarWidth: "none" /* Firefox */,
          }}
          onScroll={handleScroll}
        >
          {/* CSS to hide scrollbar for Chrome, Safari and Opera */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {hostelOfficials.length === 0 ? (
            <p className="text-center text-dim py-4">No officials found</p>
          ) : (
            hostelOfficials.map((official) => (
              <motion.div
                key={official.official_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-sm border border-ink-line bg-ink flex flex-col md:flex-row justify-between hover:border-beacon/50 transition-colors"
                layout
              >
                <div className="w-full md:w-3/4">
                  <h3 className="font-display text-xl font-semibold text-paper">
                    {official.name}
                  </h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-dim mt-0.5">
                    {official.designation}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center mt-2 sm:space-x-4 space-y-2 sm:space-y-0">
                    <a
                      href={`tel:${official.phone}`}
                      className="flex items-center text-dim hover:text-beacon transition-colors truncate max-w-xs"
                    >
                      <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate font-mono text-sm">{official.phone}</span>
                    </a>
                    <a
                      href={`mailto:${official.email}`}
                      className="flex items-center text-dim hover:text-beacon transition-colors truncate max-w-xs"
                    >
                      <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate font-mono text-sm">{official.email}</span>
                    </a>
                  </div>
                </div>
                {hasPermission && (
                  <div className="flex items-center space-x-2 mt-3 md:mt-0 justify-end">
                    <button
                      onClick={() => openEditModal(official)}
                      className="text-dim hover:text-beacon transition-colors px-3 py-1.5 rounded-full hover:bg-ink-3"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOfficial(official.official_id)}
                      className="text-dim hover:text-red-400 transition-colors px-3 py-1.5 rounded-full hover:bg-ink-3"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Scroll Down Indicator */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
              onClick={() => {
                if (officialsContainerRef.current) {
                  officialsContainerRef.current.scrollTop += 100;
                }
              }}
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-beacon text-ink p-2 rounded-full"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
              <span className="font-mono text-xs text-dim mt-1">
                Scroll for more
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal for Create/Edit Official */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-ink-2 border border-ink-line rounded-sm p-6 w-full max-w-md relative shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-dim hover:text-beacon transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-xl font-semibold text-paper mb-4">
              {modalMode === "create" ? "Add New Official" : "Edit Official"}
            </h3>

            <form onSubmit={handleSubmit}>
              {formErrors.form && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-sm">
                  <p className="text-red-400 text-sm">{formErrors.form}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full bg-ink text-paper border ${
                      formErrors.name ? "border-red-500" : "border-ink-line"
                    } rounded-sm p-2.5 focus:outline-none focus:border-beacon transition-colors`}
                  />
                  {formErrors.name && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className={`w-full bg-ink text-paper border ${
                      formErrors.designation
                        ? "border-red-500"
                        : "border-ink-line"
                    } rounded-sm p-2.5 focus:outline-none focus:border-beacon transition-colors`}
                  />
                  {formErrors.designation && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.designation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full bg-ink text-paper border ${
                      formErrors.phone ? "border-red-500" : "border-ink-line"
                    } rounded-sm p-2.5 focus:outline-none focus:border-beacon transition-colors`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-ink text-paper border ${
                      formErrors.email ? "border-red-500" : "border-ink-line"
                    } rounded-sm p-2.5 focus:outline-none focus:border-beacon transition-colors`}
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-ink-line rounded-full text-dim hover:border-beacon hover:text-beacon transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-beacon hover:bg-beacon-soft rounded-full text-ink font-semibold transition-colors"
                  >
                    {modalMode === "create" ? "Add Official" : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Officials;
