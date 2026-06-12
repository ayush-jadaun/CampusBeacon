// LostAndFound.jsx

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Rocket,
  Search,
  Loader2 as Loader, // Use Loader2 for consistency
  Camera,
  MapPin as Map, // Use MapPin for consistency
  Phone,
  Filter,
  AlertCircle,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLostItems,
  addLostItem,
  updateLostItem, // Import updateLostItem
  clearLostAndFoundError,
} from "../../slices/lostAndFoundSlice";
import { LostItemCard } from "../../components/features/marketplace";

const LostAndFound = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.lostAndFound);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const [listingItem, setListingItem] = useState({
    item_name: "",
    description: "",
    location_found: "",
    owner_contact: "",
    category: "",
    image: null,
    image_url: null, // To store existing image URL during edit
  });

  const categories = [
    "Electronics",
    "Documents",
    "Keys",
    "Wallets/Purses",
    "Clothing",
    "Accessories",
    "Books/Notes",
    "Cards",
    "Other",
  ];

  useEffect(() => {
    if (activeTab === "browse") {
      dispatch(fetchLostItems());
    }
  }, [activeTab, dispatch]);

useEffect(() => {
  if (error) {
    setNotification({
      type: "error",
      message: error,
    });
    const timer = setTimeout(() => {
      dispatch(clearLostAndFoundError());
      setNotification(null);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      // Create a preview URL for the newly selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setListingItem((prev) => ({
          ...prev,
          image: file,
          image_url: reader.result,
        })); // Set image_url for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setListingItem((prev) => ({ ...prev, image: null, image_url: null }));
    // Reset the file input if needed
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    if (window.lafNotificationTimeout) {
      clearTimeout(window.lafNotificationTimeout);
    }
    window.lafNotificationTimeout = setTimeout(
      () => setNotification(null),
      4000
    );
  };

  // Function to handle editing an item
  const handleEditItem = (item) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setListingItem({
      item_name: item.item_name || "",
      description: item.description || "",
      location_found: item.location_found || "",
      owner_contact: item.owner_contact || "",
      category: item.category || "",
      image: null, // Reset image file input
      image_url: item.image_url || null, // Keep existing image URL for preview
    });
    setActiveTab("found"); // Switch to the form tab
  };

  const resetFormAndState = () => {
    setListingItem({
      item_name: "",
      description: "",
      location_found: "",
      owner_contact: "",
      category: "",
      image: null,
      image_url: null,
    });
    setIsEditMode(false);
    setEditItemId(null);
    // Reset file input
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation example
    if (
      !listingItem.item_name ||
      !listingItem.category ||
      !listingItem.location_found ||
      !listingItem.owner_contact
    ) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(listingItem.owner_contact)) {
      showNotification(
        "Please enter a valid 10-digit Indian mobile number.",
        "error"
      );
      return;
    }

    const formData = new FormData();
    // Append all fields except image_url
    Object.keys(listingItem).forEach((key) => {
      if (key !== "image_url") {
        // Only append image if it's a new file (not null)
        if (key === "image" && listingItem[key]) {
          formData.append(key, listingItem[key]);
        } else if (key !== "image") {
          // Append other fields, ensuring empty strings are sent if needed
          formData.append(key, listingItem[key] || "");
        }
      }
    });

    try {
      if (isEditMode && editItemId) {
        // Dispatch update action
        await dispatch(updateLostItem({ id: editItemId, formData })).unwrap();
        showNotification("Item updated successfully!", "success");
      } else {
        // Dispatch add action
        await dispatch(addLostItem(formData)).unwrap();
        showNotification("Item reported successfully!", "success");
      }
      resetFormAndState(); // Reset form and edit state
      setActiveTab("browse"); // Go back to browse tab
    } catch (err) {
      // Error message extraction improvement
      const errorMessage =
        err?.payload ||
        err.message ||
        (isEditMode ? "Error updating item" : "Error reporting item");
      showNotification(errorMessage, "error");
      // Do not switch tab or reset form on error
    }
  };

  const handleCancel = () => {
    resetFormAndState();
    setActiveTab("browse");
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let result = items.filter((item) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        item.item_name?.toLowerCase().includes(lowerSearchTerm) ||
        item.description?.toLowerCase().includes(lowerSearchTerm) ||
        item.location_found?.toLowerCase().includes(lowerSearchTerm);
      const matchesCategory = !category || item.category === category;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "newest":
        return result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return result.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      default:
        return result;
    }
  }, [items, searchTerm, category, sortBy]);

  // Separate loading state for initial fetch vs form submission
  const initialLoading = loading && !items.length; // Loading only when items are empty
  const formSubmitting = loading && activeTab === "found"; // Loading only when submitting form

  const inputClasses =
    "w-full p-2.5 text-sm bg-ink border border-ink-line rounded-sm text-paper placeholder:text-dim focus:border-beacon focus:outline-none transition-colors";
  const labelClasses =
    "block font-mono text-[11px] uppercase tracking-widest text-dim mb-1.5";

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="animate-spin text-beacon" size={36} />
          <p className="font-mono text-xs uppercase tracking-widest text-dim">
            Loading lost items...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className={`fixed top-20 right-4 z-[60] p-3 bg-ink-2 border rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.45)] text-sm flex items-center space-x-2 ${
              notification.type === "error"
                ? "border-red-500/50 text-red-400"
                : "border-beacon/50 text-beacon"
            }`}
          >
            {notification.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <Rocket size={18} />
            )}
            <span className="text-paper">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto p-1 rounded-full text-dim hover:text-paper transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-xs sm:text-sm text-beacon tracking-[0.25em] uppercase">
              ( Lost &amp; Found )
            </span>
            <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-paper">
                Lost &amp; Found
              </h1>
              <p className="mt-3 max-w-xl text-dim">
                Lost your ID near the library? Someone here has probably found
                it.
              </p>
            </div>
            <div className="flex border border-ink-line rounded-full bg-ink-2 p-1">
              <button
                onClick={() => {
                  setActiveTab("browse");
                  resetFormAndState();
                }} // Reset form when switching tabs
                className={`px-5 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                  activeTab === "browse"
                    ? "bg-beacon text-ink font-semibold"
                    : "text-dim hover:text-paper"
                }`}
              >
                Browse
              </button>
              <button
                onClick={() => {
                  setActiveTab("found");
                  resetFormAndState();
                }} // Reset form when switching tabs
                className={`px-5 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                  activeTab === "found" && !isEditMode // Highlight only when adding, not editing
                    ? "bg-beacon text-ink font-semibold"
                    : "text-dim hover:text-paper"
                }`}
              >
                Report item
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "browse" ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Search and Filters */}
              <motion.div
                className="bg-ink-2 border border-ink-line rounded-sm p-4 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search by item name, description, location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 px-5 py-2 border rounded-full font-mono text-xs uppercase tracking-widest transition-colors flex-shrink-0 ${
                      showFilters
                        ? "border-beacon text-beacon"
                        : "border-ink-line text-dim hover:border-beacon hover:text-beacon"
                    }`}
                  >
                    <Filter size={14} />
                    <span>Filters</span>
                    {showFilters ? <X size={14} className="ml-1" /> : null}
                  </button>
                </div>

                {/* Expandable Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        marginTop: "0.75rem",
                      }} // Adjust margin as needed
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-ink-line">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={inputClasses}
                        >
                          <option value="">All Categories</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={inputClasses}
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Items Grid */}
              {error && !items.length ? ( // Show specific error if fetch failed and no items are present
                <motion.div
                  className="col-span-full text-center py-6 md:py-10 bg-ink-2 rounded-sm border border-red-500/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <AlertCircle size={36} className="text-red-400" />
                    <p className="font-display text-lg text-paper">
                      Failed to load items
                    </p>
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                      onClick={() => dispatch(fetchLostItems())}
                      className="mt-2 px-5 py-1.5 bg-beacon text-ink rounded-full text-sm font-semibold hover:bg-beacon-soft transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        "Retry"
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {filteredAndSortedItems.length > 0 ? (
                    filteredAndSortedItems.map((item) => (
                      <LostItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem} // Pass the edit handler
                      />
                    ))
                  ) : (
                    <motion.div
                      className="col-span-full text-center py-12 md:py-16 border border-dashed border-ink-line rounded-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <Search size={36} className="text-dim" />
                        <p className="font-display text-xl text-paper">
                          {searchTerm || category
                            ? "No items match your filters"
                            : "No items reported yet"}
                        </p>
                        {searchTerm || category ? (
                          <p className="text-sm text-dim">
                            Try adjusting your search or filters.
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <form
                onSubmit={handleSubmit}
                className="bg-ink-2 border border-ink-line rounded-sm p-5 md:p-8 max-w-2xl w-full"
              >
                <div className="mb-6 pb-4 border-b border-ink-line">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-beacon mb-2">
                    {isEditMode ? "( Edit report )" : "( New report )"}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-paper">
                    {isEditMode ? "Edit reported item" : "Report found item"}
                  </h2>
                </div>
                <div className="space-y-4">
                  {/* Item Name */}
                  <div>
                    <label className={labelClasses}>Item Name *</label>
                    <input
                      type="text"
                      name="item_name"
                      value={listingItem.item_name}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                      maxLength={100}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className={labelClasses}>Category *</label>
                    <select
                      name="category"
                      value={listingItem.category}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className={labelClasses}>
                      Description <span className="text-dim/60">(Optional)</span>
                    </label>
                    <textarea
                      name="description"
                      value={listingItem.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={inputClasses}
                      placeholder="Add details like color, brand, specific marks..."
                      maxLength={500}
                    ></textarea>
                  </div>

                  {/* Location and Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClasses}>Location Found *</label>
                      <div className="relative">
                        <Map
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim"
                          size={16}
                        />
                        <input
                          type="text"
                          name="location_found"
                          value={listingItem.location_found}
                          onChange={handleInputChange}
                          className={`${inputClasses} pl-9`}
                          placeholder="e.g., Library 2nd floor"
                          required
                          maxLength={150}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Contact Number *</label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim"
                          size={16}
                        />
                        <input
                          type="tel" // Use tel type
                          name="owner_contact"
                          value={listingItem.owner_contact}
                          onChange={handleInputChange}
                          pattern="[6-9]\d{9}" // Basic Indian mobile pattern
                          title="Please enter a valid 10-digit Indian mobile number"
                          className={`${inputClasses} pl-9 font-mono`}
                          placeholder="10-digit mobile number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className={labelClasses}>
                      {isEditMode
                        ? "Replace Image (Optional)"
                        : "Upload Image (Optional)"}
                    </label>
                    <div className="relative border border-dashed border-ink-line rounded-sm p-4 text-center hover:border-beacon transition-colors group">
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="imageUpload"
                        // Make not required
                      />
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center space-y-2 min-h-[80px]">
                          {listingItem.image_url ? (
                            // Show preview (either existing or newly uploaded)
                            <div className="relative w-full max-w-[200px] mx-auto">
                              <img
                                src={listingItem.image_url}
                                alt="Item Preview"
                                className="w-full h-24 object-contain rounded-sm bg-ink"
                              />
                              {/* Overlay to change/remove */}
                              <div className="absolute inset-0 bg-ink/75 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col items-center justify-center space-y-1">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-paper">
                                  Change Image
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearImage();
                                  }}
                                  className="text-red-400 hover:text-red-300 font-mono text-[10px] uppercase tracking-widest p-1 rounded-sm border border-red-500/40"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Placeholder
                            <>
                              <Camera className="text-dim" size={24} />
                              <p className="text-sm text-dim">
                                Click or drag to upload
                              </p>
                              <p className="font-mono text-[10px] uppercase tracking-widest text-dim/70">
                                JPG, PNG, WEBP (Max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    {listingItem.image && ( // Show filename if a new file is selected
                      <p className="font-mono text-[11px] text-dim mt-1.5 text-center">
                        New file selected: {listingItem.image.name}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2 text-sm rounded-full border border-ink-line text-dim hover:text-paper hover:border-beacon transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-6 py-2 text-sm rounded-full bg-beacon text-ink font-semibold hover:bg-beacon-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                      {formSubmitting ? (
                        <>
                          <Loader className="animate-spin mr-2" size={16} />
                          <span>
                            {isEditMode ? "Updating..." : "Submitting..."}
                          </span>
                        </>
                      ) : isEditMode ? (
                        "Update Item"
                      ) : (
                        "Submit Report"
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-dim text-center pt-1">
                    Please ensure all information is accurate before submitting.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LostAndFound;
