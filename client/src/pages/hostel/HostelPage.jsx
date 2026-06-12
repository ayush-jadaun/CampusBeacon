import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getHostelById,
  getMenuByHostel,
  getOfficialsByHostel,
  getComplaintsByHostel,
  getHostelNotifications,
} from "../../slices/hostelSlice";
import MessMenu from "../../components/hostel/MessMenu/MessMenu";
import Notifications from "../../components/hostel/Notifications/Notifications";
import Complaints from "../../components/hostel/Complaints/Complaints";
import Officials from "../../components/hostel/Officials/Officials";

const HostelPage = () => {
  const { hostelId } = useParams(); // Get the current hostel ID from the URL
  const dispatch = useDispatch();

  // Get relevant data and global loading state from Redux
  // Note: `reduxLoading` will be true if ANY hostel thunk is pending.
  const { currentHostel, loading: reduxLoading } = useSelector(
    (state) => state.hostel
  );

  // Local state for page-specific loading and error handling
  const [isFetchingPageData, setIsFetchingPageData] = useState(false);
  const [pageError, setPageError] = useState(null);

  // Define the data fetching function using useCallback
  // It now accepts the ID to fetch as an argument
  const fetchHostelData = useCallback(
    async (id) => {
      if (!id) {
        console.warn("fetchHostelData called with invalid ID:", id);
        setPageError("Invalid Hostel ID."); // Set an error if ID is missing
        return;
      }

      console.log(`Attempting to fetch data for hostel ID: ${id}`);
      setIsFetchingPageData(true); // Start page-specific loading indicator
      setPageError(null); // Clear previous errors for this page

      try {
        // Dispatch all data fetching thunks concurrently for the given ID
        await Promise.all([
          dispatch(getHostelById(id)).unwrap(),
          dispatch(getMenuByHostel(id)).unwrap(),
          dispatch(getOfficialsByHostel(id)).unwrap(),
          dispatch(getComplaintsByHostel(id)).unwrap(),
          dispatch(getHostelNotifications(id)).unwrap(),
        ]);
        console.log(`Successfully fetched all data for hostel ID: ${id}`);
      } catch (error) {
        // Catch errors from any of the promises
        const errorMessage =
          error?.message || `Failed to fetch data for hostel ${id}`;
        setPageError(errorMessage); // Set page-specific error message
        console.error(`Error fetching hostel data for ID ${id}:`, error);
      } finally {
        setIsFetchingPageData(false); // Stop page-specific loading indicator
      }
    },
    [dispatch] // dispatch is stable, useCallback dependency is fine
  );

  // Effect to trigger data fetching whenever the hostelId from the URL changes
  useEffect(() => {
    if (hostelId) {
      // Only fetch if the ID is present
      fetchHostelData(hostelId);
    } else {
      // If hostelId is not present in the URL, set an error
      setPageError("No Hostel ID specified in the URL.");
    }
    // This effect should re-run ONLY when hostelId changes.
    // fetchHostelData is memoized by useCallback and dispatch is stable.
  }, [hostelId, fetchHostelData]);

  // --- Loading State Rendering ---
  // Show loading UI if the page-specific fetch is in progress
  if (isFetchingPageData) {
    return (
      <div className="min-h-screen bg-ink py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Re-use the existing pulse animation for loading */}
          <div className="animate-pulse">
            <div className="h-10 bg-ink-2 rounded-sm w-1/3 mb-10"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-ink-2 rounded-sm"
                  ></div>
                ))}
              </div>
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-ink-2 rounded-sm"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State Rendering ---
  // Show error UI if a page-specific error occurred during fetch
  if (pageError) {
    return (
      <div className="min-h-screen bg-ink py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="bg-ink-2 border border-red-500/50 rounded-sm p-6 text-paper">
            <h2 className="font-display text-xl font-semibold mb-2">
              Error Loading Hostel Data
            </h2>
            <p className="text-dim">{pageError}</p>
            <button
              // Retry button calls fetchHostelData with the current hostelId
              onClick={() => fetchHostelData(hostelId)}
              disabled={isFetchingPageData} // Disable while fetching
              className={`mt-4 px-5 py-2 bg-beacon text-ink font-semibold rounded-full hover:bg-beacon-soft transition-colors ${
                isFetchingPageData ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isFetchingPageData ? "Retrying..." : "Retry"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Data Not Ready State ---
  // Optional: Add a check if the data fetch finished but the specific hostel data isn't in Redux yet,
  // or doesn't match the current hostelId. This prevents rendering with stale data.
  // Ensure currentHostel.id is compared correctly (e.g., string vs number)
  const parsedHostelId = parseInt(hostelId, 10); // Convert URL param string to number
  if (!currentHostel || currentHostel.id !== parsedHostelId) {
    // This state might be hit briefly after fetch completes but before Redux updates,
    // or if the getHostelById thunk failed silently or returned unexpected data.
    // You could show a minimal loading message or potentially the error UI again.
    // For simplicity, we can show a basic message or rely on child components handling missing data.
    // If the page loaded without error BUT the currentHostel doesn't match, it implies
    // something went wrong with the fetch or state update for getHostelById.
    // Consider showing the error UI again in this edge case.
    // return (
    //    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-black to-purple-900 py-8 text-white text-center">
    //      Hostel data not available or mismatch detected. Please try again.
    //    </div>
    // );
    // Or, let the components below handle potentially missing data from Redux,
    // assuming the fetch succeeded overall (no pageError was set).
  }

  // --- Success State Rendering ---
  // If no loading and no error, render the main content
  return (
    <div className="min-h-screen bg-ink text-paper py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-xs text-beacon tracking-[0.25em] uppercase">
              ( Hostel )
            </span>
            <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-paper">
            {/* Safely access hostel name, provide fallback */}
            {currentHostel?.hostel_name || `Hostel ${hostelId}`}
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Pass the current hostelId to child components */}
          {/* These components will select their specific data from Redux using this ID */}
          <div className="lg:col-span-2 space-y-8">
            <MessMenu hostelId={hostelId} />
            <Notifications hostelId={hostelId} />
            <Complaints hostelId={hostelId} />
          </div>
          {/* Right side: Pass the current hostelId */}
          <div className="space-y-8">
            <Officials hostelId={hostelId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelPage;
