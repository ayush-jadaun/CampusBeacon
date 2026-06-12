import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Atom,
  Palette,
  Mic,
  Gamepad2,
  HeartHandshake,
  GraduationCap,
  Bike,
  Coffee,
  Music,
  Film,
  BookOpen,
  Camera,
  PenTool,
  Globe,
  Rocket,
  Puzzle,
  Target,
  Dumbbell,
  Heart,
  Zap,
  Laptop,
  Layers,
} from "lucide-react";
import { fetchClubs } from "../../slices/clubSlice";
import { fetchEvents } from "../../slices/eventSlice";

const SCROLL_AMOUNT = 300;

const formatEventDateTime = (isoDate) => {
  if (!isoDate) return { date: "Date TBD", time: "Time TBD" };
  try {
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { date: formattedDate, time: formattedTime };
  } catch (error) {
    console.error("Error formatting date:", isoDate, error);
    return { date: "Invalid Date", time: "Invalid Time" };
  }
};

const ICONS = [
  Atom,
  Palette,
  Mic,
  Gamepad2,
  HeartHandshake,
  GraduationCap,
  Bike,
  Coffee,
  Music,
  Film,
  BookOpen,
  Camera,
  PenTool,
  Globe,
  Rocket,
  Puzzle,
  Target,
  Dumbbell,
  Heart,
  Zap,
  Laptop,
  Layers,
  Calendar,
  MapPin,
  Clock,
];

const styleCache = new Map();

const hashCode = (str) => {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getEventStyle = (eventId, clubName = "", category = "") => {
  const cacheKey = `${eventId}-${clubName}-${category}`;
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }

  const lowerClubName = clubName?.toLowerCase() || "";
  const lowerCategory = category?.toLowerCase() || "";
  let result;

  if (
    lowerClubName.includes("coding") ||
    lowerCategory === "tech" ||
    lowerClubName.includes("computer")
  ) {
    result = { Icon: Laptop };
  } else if (lowerClubName.includes("robotic")) {
    result = { Icon: Atom };
  } else if (lowerClubName.includes("sports") || lowerCategory === "sports") {
    result = { Icon: Dumbbell };
  } else if (lowerClubName.includes("art") || lowerCategory === "art") {
    result = { Icon: Palette };
  } else if (lowerClubName.includes("music") || lowerCategory === "music") {
    result = { Icon: Music };
  } else {
    const idHash = hashCode(eventId?.toString() || Math.random().toString());
    const iconIndex = idHash % ICONS.length;
    result = { Icon: ICONS[iconIndex] };
  }

  styleCache.set(cacheKey, result);
  return result;
};

const EventCard = React.memo(({ event, clubName, onNavigate }) => {
  const { id, name = "Untitled Event", description = "No description available.", location = "Location TBD", date: eventDate, category } = event || {};
  const { Icon } = useMemo(() => getEventStyle(id, clubName, category), [id, clubName, category]);
  const { date, time } = useMemo(() => formatEventDateTime(eventDate), [eventDate]);
  const handleCardClick = useCallback(() => {
    if (id && onNavigate) {
      onNavigate(`/events/${id}`);
    }
  }, [onNavigate, id]);

  if (!event) return null;

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative h-[420px] flex-shrink-0 flex flex-col w-full sm:w-80 md:w-[350px] bg-ink-2 border border-ink-line rounded-sm cursor-pointer transition-all duration-300 hover:border-beacon/60 hover:-translate-y-1"
      role="button"
      aria-label={`View details for event: ${name}`}
      tabIndex={0}
      onKeyDown={handleKeyPress}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-5">
          <div className="p-3 border border-ink-line rounded-sm text-beacon transition-colors duration-300 group-hover:bg-beacon group-hover:text-ink">
            <Icon className="w-6 h-6" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim border border-ink-line rounded-sm px-2 py-1">
            {clubName || "General"}
          </span>
        </div>
        <h3 className="font-display text-2xl font-semibold text-paper mb-4 line-clamp-2 leading-snug transition-colors duration-200 group-hover:text-beacon">
          {name}
        </h3>
        <div className="space-y-2 mb-4 font-mono text-xs text-dim">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-2.5 flex-shrink-0 text-beacon/70" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-2.5 flex-shrink-0 text-beacon/70" />
            <span>{time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-2.5 flex-shrink-0 text-beacon/70" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
        <p className="text-dim text-sm leading-relaxed line-clamp-3 flex-grow">
          {description}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-ink-line">
          {category ? (
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-beacon">
              {category}
            </span>
          ) : (
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
              Event
            </span>
          )}
          <ArrowRight className="w-4 h-4 text-dim transition-all duration-300 group-hover:text-beacon group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = "EventCard";

const EventsSection = () => {
  const [activeClub, setActiveClub] = useState("ALL");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const {
    clubs: fetchedClubData = [],
    loading: clubsLoading,
    error: clubsError,
  } = useSelector((state) => state.clubs || {});

  const {
    events: fetchedEventsData = [],
    loading: eventsLoading,
    error: eventsError,
  } = useSelector((state) => state.events || {});

  const clubNamesForFilter = useMemo(() => {
    if (!fetchedClubData?.length) return ["ALL"];
    const names = fetchedClubData.map((club) => club.name).filter(Boolean);
    const uniqueNames = [...new Set(names)];
    return ["ALL", ...uniqueNames.sort((a, b) => a.localeCompare(b))];
  }, [fetchedClubData]);

  const filteredEventsByClub = useMemo(() => {
    if (isTransitioning || !fetchedEventsData || fetchedEventsData.length === 0)
      return [];
    const sortedEvents = [...fetchedEventsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeClub === "ALL") {
      return sortedEvents;
    }
    const selectedClub = fetchedClubData?.find((club) => club.name === activeClub);
    if (!selectedClub) return [];
    return sortedEvents.filter((event) => event.club_id === selectedClub.id);
  }, [fetchedEventsData, activeClub, fetchedClubData, isTransitioning]);

  useEffect(() => {
    if (!fetchedClubData || fetchedClubData.length === 0) {
      dispatch(fetchClubs());
    }
    if (!fetchedEventsData || fetchedEventsData.length === 0) {
      dispatch(fetchEvents());
    }
  }, [dispatch, fetchedClubData, fetchedEventsData]);

  useEffect(() => {
    if (fetchedEventsData && fetchedEventsData.length > 0) {
      let clubIdToFetch = null;
      if (activeClub !== "ALL") {
        const selectedClub = fetchedClubData?.find((club) => club.name === activeClub);
        clubIdToFetch = selectedClub?.id;
      }
      dispatch(fetchEvents(clubIdToFetch));
    }
  }, [dispatch, activeClub, fetchedClubData]);

  useEffect(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    if (!eventsLoading && isTransitioning) {
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [eventsLoading, isTransitioning]);

  const handleFilterClick = useCallback(
    (clubName) => {
      if (activeClub !== clubName) {
        setIsTransitioning(true);
        setActiveClub(clubName);
      }
    },
    [activeClub]
  );

  const scrollLeft = useCallback(() => {
    scrollContainerRef.current?.scrollBy({
      left: -SCROLL_AMOUNT,
      behavior: "smooth",
    });
  }, []);

  const scrollRight = useCallback(() => {
    scrollContainerRef.current?.scrollBy({
      left: SCROLL_AMOUNT,
      behavior: "smooth",
    });
  }, []);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  const renderStatus = () => {
    if (eventsLoading && !isTransitioning && filteredEventsByClub.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-dim py-20 space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-beacon" />
          <span>Loading events…</span>
        </div>
      );
    }
    if (eventsError && !eventsLoading && !isTransitioning) {
      const errorMessage =
        typeof eventsError === "string"
          ? eventsError
          : eventsError?.message || "An unknown error occurred";
      return (
        <div className="flex flex-col items-center justify-center text-red-400 py-20 space-y-3 text-center px-4">
          <AlertTriangle className="w-12 h-12" />
          <span className="font-semibold">Failed to load events</span>
          <span className="text-sm text-red-400/80 max-w-md">
            Error: {errorMessage}. Please try again later.
          </span>
        </div>
      );
    }
    if (!eventsLoading && !eventsError && !isTransitioning && filteredEventsByClub.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-dim text-center px-4">
          <Calendar className="w-16 h-16 mb-4 text-ink-3" />
          <p className="font-display text-2xl font-medium mb-2 text-paper">
            Nothing on the board
          </p>
          <p className="text-dim max-w-md">
            {activeClub === "ALL"
              ? "There are no upcoming events scheduled right now."
              : `It looks like the "${activeClub}" club doesn't have any scheduled events.`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="relative overflow-hidden text-paper">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 md:mb-12 py-3">
          <div className="flex flex-wrap gap-2 sm:gap-3 min-h-[44px] items-center">
            {clubsLoading && (
              <div className="flex items-center justify-center text-dim text-sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-beacon" />
                <span>Loading filters…</span>
              </div>
            )}
            {clubsError && !clubsLoading && (
              <div className="flex items-center justify-center text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span>Error loading filters</span>
              </div>
            )}
            {!clubsLoading &&
              !clubsError &&
              fetchedClubData &&
              clubNamesForFilter.length > 1 &&
              clubNamesForFilter.map((clubName) => (
                <button
                  key={clubName}
                  onClick={() => handleFilterClick(clubName)}
                  disabled={isTransitioning}
                  className={`px-4 py-1.5 rounded-full font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap border disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      activeClub === clubName
                        ? "bg-beacon text-ink border-beacon font-semibold"
                        : "bg-transparent text-dim border-ink-line hover:text-paper hover:border-dim"
                    }`}
                  aria-pressed={activeClub === clubName}
                >
                  {clubName}
                </button>
              ))}
          </div>
        </div>
        <div className="relative min-h-[450px]">
          {isTransitioning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/70 backdrop-blur-sm z-20 rounded-sm">
              <Loader2 className="w-10 h-10 animate-spin text-beacon" />
              <span className="mt-3 text-dim">Loading events…</span>
            </div>
          )}
          {!isTransitioning && renderStatus()}
          {!isTransitioning &&
            !eventsLoading &&
            !eventsError &&
            filteredEventsByClub.length > 0 && (
              <div className="relative group/carousel">
                <button
                  onClick={scrollLeft}
                  disabled={isTransitioning}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-ink-2 border border-ink-line hover:border-beacon hover:text-beacon p-2.5 rounded-full text-paper transition-all duration-300 shadow-lg -ml-3 sm:-ml-4 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 disabled:opacity-0"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar px-1"
                >
                  {filteredEventsByClub.map((event) => {
                    const club = fetchedClubData?.find((c) => c.id === event.club_id);
                    const clubName = club?.name;
                    return (
                      <div key={event.id} className="snap-center flex-shrink-0">
                        <EventCard event={event} clubName={clubName} onNavigate={handleNavigate} />
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={scrollRight}
                  disabled={isTransitioning}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-ink-2 border border-ink-line hover:border-beacon hover:text-beacon p-2.5 rounded-full text-paper transition-all duration-300 shadow-lg -mr-3 sm:-mr-4 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 disabled:opacity-0"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
