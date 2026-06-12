import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Package,
  Tag,
  Phone,
  Image as ImageIcon,
  Filter,
  AlertCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ItemCard } from "../../components/features/marketplace";
import { useDispatch, useSelector } from "react-redux";
import {
  createItem,
  getAllItems,
  clearError,
  updateItem,
} from "../../slices/buyandsellSlice";

const Marketplace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, loading, error } = useSelector((state) => state.buyAndSell);

  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const [listingItem, setListingItem] = useState({
    item_name: "",
    price: "",
    category: "",
    description: "",
    item_condition: "",
    owner_contact: "",
    image: null,
  });

  const categories = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Accessories",
    "Cycle",
    "Books",
    "Sports",
    "Other",
  ];

  const conditions = [
    { value: "New", label: "New" },
    { value: "Like New", label: "Like New" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Poor", label: "Poor" },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!isAuthenticated) {
          navigate("/login", { state: { from: "/marketplace" } });
          return;
        }
        await dispatch(getAllItems());
      } catch (err) {
        showNotification(err.message, "error");
        if (
          err.message.includes("unauthorized") ||
          err.message.includes("login")
        ) {
          navigate("/login", { state: { from: "/marketplace" } });
        }
      }
    };

    if (activeTab === "browse") {
      fetchItems();
    }
    return () => {
      dispatch(clearError());
    };
  }, [activeTab, isAuthenticated, navigate, dispatch]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    // Clear any existing timeout
    if (window.notificationTimeout) {
      clearTimeout(window.notificationTimeout);
    }
    // Set a new timeout to clear the notification after 5 seconds
    window.notificationTimeout = setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      setListingItem((prev) => ({ ...prev, image: file }));
    }
  };

  const handleEditItem = (item) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setListingItem({
      item_name: item.item_name,
      price: item.price,
      category: item.category,
      description: item.description,
      item_condition: item.item_condition,
      owner_contact: item.owner_contact,
      image: null, // We can't set the file object directly, but we'll handle this in the UI
      image_url: item.image_url, // Keep track of the existing image URL
    });
    setActiveTab("sell");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sanitize description to prevent SQL queries from displaying
      const sanitizedDescription = listingItem.description?.replace(
        /SELECT|INSERT|UPDATE|DELETE.*FROM/gi,
        "[removed]"
      );

      const formData = new FormData();
      Object.keys(listingItem).forEach((key) => {
        // Skip image_url when creating FormData
        if (key !== "image_url") {
          // Only append image if it exists (for edit mode, it might be null)
          if (key === "image" && listingItem[key] === null && isEditMode) {
            // Don't append null image in edit mode
          } else if (key === "description") {
            // Use sanitized description
            formData.append(key, sanitizedDescription || "");
          } else {
            formData.append(key, listingItem[key]);
          }
        }
      });

      if (isEditMode && editItemId) {
        await dispatch(updateItem({ id: editItemId, formData })).unwrap();
        showNotification("Item updated successfully!", "success");
      } else {
        await dispatch(createItem(formData)).unwrap();
        showNotification("Item listed successfully!", "success");
      }

      // Reset form and go back to browse
      setActiveTab("browse");
      setIsEditMode(false);
      setEditItemId(null);
      setListingItem({
        item_name: "",
        price: "",
        category: "",
        description: "",
        item_condition: "",
        owner_contact: "",
        image: null,
      });
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err.message ||
          (isEditMode ? "Error updating item" : "Error listing item"),
      });
    }
  };

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        message: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !category || item.category === category;
      const matchesPriceRange =
        (!priceRange.min || item.price >= Number(priceRange.min)) &&
        (!priceRange.max || item.price <= Number(priceRange.max));
      return matchesSearch && matchesCategory && matchesPriceRange;
    });

    // Sort items
    switch (sortBy) {
      case "newest":
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return filtered.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "priceLowToHigh":
        return filtered.sort((a, b) => a.price - b.price);
      case "priceHighToLow":
        return filtered.sort((a, b) => b.price - a.price);
      default:
        return filtered;
    }
  }, [items, searchTerm, category, priceRange, sortBy]);

  const inputClasses =
    "w-full p-2.5 text-sm bg-ink border border-ink-line rounded-sm text-paper placeholder:text-dim focus:border-beacon focus:outline-none transition-colors";
  const labelClasses =
    "block font-mono text-[11px] uppercase tracking-widest text-dim mb-1.5";

  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className={`fixed top-20 right-4 z-50 p-4 bg-ink-2 border rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center space-x-2 ${
              notification.type === "error"
                ? "border-red-500/50 text-red-400"
                : "border-beacon/50 text-beacon"
            }`}
          >
            {notification.type === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <Package size={20} />
            )}
            <span className="text-sm text-paper">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-dim hover:text-paper transition-colors"
            >
              <X size={18} />
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
              ( Buy &amp; Sell )
            </span>
            <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-paper">
                Marketplace
              </h1>
              <p className="mt-3 max-w-xl text-dim">
                Books, cycles, coolers, kettles — the campus second-hand
                economy.
              </p>
            </div>
            <div className="flex border border-ink-line rounded-full bg-ink-2 p-1">
              <button
                onClick={() => setActiveTab("browse")}
                className={`px-6 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                  activeTab === "browse"
                    ? "bg-beacon text-ink font-semibold"
                    : "text-dim hover:text-paper"
                }`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveTab("sell")}
                className={`px-6 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                  activeTab === "sell"
                    ? "bg-beacon text-ink font-semibold"
                    : "text-dim hover:text-paper"
                }`}
              >
                Sell item
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
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search the marketplace..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${inputClasses} pl-10 p-3`}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-5 py-2 border rounded-full font-mono text-xs uppercase tracking-widest transition-colors ${
                      showFilters
                        ? "border-beacon text-beacon"
                        : "border-ink-line text-dim hover:border-beacon hover:text-beacon"
                    }`}
                  >
                    <Filter size={14} />
                    <span>Filters</span>
                  </button>
                </div>

                {/* Expandable Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-ink-line">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`${inputClasses} p-3`}
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
                          className={`${inputClasses} p-3`}
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="priceLowToHigh">
                            Price: Low to High
                          </option>
                          <option value="priceHighToLow">
                            Price: High to Low
                          </option>
                        </select>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange((prev) => ({
                                ...prev,
                                min: e.target.value,
                              }))
                            }
                            className={`${inputClasses} w-1/2 p-3 font-mono`}
                          />
                          <input
                            type="number"
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange((prev) => ({
                                ...prev,
                                max: e.target.value,
                              }))
                            }
                            className={`${inputClasses} w-1/2 p-3 font-mono`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Items Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-beacon" />
                  <p className="mt-4 font-mono text-xs uppercase tracking-widest text-dim">
                    Loading items...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-400 bg-ink-2 border border-red-500/40 rounded-sm">
                  <AlertCircle className="mx-auto mb-2" size={32} />
                  {error}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {filteredAndSortedItems.length > 0 ? (
                    filteredAndSortedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 border border-dashed border-ink-line rounded-sm">
                      <Package className="mx-auto mb-4 text-dim" size={40} />
                      <p className="font-display text-xl text-paper">
                        No items found
                      </p>
                      <p className="mt-1 text-sm text-dim">
                        Try a different search, or list something yourself.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sell"
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
                    {isEditMode ? "( Edit listing )" : "( New listing )"}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-paper">
                    {isEditMode ? "Edit your item" : "List your item"}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>Item Name *</label>
                    <input
                      type="text"
                      name="item_name"
                      value={listingItem.item_name}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClasses}>Price (₹) *</label>
                      <div className="relative">
                        <Tag
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim"
                          size={16}
                        />
                        <input
                          type="number"
                          name="price"
                          value={listingItem.price}
                          onChange={handleInputChange}
                          className={`${inputClasses} pl-9 font-mono`}
                          required
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>Category *</label>
                      <select
                        name="category"
                        value={listingItem.category}
                        onChange={handleInputChange}
                        className={inputClasses}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Condition *</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {conditions.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setListingItem((prev) => ({
                              ...prev,
                              item_condition: value,
                            }))
                          }
                          className={`p-2 rounded-sm border font-mono text-xs uppercase tracking-wide transition-colors ${
                            listingItem.item_condition === value
                              ? "bg-beacon border-beacon text-ink font-semibold"
                              : "bg-ink border-ink-line text-dim hover:border-beacon hover:text-beacon"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Description *</label>
                    <textarea
                      name="description"
                      value={listingItem.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={inputClasses}
                      placeholder="Describe your item's features, condition, and any other relevant details..."
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Contact Number *</label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim"
                        size={16}
                      />
                      <input
                        type="tel"
                        name="owner_contact"
                        value={listingItem.owner_contact}
                        onChange={handleInputChange}
                        pattern="[0-9]{10}"
                        className={`${inputClasses} pl-9 font-mono`}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Item Image *</label>
                    <div className="relative border border-dashed border-ink-line rounded-sm p-4 text-center hover:border-beacon transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="imageUpload"
                        required={!isEditMode && !listingItem.image}
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {listingItem.image ? (
                          <div className="relative w-full">
                            <img
                              src={URL.createObjectURL(listingItem.image)}
                              alt="Preview"
                              className="w-full h-32 sm:h-48 object-cover rounded-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                document.getElementById("imageUpload").click()
                              }
                              className="absolute inset-0 bg-ink/70 opacity-0 hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center"
                            >
                              <span className="font-mono text-xs uppercase tracking-widest text-paper">
                                Change Image
                              </span>
                            </button>
                          </div>
                        ) : isEditMode && listingItem.image_url ? (
                          <div className="relative w-full">
                            <img
                              src={listingItem.image_url}
                              alt="Current"
                              className="w-full h-32 sm:h-48 object-cover rounded-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                document.getElementById("imageUpload").click()
                              }
                              className="absolute inset-0 bg-ink/70 opacity-0 hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center"
                            >
                              <span className="font-mono text-xs uppercase tracking-widest text-paper">
                                Change Image
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <ImageIcon className="text-dim mb-2" size={24} />
                            <p className="text-sm text-dim">
                              Click to upload (max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("browse")}
                      className="px-5 py-2 text-sm rounded-full border border-ink-line text-dim hover:text-paper hover:border-beacon transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 text-sm rounded-full bg-beacon text-ink font-semibold hover:bg-beacon-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" size={16} />
                          <span>
                            {isEditMode
                              ? "Updating Item..."
                              : "Listing Item..."}
                          </span>
                        </div>
                      ) : isEditMode ? (
                        "Update Item"
                      ) : (
                        "List Item for Sale"
                      )}
                    </button>
                  </div>

                  <p className="font-mono text-[11px] uppercase tracking-wide text-dim text-center">
                    By listing an item, you agree to our marketplace guidelines.
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

export default Marketplace;
