import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  ChevronDown,
  X,
  ArrowLeft,
  ArrowRight,
  Sliders,
} from "lucide-react";

const RideFilters = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  clearAllFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Quick filter options
  const quickFilters = [
    {
      label: "Today",
      value: "today",
      type: "dateRange",
    },
    {
      label: "Tomorrow",
      value: "tomorrow",
      type: "dateRange",
    },
    {
      label: "This Week",
      value: "week",
      type: "dateRange",
    },
    {
      label: "2+ Seats",
      value: 2,
      type: "minSeats",
    },
    {
      label: "Under ₹100",
      value: 100,
      type: "maxPrice",
    },
    {
      label: "To College",
      value: "toCollege",
      type: "direction",
    },
    {
      label: "From College",
      value: "fromCollege",
      type: "direction",
    },
  ];

  // Date range options
  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "This Week", value: "week" },
    { label: "Next Week", value: "nextWeek" },
    { label: "Custom", value: "custom" },
  ];

  // Calculate active filters count
  const getActiveFilterCount = () => {
    return (
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (
          key !== "sortBy" &&
          value !== null &&
          value !== "all" &&
          value !== ""
        ) {
          return acc + 1;
        }
        return acc;
      }, 0) + (searchTerm ? 1 : 0)
    );
  };

  const activeFilterCount = getActiveFilterCount();

  const inputClasses =
    "w-full bg-ink border border-ink-line rounded-sm px-4 py-2 text-sm text-paper placeholder:text-dim focus:border-beacon focus:outline-none transition-colors";
  const labelClasses =
    "font-mono text-[11px] uppercase tracking-widest text-dim flex items-center gap-2";

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            placeholder="Search pickup or drop location..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${inputClasses} pl-10`}
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim w-4 h-4" />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dim w-4 h-4 cursor-pointer hover:text-paper transition-colors"
              onClick={() => onSearchChange("")}
            />
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-full border px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
            activeFilterCount > 0
              ? "bg-beacon border-beacon text-ink font-semibold"
              : "border-ink-line text-dim hover:border-beacon hover:text-beacon"
          }`}
        >
          {activeFilterCount > 0 ? (
            <div className="flex items-center">
              <Sliders className="w-4 h-4 mr-2" />
              <span className="bg-ink text-beacon rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            </div>
          ) : (
            <Filter className="w-4 h-4" />
          )}
          <span>Filter Rides</span>
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Expandable Filters Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4 bg-ink-2 rounded-sm border border-ink-line">
              {/* Sort and Quick Filters Row */}
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange("sortBy", e.target.value)}
                  className="bg-ink border border-ink-line rounded-sm px-4 py-2 text-sm text-paper focus:border-beacon focus:outline-none transition-colors"
                >
                  <option value="dateAsc">Earliest First</option>
                  <option value="dateDesc">Latest First</option>
                  <option value="priceAsc">Lowest Price</option>
                  <option value="priceDesc">Highest Price</option>
                  <option value="seatsDesc">Most Seats</option>
                </select>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                  {quickFilters.map((filter) => (
                    <motion.button
                      key={`${filter.type}-${filter.value}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-mono text-xs tracking-wide transition-colors
                        ${
                          filters[filter.type] === filter.value
                            ? "bg-beacon border-beacon text-ink font-semibold"
                            : "border-ink-line text-dim hover:border-beacon hover:text-beacon"
                        }`}
                      onClick={() => {
                        // Toggle off if already selected
                        if (filters[filter.type] === filter.value) {
                          onFilterChange(filter.type, null);
                        } else {
                          onFilterChange(filter.type, filter.value);
                        }
                      }}
                    >
                      {filter.label}
                      {filters[filter.type] === filter.value && (
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFilterChange(filter.type, null);
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="border-t border-ink-line pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-dim hover:text-beacon transition-colors"
                >
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      showAdvancedFilters ? "rotate-180" : ""
                    }`}
                  />
                  Advanced Filters
                </motion.button>
              </div>

              {/* Advanced Filters Panel */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      {/* Enhanced Date Range Filter */}
                      <div className="space-y-2">
                        <label className={labelClasses}>
                          <Calendar className="w-4 h-4" /> Date Range
                        </label>
                        <select
                          value={filters.dateRange || ""}
                          onChange={(e) => {
                            const value = e.target.value || null;
                            onFilterChange("dateRange", value);
                            if (value !== "custom") {
                              onFilterChange("startDate", null);
                              onFilterChange("endDate", null);
                            }
                          }}
                          className={`${inputClasses} mb-2`}
                        >
                          <option value="">Any Date</option>
                          {dateOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {filters.dateRange === "custom" && (
                          <div className="space-y-2">
                            <div className="flex flex-col space-y-2">
                              <label className={labelClasses}>
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={filters.startDate || ""}
                                onChange={(e) =>
                                  onFilterChange("startDate", e.target.value)
                                }
                                min={new Date().toISOString().split("T")[0]}
                                className={`${inputClasses} font-mono`}
                              />
                            </div>
                            <div className="flex flex-col space-y-2">
                              <label className={labelClasses}>
                                End Date
                              </label>
                              <input
                                type="date"
                                value={filters.endDate || ""}
                                onChange={(e) =>
                                  onFilterChange("endDate", e.target.value)
                                }
                                min={
                                  filters.startDate ||
                                  new Date().toISOString().split("T")[0]
                                }
                                className={`${inputClasses} font-mono`}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price Range Filter */}
                      <div className="space-y-2">
                        <label className={labelClasses}>
                          <CreditCard className="w-4 h-4" /> Max Price (₹)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          value={filters.maxPrice || 1000}
                          onChange={(e) =>
                            onFilterChange(
                              "maxPrice",
                              Number(e.target.value) || null
                            )
                          }
                          className="w-full accent-beacon"
                        />
                        <div className="flex justify-between font-mono text-xs text-dim">
                          <span>₹0</span>
                          <span className="text-beacon">
                            ₹{filters.maxPrice || 1000}
                          </span>
                          <span>₹1000</span>
                        </div>
                      </div>

                      {/* Seats Filter */}
                      <div className="space-y-2">
                        <label className={labelClasses}>
                          <Users className="w-4 h-4" /> Minimum Seats
                        </label>
                        <select
                          value={filters.minSeats || ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : Number(e.target.value);
                            onFilterChange("minSeats", value);
                          }}
                          className={inputClasses}
                        >
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                        </select>
                      </div>

                      {/* Direction Filter */}
                      <div className="space-y-2">
                        <label className={labelClasses}>Direction</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              onFilterChange("direction", "toCollege")
                            }
                            className={`flex-1 py-2 px-3 rounded-sm border text-sm flex items-center justify-center gap-2 transition-colors ${
                              filters.direction === "toCollege"
                                ? "bg-beacon border-beacon text-ink font-semibold"
                                : "bg-ink border-ink-line text-dim hover:border-beacon hover:text-beacon"
                            }`}
                          >
                            <ArrowRight className="w-4 h-4" /> To College
                          </button>
                          <button
                            onClick={() =>
                              onFilterChange("direction", "fromCollege")
                            }
                            className={`flex-1 py-2 px-3 rounded-sm border text-sm flex items-center justify-center gap-2 transition-colors ${
                              filters.direction === "fromCollege"
                                ? "bg-beacon border-beacon text-ink font-semibold"
                                : "bg-ink border-ink-line text-dim hover:border-beacon hover:text-beacon"
                            }`}
                          >
                            <ArrowLeft className="w-4 h-4" /> From College
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Filters Summary and Clear Button */}
              {activeFilterCount > 0 && (
                <div className="flex justify-between items-center text-sm text-dim pt-4 border-t border-ink-line">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest border border-ink-line rounded-full px-2.5 py-1">
                      {activeFilterCount}{" "}
                      {activeFilterCount === 1 ? "filter" : "filters"} active
                    </span>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="link-sweep text-beacon font-mono text-xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RideFilters;
