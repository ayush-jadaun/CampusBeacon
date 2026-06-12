import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import RideHeader from "../../components/rides/RideHeader";
import RideFilters from "../../components/rides/RideFilters";
import RideGrid from "../../components/rides/RideGrid";
import EmptyState from "../../components/rides/EmptyState";
import RideFormModal from "../../components/rides/RideFormModal";
import DeleteConfirmationModal from "../../components/rides/DeleteConfirmationModal";
import {
  getAllRides,
  getUserRides,
  createRide,
  updateRide,
  deleteRide,
  setSearchTerm,
  setFilters,
} from "../../slices/ridesSlice";

const RideShare = () => {
  const dispatch = useDispatch();
  const {
    rides,
    loading,
    error,
    filteredRides,
    activeFilterCount,
    searchTerm,
    filters,
  } = useSelector((state) => state.rides);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        await dispatch(getAllRides());
        await dispatch(getUserRides());
      } catch (err) {
        console.error("Error fetching rides:", err);
      }
    };
    fetchRides();
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    dispatch(setSearchTerm(e.target.value));
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingRide) {
        await dispatch(
          updateRide({
            id: editingRide.id,
            formData: { ...formData, creatorId: currentUser.id },
          })
        );
        setEditingRide(null);
      } else {
        await dispatch(createRide({ ...formData, creatorId: currentUser.id }));
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error submitting ride:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteRide(id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting ride:", err);
    }
  };

  const clearAllFilters = () => {
    setSearchInput("");
    dispatch(setSearchTerm(""));
    dispatch(
      setFilters({
        timeFrame: null,
        dateRange: null,
        minSeats: null,
        maxPrice: null,
        direction: null,
        startDate: null,
        endDate: null,
      })
    );
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-paper flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Car className="w-8 h-8 text-beacon" />
          </motion.div>
          <span className="font-mono text-xs uppercase tracking-widest text-dim">
            Loading rides...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="bg-ink-2 p-6 rounded-sm border border-red-500/40 max-w-lg mx-auto">
          <div className="flex items-center text-red-400 font-display text-xl mb-4">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Error Loading Rides
          </div>
          <p className="text-dim">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-beacon hover:bg-beacon-soft text-ink font-semibold py-2 px-5 rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-paper px-5 sm:px-8 lg:px-12 pt-24 pb-16">
      <div className="mx-auto max-w-7xl">
        <RideHeader
          onOfferRide={() => {
            setEditingRide(null);
            setIsFormOpen(true);
          }}
        />
        <RideFilters
          searchTerm={searchInput}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          clearAllFilters={clearAllFilters}
        />
        <div className="flex justify-between items-center mb-6 mt-6">
          <div className="font-mono text-xs uppercase tracking-widest text-dim">
            {filteredRides.length > 0 ? (
              <>
                Showing{" "}
                <span className="text-beacon">{filteredRides.length}</span>{" "}
                {filteredRides.length === 1 ? "ride" : "rides"}
              </>
            ) : (
              <span>No rides found</span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <div className="text-dim text-sm flex items-center">
              <span className="mr-3 font-mono text-[11px] uppercase tracking-widest border border-ink-line rounded-full px-2.5 py-1">
                {activeFilterCount}{" "}
                {activeFilterCount === 1 ? "filter" : "filters"} active
              </span>
              <button
                onClick={clearAllFilters}
                className="link-sweep text-beacon font-mono text-xs"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {filteredRides.length > 0 ? (
          <RideGrid
            rides={filteredRides}
            currentUser={currentUser}
            onEdit={(ride) => {
              const formattedRide = {
                ...ride,
                departureDateTime: new Date(ride.departureDateTime)
                  .toISOString()
                  .slice(0, 16),
              };
              setEditingRide(formattedRide);
              setIsFormOpen(true);
            }}
            onDelete={setConfirmDelete}
          />
        ) : (
          <EmptyState
            activeFilterCount={activeFilterCount}
            onOfferRide={() => {
              setEditingRide(null);
              setIsFormOpen(true);
            }}
            onClearFilters={clearAllFilters}
          />
        )}

        <AnimatePresence>
          {isFormOpen && (
            <RideFormModal
              key="ride-form-modal"
              isOpen={isFormOpen}
              editingRide={editingRide}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingRide(null);
              }}
            />
          )}
          {confirmDelete && (
            <DeleteConfirmationModal
              key="delete-confirm-modal"
              isOpen={Boolean(confirmDelete)}
              onDeleteConfirm={() => handleDelete(confirmDelete)}
              onCancel={() => setConfirmDelete(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RideShare;
