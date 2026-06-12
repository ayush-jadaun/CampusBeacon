import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  X,
  ChevronDown,
  AlertTriangle,
  ClipboardList,
  SlidersHorizontal,
} from "lucide-react";
import debounce from "lodash/debounce";
import {
  fetchEvents,
  clearEventError,
  fetchRegistrationCounts,
  fetchMyRegistrations,
} from "../../slices/eventSlice";
import RegisterButton, {
  RegistrationCount,
} from "../../components/events/RegisterButton";
import isPastEvent from "../../components/events/isPastEvent";

const EASE = [0.22, 1, 0.36, 1];

const formatEventDate = (dateString) => {
  if (!dateString) return { date: "Date TBD", time: "" };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { date: "Date TBD", time: "" };
  return {
    date: d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

/* ---------------- Event card ---------------- */

const EventCard = ({ event, index, isRegistered }) => {
  const navigate = useNavigate();
  const clubName = event.Club?.name || event.club?.name || "Campus";
  const { date, time } = formatEventDate(event.date);
  const past = isPastEvent(event);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16, transition: { duration: 0.25 } }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05, ease: EASE }}
      onClick={() => navigate(`/events/${event.id}`)}
      className="group flex flex-col bg-ink-2 border border-ink-line rounded-sm overflow-hidden cursor-pointer transition-colors duration-300 hover:border-beacon/50"
    >
      <div className="relative h-44 overflow-hidden border-b border-ink-line">
        {event.images && event.images[0] ? (
          <img
            src={event.images[0]}
            alt={event.name || "Event"}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-ink-3 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-dim" aria-hidden="true" />
          </div>
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-ink/85 border border-ink-line font-mono text-[10px] uppercase tracking-widest text-paper">
            {clubName}
          </span>
          {event.category && (
            <span className="px-3 py-1 rounded-full bg-ink/85 border border-ink-line font-mono text-[10px] uppercase tracking-widest text-beacon">
              {event.category}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          {past ? (
            <span className="px-3 py-1 rounded-full bg-ink/85 border border-ink-line font-mono text-[10px] uppercase tracking-widest text-dim">
              Past
            </span>
          ) : (
            isRegistered && (
              <span className="px-3 py-1 rounded-full bg-beacon font-mono text-[10px] uppercase tracking-widest text-ink">
                Registered
              </span>
            )
          )}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink/85 border border-ink-line">
          <Calendar className="w-3 h-3 text-beacon" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-paper">
            {date}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-xl font-medium text-paper line-clamp-1 group-hover:text-beacon transition-colors duration-300">
          {event.name || "Untitled Event"}
        </h3>
        <p className="mt-2 text-sm text-dim line-clamp-2 leading-snug">
          {event.description || "No description available."}
        </p>
        <div className="mt-4 mb-5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {time && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-dim">
              <Clock className="w-3 h-3 text-beacon" aria-hidden="true" />
              {time}
            </span>
          )}
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-dim truncate max-w-[180px]">
            <MapPin className="w-3 h-3 text-beacon shrink-0" aria-hidden="true" />
            {event.location || "TBA"}
          </span>
        </div>
        <div className="mt-auto pt-4 border-t border-ink-line flex items-center justify-between gap-3">
          <RegistrationCount event={event} />
          {past ? (
            <span className="font-mono text-[11px] uppercase tracking-widest text-dim">
              Event ended
            </span>
          ) : (
            <RegisterButton event={event} compact />
          )}
        </div>
      </div>
    </motion.article>
  );
};

/* ---------------- States ---------------- */

const EmptyState = React.memo(({ query }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center border border-ink-line rounded-sm bg-ink-2 p-12 sm:p-16 my-10"
  >
    <ClipboardList className="w-10 h-10 text-dim mb-6" aria-hidden="true" />
    <h3 className="font-display text-2xl font-medium text-paper mb-3">
      No events found
    </h3>
    {query ? (
      <p className="text-dim max-w-md">
        Nothing matches &quot;<span className="text-beacon">{query}</span>
        &quot;. Try a different search or clear the filters.
      </p>
    ) : (
      <p className="text-dim max-w-md">
        There are no events matching your criteria right now. Check back later
        or explore the clubs.
      </p>
    )}
  </motion.div>
));
EmptyState.displayName = "EmptyState";

const LoadingState = React.memo(() => (
  <div className="flex flex-col items-center justify-center p-12 sm:p-16 my-10">
    <div className="relative mb-8 w-12 h-12">
      <div className="absolute inset-0 rounded-full border border-ink-line" />
      <div className="absolute inset-0 rounded-full border-t-2 border-beacon animate-spin" />
    </div>
    <p className="font-mono text-xs uppercase tracking-widest text-dim">
      Loading events…
    </p>
  </div>
));
LoadingState.displayName = "LoadingState";

const ErrorState = React.memo(({ error, retry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center border border-ink-line rounded-sm bg-ink-2 p-12 sm:p-16 my-10"
  >
    <AlertTriangle className="w-10 h-10 text-beacon mb-6" aria-hidden="true" />
    <h3 className="font-display text-2xl font-medium text-paper mb-3">
      Something went wrong
    </h3>
    <p className="text-dim max-w-md mb-8">
      {typeof error === "string"
        ? error
        : "Could not load events. Please try again later."}
    </p>
    <button
      onClick={retry}
      className="px-6 py-2.5 rounded-full bg-beacon text-ink font-mono text-xs uppercase tracking-widest hover:bg-beacon-soft transition-colors duration-300"
    >
      Try again
    </button>
  </motion.div>
));
ErrorState.displayName = "ErrorState";

/* ---------------- Filter pill ---------------- */

const FilterPill = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-widest border transition-colors duration-300 ${
      active
        ? "bg-beacon text-ink border-beacon"
        : "border-ink-line text-dim hover:text-paper hover:border-dim"
    }`}
  >
    {children}
  </button>
);

/* ---------------- Page ---------------- */

const EventsPageAll = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events = [], loading, error, myRegistrations } = useSelector(
    (state) => state.events
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    club: searchParams.get("club") || "",
    category: searchParams.get("category") || "",
    upcoming: searchParams.get("upcoming") === "true",
    past: searchParams.get("past") === "true",
    mine: searchParams.get("mine") === "true",
  }));

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchRegistrationCounts());
    return () => {
      dispatch(clearEventError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, isAuthenticated]);

  const debouncedSetSearchQuery = useMemo(
    () => debounce((value) => setSearchQuery(value), 300),
    []
  );

  const handleSearchInputChange = useCallback(
    (e) => {
      debouncedSetSearchQuery(e.target.value);
    },
    [debouncedSetSearchQuery]
  );

  const filteredEvents = useMemo(() => {
    let filtered = [...(events || [])];

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(
        (event) =>
          event.name?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.Club?.name?.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query)
      );
    }

    if (appliedFilters.club) {
      filtered = filtered.filter(
        (event) => event.Club?.name === appliedFilters.club
      );
    }

    if (appliedFilters.category) {
      filtered = filtered.filter(
        (event) => event.category === appliedFilters.category
      );
    }

    if (appliedFilters.mine) {
      filtered = filtered.filter((event) =>
        myRegistrations.includes(event.id)
      );
    }

    const now = new Date();
    if (appliedFilters.upcoming && !appliedFilters.past) {
      filtered = filtered.filter((event) => {
        if (!event.date) return true;
        const eventDate = new Date(event.date);
        return !isNaN(eventDate.getTime()) && eventDate >= now;
      });
    } else if (appliedFilters.past && !appliedFilters.upcoming) {
      filtered = filtered.filter((event) => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return !isNaN(eventDate.getTime()) && eventDate < now;
      });
    }

    filtered.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });

    return filtered;
  }, [events, searchQuery, appliedFilters, myRegistrations]);

  const uniqueClubs = useMemo(
    () => [...new Set(events.map((event) => event.Club?.name).filter(Boolean))],
    [events]
  );

  const uniqueCategories = useMemo(
    () => [...new Set(events.map((event) => event.category).filter(Boolean))],
    [events]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (appliedFilters.club) params.set("club", appliedFilters.club);
    if (appliedFilters.category)
      params.set("category", appliedFilters.category);
    if (appliedFilters.upcoming) params.set("upcoming", "true");
    if (appliedFilters.past) params.set("past", "true");
    if (appliedFilters.mine) params.set("mine", "true");
    setSearchParams(params, { replace: true });
  }, [searchQuery, appliedFilters, setSearchParams]);

  const handleFilterChange = useCallback((filterType, value) => {
    setAppliedFilters((prev) => ({ ...prev, [filterType]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    const searchInput = document.getElementById("events-search-input");
    if (searchInput) searchInput.value = "";
    setAppliedFilters({
      club: "",
      category: "",
      upcoming: false,
      past: false,
      mine: false,
    });
    setIsFilterOpen(false);
  }, []);

  const handleRetry = useCallback(() => {
    dispatch(clearEventError());
    dispatch(fetchEvents());
    dispatch(fetchRegistrationCounts());
  }, [dispatch]);

  const activeFilterCount = useMemo(() => {
    const searchFilterCount = searchQuery ? 1 : 0;
    const otherFiltersCount = Object.values(appliedFilters).filter((value) =>
      typeof value === "boolean" ? value : Boolean(value)
    ).length;
    return searchFilterCount + otherFiltersCount;
  }, [searchQuery, appliedFilters]);

  return (
    <div className="relative min-h-screen bg-ink text-paper overflow-x-hidden">
      <div className="grain z-[60]" aria-hidden="true" />

      {/* ============ Header ============ */}
      <header className="relative pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden">
        {/* Faint vertical hairlines, like a noticeboard grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent calc(25% - 1px), #1c232e calc(25% - 1px), #1c232e 25%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-12">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-[11px] sm:text-xs tracking-[0.3em] text-beacon uppercase mb-6"
          >
            MNNIT Allahabad · Campus events
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="font-display font-semibold leading-[0.95] text-[clamp(2.6rem,7vw,5.5rem)] max-w-4xl"
          >
            What&#39;s <span className="italic text-beacon">on.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-xl text-base sm:text-lg text-dim leading-relaxed"
          >
            Fests, talks, auditions and everything in between — hosted by the
            clubs that keep campus awake.
          </motion.p>

          {/* Search + filter toggle */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 max-w-xl relative"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="events-search-input"
              type="text"
              placeholder="Search events, clubs or keywords…"
              defaultValue={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full pl-11 pr-24 py-3.5 rounded-full bg-ink-2 border border-ink-line text-paper placeholder:text-dim focus:outline-none focus:border-beacon transition-colors duration-300"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="p-2 rounded-full text-dim hover:text-paper transition-colors duration-300"
                  aria-label="Clear search and filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest border transition-colors duration-300 ${
                  isFilterOpen || appliedFilters.club || appliedFilters.category
                    ? "border-beacon text-beacon"
                    : "border-ink-line text-dim hover:text-paper"
                }`}
                aria-expanded={isFilterOpen}
                aria-controls="filter-dropdown"
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
          </motion.div>

          {/* Quick filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-5 flex flex-wrap items-center gap-2"
          >
            <FilterPill
              active={
                !appliedFilters.upcoming &&
                !appliedFilters.past &&
                !appliedFilters.mine
              }
              onClick={() =>
                setAppliedFilters((prev) => ({
                  ...prev,
                  upcoming: false,
                  past: false,
                  mine: false,
                }))
              }
            >
              All
            </FilterPill>
            <FilterPill
              active={appliedFilters.upcoming}
              onClick={() =>
                handleFilterChange("upcoming", !appliedFilters.upcoming)
              }
            >
              Upcoming
            </FilterPill>
            <FilterPill
              active={appliedFilters.past}
              onClick={() => handleFilterChange("past", !appliedFilters.past)}
            >
              Past
            </FilterPill>
            {isAuthenticated && (
              <FilterPill
                active={appliedFilters.mine}
                onClick={() => handleFilterChange("mine", !appliedFilters.mine)}
              >
                My events
              </FilterPill>
            )}
          </motion.div>
        </div>
      </header>

      {/* ============ Advanced filters ============ */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            id="filter-dropdown"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 overflow-hidden"
          >
            <div className="bg-ink-2 border border-ink-line rounded-sm p-5 sm:p-6 mb-10">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-beacon">
                  Filter events
                </h3>
                {(appliedFilters.club || appliedFilters.category) && (
                  <button
                    onClick={() =>
                      setAppliedFilters((prev) => ({
                        ...prev,
                        club: "",
                        category: "",
                      }))
                    }
                    className="link-sweep font-mono text-[11px] uppercase tracking-widest text-dim hover:text-paper transition-colors duration-300"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="club-filter"
                    className="block font-mono text-[11px] uppercase tracking-widest text-dim mb-2"
                  >
                    Club
                  </label>
                  <div className="relative">
                    <select
                      id="club-filter"
                      value={appliedFilters.club}
                      onChange={(e) =>
                        handleFilterChange("club", e.target.value)
                      }
                      className="w-full bg-ink border border-ink-line rounded-sm py-2.5 pl-4 pr-10 text-paper appearance-none focus:outline-none focus:border-beacon transition-colors duration-300"
                    >
                      <option value="">All clubs</option>
                      {uniqueClubs.map((club) => (
                        <option key={club} value={club}>
                          {club}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="category-filter"
                    className="block font-mono text-[11px] uppercase tracking-widest text-dim mb-2"
                  >
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category-filter"
                      value={appliedFilters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="w-full bg-ink border border-ink-line rounded-sm py-2.5 pl-4 pr-10 text-paper appearance-none focus:outline-none focus:border-beacon transition-colors duration-300"
                    >
                      <option value="">All categories</option>
                      {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ Results ============ */}
      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-24">
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-beacon">
              ( {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} )
            </span>
            <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
          </div>
        )}

        {loading && <LoadingState />}
        {!loading && error && <ErrorState error={error} retry={handleRetry} />}
        {!loading && !error && filteredEvents.length === 0 && (
          <EmptyState query={searchQuery} />
        )}
        {!loading && !error && filteredEvents.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          >
            <AnimatePresence mode="sync">
              {filteredEvents.map((event, index) => (
                <EventCard
                  key={event.id || index}
                  event={event}
                  index={index}
                  isRegistered={myRegistrations.includes(event.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ============ Clubs CTA ============ */}
        <div className="mt-20 border-t border-ink-line pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-paper">
              Explore more opportunities
            </h2>
            <p className="mt-2 text-dim max-w-xl">
              Stay connected with campus life — explore the clubs behind these
              events.
            </p>
          </div>
          <button
            onClick={() => navigate("/clubs")}
            className="group inline-flex items-center gap-2 bg-beacon text-ink font-semibold px-7 py-3.5 rounded-full hover:bg-beacon-soft transition-colors duration-300 shrink-0"
          >
            Explore clubs
          </button>
        </div>
      </main>
    </div>
  );
};

export default EventsPageAll;
