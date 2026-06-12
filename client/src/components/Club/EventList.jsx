import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiPlus,
  FiLoader,
  FiClock,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiTag,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  fetchEvents,
  deleteEvent,
  clearEventError,
  fetchRegistrationCounts,
  fetchMyRegistrations,
} from "../../slices/eventSlice";
import RegisterButton, {
  RegistrationCount,
} from "../events/RegisterButton";

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    console.error("Invalid date format:", dateString);
    return "Invalid Date";
  }
};

// Get time until event
const getTimeUntil = (dateString) => {
  if (!dateString) return null;

  try {
    const eventDate = new Date(dateString);
    const now = new Date();

    if (eventDate < now) return { text: "Past event", isPast: true };

    const diffTime = Math.abs(eventDate - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Today!", isToday: true };
    if (diffDays === 1) return { text: "Tomorrow", isSoon: true };
    if (diffDays <= 7) return { text: `${diffDays} days away`, isSoon: true };

    return { text: `${diffDays} days away` };
  } catch {
    return null;
  }
};

const filterPillClass = (active) =>
  `px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-widest border transition-colors duration-300 ${
    active
      ? "bg-beacon text-ink border-beacon"
      : "border-ink-line text-dim hover:text-paper hover:border-dim"
  }`;

const EventList = ({ isAdmin, openModal, clubId, handleEventClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { events, loading, error, myRegistrations } = useSelector(
    (state) => state.events
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, upcoming, past, mine
  const [showFilters, setShowFilters] = useState(false);

  // Fetch events when component mounts or clubId changes
  useEffect(() => {
    if (clubId) {
      dispatch(fetchEvents(clubId));
    }
    dispatch(fetchRegistrationCounts());

    return () => {
      if (error) {
        dispatch(clearEventError());
      }
    };
  }, [dispatch, clubId, error]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, isAuthenticated]);

  // Filter events based on search and filters
  useEffect(() => {
    if (!events) return;

    let result = [...events];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.name.toLowerCase().includes(term) ||
          (event.description &&
            event.description.toLowerCase().includes(term)) ||
          (event.location && event.location.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    const now = new Date();
    switch (filterType) {
      case "upcoming":
        result = result.filter((event) => new Date(event.date) >= now);
        break;
      case "past":
        result = result.filter((event) => new Date(event.date) < now);
        break;
      case "mine":
        result = result.filter((event) => myRegistrations.includes(event.id));
        break;
      default:
        // "all" - no filtering needed
        break;
    }

    // Sort by date (upcoming first)
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    setFilteredEvents(result);
  }, [events, searchTerm, filterType, myRegistrations]);

  const handleDeleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteEvent(id))
        .unwrap()
        .catch((err) => {
          console.error("Failed to delete event:", err);
        });
    }
  };

  const onEventClick =
    handleEventClick ||
    ((eventId) => {
      navigate(`/events/${eventId}`);
    });

  // Get upcoming event count
  const upcomingCount =
    events?.filter((event) => new Date(event.date) >= new Date()).length || 0;

  return (
    <section className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-beacon mb-2">
            ( Events )
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-paper">
            Club events
          </h2>
          {!loading && !error && (
            <div className="flex gap-4 mt-3 font-mono text-[11px] uppercase tracking-widest text-dim">
              <span>{events.length} total</span>
              <span className="text-beacon">{upcomingCount} upcoming</span>
            </div>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => openModal("event", "create", { club_id: clubId })}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-beacon text-ink font-mono text-xs uppercase tracking-widest hover:bg-beacon-soft transition-colors duration-300 disabled:opacity-60"
            disabled={loading}
          >
            <FiPlus /> Add event
          </button>
        )}
      </div>

      {/* Search and Filters */}
      {!loading && !error && events.length > 0 && (
        <div className="bg-ink-2 border border-ink-line rounded-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative flex-grow w-full md:w-auto">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
              <input
                type="text"
                placeholder="Search events…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-ink border border-ink-line rounded-full w-full pl-10 pr-4 py-2 text-sm text-paper placeholder:text-dim focus:outline-none focus:border-beacon transition-colors duration-300"
              />
            </div>

            <div className="flex gap-2 items-center w-full md:w-auto flex-wrap">
              {/* Filter Pills */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterType("all")}
                  className={filterPillClass(filterType === "all")}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("upcoming")}
                  className={filterPillClass(filterType === "upcoming")}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilterType("past")}
                  className={filterPillClass(filterType === "past")}
                >
                  Past
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setFilterType("mine")}
                    className={filterPillClass(filterType === "mine")}
                  >
                    My events
                  </button>
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center font-mono text-xs text-dim hover:text-beacon transition-colors duration-300"
              >
                <FiFilter className="mr-1" />
                <FiChevronDown
                  className={`ml-1 transition-transform duration-300 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Advanced Filters - Expandable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-ink-line">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-dim">
                    More filtering options coming soon
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="animate-spin text-beacon text-3xl" />
            <span className="font-mono text-xs uppercase tracking-widest text-dim">
              Loading events…
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-10 bg-ink-2 border border-ink-line rounded-sm p-6">
          <p className="text-dim">Error loading events:</p>
          <p className="text-paper font-medium mt-1">{error}</p>
          <button
            onClick={() => {
              if (clubId) dispatch(fetchEvents(clubId));
            }}
            className="mt-5 px-6 py-2.5 rounded-full bg-beacon text-ink font-mono text-xs uppercase tracking-widest hover:bg-beacon-soft transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success State - Display Events */}
      {!loading && !error && (
        <>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredEvents.map((event, index) => {
                const timeUntil = getTimeUntil(event.date);
                const isRegistered = myRegistrations.includes(event.id);

                return (
                  <motion.div
                    key={event.id}
                    className="group relative flex flex-col bg-ink-2 border border-ink-line rounded-sm overflow-hidden cursor-pointer transition-colors duration-300 hover:border-beacon/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => onEventClick(event.id)}
                    layout
                  >
                    {/* Status Badge */}
                    {timeUntil && (
                      <div
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest z-10 border ${
                          timeUntil.isToday
                            ? "bg-beacon text-ink border-beacon"
                            : timeUntil.isPast
                            ? "bg-ink/85 text-dim border-ink-line"
                            : "bg-ink/85 text-paper border-ink-line"
                        }`}
                      >
                        {timeUntil.text}
                      </div>
                    )}

                    {/* Registered marker */}
                    {isRegistered && !timeUntil?.isPast && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-beacon font-mono text-[10px] uppercase tracking-widest text-ink z-10">
                        Registered
                      </div>
                    )}

                    {/* Admin Buttons */}
                    {isAdmin && (
                      <div className="absolute bottom-3 right-3 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal("event", "edit", event);
                          }}
                          className="p-2 bg-ink border border-ink-line hover:border-beacon hover:text-beacon rounded-full text-dim transition-colors duration-300"
                          aria-label="Edit Event"
                        >
                          <FiEdit size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="p-2 bg-ink border border-ink-line hover:border-beacon hover:text-beacon rounded-full text-dim transition-colors duration-300"
                          aria-label="Delete Event"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    )}

                    {/* Event Image */}
                    <div className="h-44 w-full bg-ink-3 overflow-hidden relative border-b border-ink-line">
                      <img
                        src={
                          Array.isArray(event.images) &&
                          event.images.length > 0
                            ? event.images[0]
                            : `https://source.unsplash.com/400x240/?event,${encodeURIComponent(
                                event.name
                              )}`
                        }
                        alt={`Image for ${event.name}`}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://picsum.photos/400/240?random=${event.id}`;
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Event Info */}
                    <div className="p-5 flex-grow flex flex-col">
                      <div>
                        <h3 className="font-display text-lg font-medium text-paper mb-1.5 truncate group-hover:text-beacon transition-colors duration-300">
                          {event.name}
                        </h3>
                        <p className="text-sm text-dim mb-4 line-clamp-2 min-h-[2.5rem]">
                          {event.description || "No description available."}
                        </p>
                      </div>

                      {/* Event Meta Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center font-mono text-[11px] uppercase tracking-widest text-dim">
                          <FiCalendar
                            size={12}
                            className="mr-2 text-beacon flex-shrink-0"
                          />
                          <span>{formatDate(event.date)}</span>
                        </div>

                        {event.time && (
                          <div className="flex items-center font-mono text-[11px] uppercase tracking-widest text-dim">
                            <FiClock
                              size={12}
                              className="mr-2 text-beacon flex-shrink-0"
                            />
                            <span>{event.time}</span>
                          </div>
                        )}

                        <div className="flex items-center font-mono text-[11px] uppercase tracking-widest text-dim">
                          <FiMapPin
                            size={12}
                            className="mr-2 text-beacon flex-shrink-0"
                          />
                          <span className="truncate">
                            {event.location || "Location TBA"}
                          </span>
                        </div>
                      </div>

                      {/* Tags/Categories */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {event.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 border border-ink-line text-dim font-mono text-[10px] uppercase tracking-widest rounded-full flex items-center"
                            >
                              <FiTag size={8} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Registration */}
                      <div className="mt-auto pt-4 border-t border-ink-line flex items-center justify-between gap-3">
                        <RegistrationCount event={event} />
                        {timeUntil?.isPast ? (
                          <span className="font-mono text-[11px] uppercase tracking-widest text-dim">
                            Event ended
                          </span>
                        ) : (
                          <RegisterButton event={event} compact />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center bg-ink-2 border border-ink-line rounded-sm p-10 flex flex-col items-center"
            >
              {searchTerm || filterType !== "all" ? (
                <>
                  <FiFilter className="text-dim text-3xl mb-4" />
                  <p className="text-dim">
                    No events match your current filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                    className="mt-4 link-sweep font-mono text-xs uppercase tracking-widest text-beacon"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                <>
                  <FiCalendar className="text-dim text-3xl mb-4" />
                  <p className="text-dim italic">
                    No events listed for this club yet.
                    {isAdmin && " Add one using the button above!"}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </>
      )}
    </section>
  );
};

export default EventList;
