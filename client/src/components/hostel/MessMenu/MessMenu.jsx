import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  HiOutlineCalendar,
  HiPencil,
  HiTrash,
  HiViewList,
  HiPlus,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi";
import {
  createMenu,
  updateMenuMeal,
  deleteMenuMeal,
} from "../../../slices/hostelSlice";

const MessMenu = ({ hostelId }) => {
  const dispatch = useDispatch();
  const { menus, loading, errors } = useSelector((state) => state.hostel);
  const { user, roles } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [showAllMenus, setShowAllMenus] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: "",
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  const isAdmin = roles.includes("admin");
  const isHostelPresident = roles.includes("hostel_president");

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get today's menu
  const today = useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    return days[dayIndex];
  }, []);

  // Filter menus based on showAllMenus flag
  const hostelMenus = useMemo(() => {
    const allMenus = menus[hostelId] || [];
    if (!showAllMenus) {
      return allMenus.filter((menu) => menu.day === today);
    }
    return allMenus;
  }, [menus, hostelId, showAllMenus, today]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.day) {
      console.error("Day is required");
      return;
    }
    try {
      await dispatch(
        createMenu({
          hostel_id: hostelId,
          ...formData,
        })
      ).unwrap();
      setFormData({
        day: "",
        breakfast: "",
        lunch: "",
        snacks: "",
        dinner: "",
      });
      setIsEditing(false);
      setEditingDay(null);
    } catch (error) {
      console.error("Error saving menu:", error);
    }
  };

  const handleEdit = (day) => {
    setEditingDay(day);
    const menu = (menus[hostelId] || []).find((m) => m.day === day);
    if (menu) {
      setFormData({
        day: menu.day,
        breakfast: menu.breakfast || "",
        lunch: menu.lunch || "",
        snacks: menu.snacks || "",
        dinner: menu.dinner || "",
      });
    }
    setIsEditing(true);
  };

  const handleUpdateMeal = async (day, meal, newValue) => {
    try {
      await dispatch(
        updateMenuMeal({
          hostelId,
          day,
          meal,
          data: { newMeal: newValue },
        })
      ).unwrap();
    } catch (error) {
      console.error("Error updating meal:", error);
    }
  };

  const handleDeleteMeal = async (day, meal) => {
    try {
      await dispatch(
        deleteMenuMeal({
          hostelId,
          day,
          meal,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      day: "",
      breakfast: "",
      lunch: "",
      snacks: "",
      dinner: "",
    });
    setIsEditing(false);
    setEditingDay(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const inputClasses =
    "w-full px-3 py-2 bg-ink border border-ink-line rounded-sm text-paper focus:outline-none focus:border-beacon transition-colors text-sm md:text-base";
  const labelClasses =
    "block font-mono text-xs uppercase tracking-widest text-dim mb-1.5";
  const pillButtonClasses =
    "flex items-center space-x-2 px-4 py-2 rounded-full border border-ink-line text-dim hover:border-beacon hover:text-beacon transition-colors font-mono text-xs uppercase tracking-widest";

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-ink-2 rounded-sm w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-ink-2 rounded-sm"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ink-2 rounded-sm p-4 sm:p-6 border border-ink-line"
    >
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <HiOutlineCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-beacon" />
          <h2 className="font-display text-lg sm:text-xl font-semibold text-paper">
            {showAllMenus ? "Weekly Mess Menu" : "Today's Menu"}
          </h2>
        </div>

        {/* Mobile dropdown menu */}
        <div className="sm:hidden w-full">
          <button
            onClick={toggleMobileMenu}
            className="flex items-center justify-between w-full px-4 py-2 border border-ink-line text-dim hover:border-beacon hover:text-beacon rounded-full transition-colors font-mono text-xs uppercase tracking-widest"
          >
            <span>Actions</span>
            {mobileMenuOpen ? (
              <HiChevronUp className="w-5 h-5" />
            ) : (
              <HiChevronDown className="w-5 h-5" />
            )}
          </button>

          {mobileMenuOpen && (
            <div className="mt-2 flex flex-col space-y-2">
              <button
                onClick={() => setShowAllMenus(!showAllMenus)}
                className={pillButtonClasses}
              >
                <HiViewList className="w-5 h-5" />
                <span>
                  {showAllMenus ? "Show Today's Menu" : "View All Menus"}
                </span>
              </button>

              {(isAdmin || isHostelPresident) && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={pillButtonClasses}
                >
                  <HiPlus className="w-5 h-5" />
                  <span>Add Menu</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={() => setShowAllMenus(!showAllMenus)}
            className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-ink-line text-dim hover:border-beacon hover:text-beacon transition-colors font-mono text-xs uppercase tracking-widest"
          >
            <HiViewList className="w-4 h-4" />
            <span className="whitespace-nowrap">
              {showAllMenus ? "Today's Menu" : "View All"}
            </span>
          </button>

          {(isAdmin || isHostelPresident) && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-beacon text-ink font-semibold hover:bg-beacon-soft transition-colors text-xs uppercase tracking-widest font-mono"
            >
              <HiPlus className="w-4 h-4" />
              <span>Add Menu</span>
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {(isAdmin || isHostelPresident) && (isEditing || editingDay) && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Day</label>
              <select
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
                className={inputClasses}
                required
              >
                <option value="">Select Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Form fields for meals */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Breakfast</label>
                <input
                  type="text"
                  value={formData.breakfast}
                  onChange={(e) =>
                    setFormData({ ...formData, breakfast: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Lunch</label>
                <input
                  type="text"
                  value={formData.lunch}
                  onChange={(e) =>
                    setFormData({ ...formData, lunch: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Snacks</label>
                <input
                  type="text"
                  value={formData.snacks}
                  onChange={(e) =>
                    setFormData({ ...formData, snacks: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Dinner</label>
                <input
                  type="text"
                  value={formData.dinner}
                  onChange={(e) =>
                    setFormData({ ...formData, dinner: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-1.5 text-dim hover:text-paper transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 md:px-6 md:py-2 bg-beacon text-ink font-semibold rounded-full hover:bg-beacon-soft transition-colors text-sm md:text-base"
            >
              {editingDay ? "Update Menu" : "Add Menu"}
            </button>
          </div>
        </form>
      )}

      {/* Error message */}
      {errors?.menu && (
        <div className="mb-4 p-3 md:p-4 bg-red-500/10 border border-red-500/40 rounded-sm text-red-400 text-sm md:text-base">
          {errors.menu}
        </div>
      )}

      {/* Menu display */}
      <div className="space-y-4 md:space-y-6">
        {!showAllMenus && hostelMenus.length === 0 && (
          <div className="text-center py-6 md:py-8">
            <p className="text-dim text-sm md:text-base">
              No menu available for today ({today})
            </p>
          </div>
        )}
        {showAllMenus && hostelMenus.length === 0 && (
          <div className="text-center py-6 md:py-8">
            <p className="text-dim text-sm md:text-base">
              No menus available for this week
            </p>
          </div>
        )}

        {hostelMenus.map((menu) => (
          <div
            key={menu.day}
            className="bg-ink rounded-sm p-3 md:p-4 border border-ink-line"
          >
            {/* Day header */}
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="font-display text-base md:text-lg font-medium text-paper">
                {menu.day}{" "}
                {!showAllMenus && (
                  <span className="font-mono text-xs uppercase tracking-widest text-beacon">
                    (Today)
                  </span>
                )}
              </h3>
              {(isAdmin || isHostelPresident) && (
                <button
                  onClick={() => handleEdit(menu.day)}
                  className="text-dim hover:text-beacon p-1 rounded-full transition-colors"
                >
                  <HiPencil className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>

            {/* Meals grid - adaptive for small screens */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              {menu.breakfast && (
                <div className="bg-ink-3 rounded-sm p-2 md:p-3">
                  <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-dim mb-1">
                    Breakfast
                  </h4>
                  <p className="text-sm md:text-base text-paper">
                    {menu.breakfast}
                  </p>
                </div>
              )}
              {menu.lunch && (
                <div className="bg-ink-3 rounded-sm p-2 md:p-3">
                  <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-dim mb-1">
                    Lunch
                  </h4>
                  <p className="text-sm md:text-base text-paper">
                    {menu.lunch}
                  </p>
                </div>
              )}
              {menu.snacks && (
                <div className="bg-ink-3 rounded-sm p-2 md:p-3">
                  <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-dim mb-1">
                    Snacks
                  </h4>
                  <p className="text-sm md:text-base text-paper">
                    {menu.snacks}
                  </p>
                </div>
              )}
              {menu.dinner && (
                <div className="bg-ink-3 rounded-sm p-2 md:p-3">
                  <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-dim mb-1">
                    Dinner
                  </h4>
                  <p className="text-sm md:text-base text-paper">
                    {menu.dinner}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MessMenu;
