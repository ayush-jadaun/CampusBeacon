import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Fragment,
  useRef,
} from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useSelector, useDispatch, shallowEqual } from "react-redux"; // Import shallowEqual
import { useNavigate } from "react-router-dom";
import { fetchClubs } from "../../slices/clubSlice";

// --- Constants ---
const DEFAULT_IMAGE_URL = "https://via.placeholder.com/800x600?text=Club+Image";
const AUTOPLAY_INTERVAL = 5000; // ms

// --- Child Components (Memoized) ---
// ClubContent Component (displays text info)
const ClubContent = React.memo(({ club }) => {
  const defaultIcon = useMemo(
    () => club.name?.charAt(0).toUpperCase() || "?",
    [club.name]
  );

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-4 pb-16 sm:p-8 sm:pb-20 lg:p-12 lg:pb-24 pointer-events-none">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-xs sm:max-w-md lg:max-w-3xl"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4 lg:mb-6">
          <div className="font-display text-2xl sm:text-3xl lg:text-4xl bg-beacon text-ink rounded-sm w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center font-semibold flex-shrink-0">
            {defaultIcon}
          </div>
          <h3 className="font-display text-2xl sm:text-3xl lg:text-5xl font-semibold text-paper">
            {club.name || "Unnamed Club"}
          </h3>
        </div>
        {club.description && (
          <p className="text-sm sm:text-base lg:text-lg text-paper/75 mb-4 sm:mb-6 leading-relaxed line-clamp-3">
            {club.description}
          </p>
        )}
      </motion.div>
    </div>
  );
});
ClubContent.displayName = "ClubContent";

// NavButton Component (for arrows)
const NavButton = React.memo(({ direction, onClick, children }) => (
  <button
    onClick={onClick}
    className={`absolute ${
      direction === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4"
    } top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm opacity-50 group-hover:opacity-100 md:opacity-0 transition-opacity duration-300 hover:bg-black/50 focus:opacity-100`}
    aria-label={direction === "left" ? "Previous Club" : "Next Club"}
  >
    {children}
  </button>
));
NavButton.displayName = "NavButton";

// --- Main Image Slider Component ---
const ImageSlider = () => {
  // --- Hooks ---
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const progressBarControls = useAnimationControls();
  const isInitialMount = useRef(true);

  // --- Redux State ---

  const {
    clubs = [], 
    loading,
    error,
  } = useSelector((state) => state.clubs, shallowEqual); // Use shallowEqual

  // --- Component State ---
  const [currentClubIndex, setCurrentClubIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [clubImageIndices, setClubImageIndices] = useState({});
  const clubsCount = clubs.length; // Derive count *after* getting clubs

  // --- Effect: Fetch Club Data ---
  useEffect(() => {
    if (clubsCount === 0 && !loading) {
      dispatch(fetchClubs());
    }
  }, [dispatch, clubsCount, loading]);

  // --- Effect: Rotate Image Index for Current Club ---
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (clubsCount > 0) {
      const activeClub = clubs[currentClubIndex];
      if (activeClub?.images && activeClub.images.length > 1) {
        const clubId = activeClub.id;
        const currentImageIndex = clubImageIndices[clubId] ?? -1;
        const nextImageIndex =
          (currentImageIndex + 1) % activeClub.images.length;
        setClubImageIndices((prev) => ({ ...prev, [clubId]: nextImageIndex }));
      }
    }
  }, [currentClubIndex, clubs, clubsCount]); 

  const currentClubData = useMemo(
    () => clubs?.[currentClubIndex],
    [clubs, currentClubIndex]
  );
  const currentImageDisplayIndex = useMemo(
    () => clubImageIndices[currentClubData?.id] ?? 0,
    [currentClubData, clubImageIndices]
  );
  const currentImageUrl = useMemo(() => {
    if (!currentClubData?.images?.length) return DEFAULT_IMAGE_URL;
    return (
      currentClubData.images[currentImageDisplayIndex] ||
      currentClubData.images[0] ||
      DEFAULT_IMAGE_URL
    );
  }, [currentClubData, currentImageDisplayIndex]);

  // --- Navigation Logic (Callbacks) ---
  const navigateSlide = useCallback(
    (direction) => {
      if (clubsCount <= 1) return;
      setIsAutoPlaying(false);
      setCurrentClubIndex((prev) => {
        const newIndex =
          (direction === "next" ? prev + 1 : prev - 1 + clubsCount) %
          clubsCount;
        return newIndex;
      });
    },
    [clubsCount]
  );

  const handlePrevious = useCallback(
    () => navigateSlide("prev"),
    [navigateSlide]
  );
  const handleNext = useCallback(() => navigateSlide("next"), [navigateSlide]);

  const handleDotClick = useCallback(
    (index) => {
      if (clubsCount <= 1 || index === currentClubIndex) return;
      setIsAutoPlaying(false);
      setCurrentClubIndex(index);
    },
    [clubsCount, currentClubIndex]
  );

  // Click handler for the slide itself (Now uses properly defined currentClubData)
  const handleSlideClick = useCallback(() => {
    if (currentClubData?.id) {
      setIsAutoPlaying(false);
      navigate(`/clubs/${currentClubData.id}`);
    }
  }, [currentClubData, navigate]); // Dependency is correct

  // --- Effect: Autoplay Timer ---
  useEffect(() => {
    if (!isAutoPlaying || clubsCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentClubIndex((prev) => (prev + 1) % clubsCount);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, clubsCount]);

  // --- Effect: Control Progress Bar Animation ---
  useEffect(() => {
    if (isAutoPlaying && clubsCount > 1) {
      progressBarControls.set({ width: "0%" });
      progressBarControls.start({
        width: "100%",
        transition: { duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" },
      });
    } else {
      progressBarControls.stop();
      progressBarControls.set({ width: "0%" });
    }
  }, [isAutoPlaying, currentClubIndex, clubsCount, progressBarControls]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="relative w-full h-[60vh] max-h-[450px] sm:h-[70vh] sm:max-h-[550px] lg:h-[600px] lg:max-h-none overflow-hidden rounded-sm bg-ink-2 border border-ink-line flex items-center justify-center text-dim">
        <Loader2 className="animate-spin mr-2 text-beacon" size={24} />
        Loading clubs…
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[60vh] max-h-[450px] sm:h-[70vh] sm:max-h-[550px] lg:h-[600px] lg:max-h-none overflow-hidden rounded-sm bg-ink-2 border border-red-900 flex flex-col items-center justify-center text-red-400 p-4 text-center">
        <AlertTriangle className="mb-2" size={32} />
        <p className="font-semibold mb-1">Failed to load clubs</p>
        <p className="text-sm">
          {typeof error === "string" ? error : "Please try again later."}
        </p>
      </div>
    );
  }

  if (!loading && clubsCount === 0) {
    return (
      <div className="relative w-full h-[60vh] max-h-[450px] sm:h-[70vh] sm:max-h-[550px] lg:h-[600px] lg:max-h-none overflow-hidden rounded-sm bg-ink-2 border border-ink-line flex items-center justify-center text-dim">
        No clubs found to display.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60vh] max-h-[450px] sm:h-[70vh] sm:max-h-[550px] lg:h-[600px] lg:max-h-none overflow-hidden rounded-sm bg-ink-2 border border-ink-line group">
      {/* Navigation Arrows */}
      {clubsCount > 1 && (
        <Fragment>
          <NavButton direction="left" onClick={handlePrevious}>
            <ChevronLeft size={20} sm:size={24} />
          </NavButton>
          <NavButton direction="right" onClick={handleNext}>
            <ChevronRight size={20} sm:size={24} />
          </NavButton>
        </Fragment>
      )}

      {/* Slide Content Area */}
      <AnimatePresence mode="wait">
        {currentClubData && (
          <motion.div
            key={currentClubData.id || currentClubIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer"
            style={{ willChange: "opacity" }}
            onClick={handleSlideClick} // Attach click handler
          >
            {/* Image Container */}
            <AnimatePresence initial={false}>
              <motion.img
                key={currentImageUrl}
                src={currentImageUrl}
                alt={currentClubData.name || "Club Image"}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  scale: { duration: 8, ease: "easeOut" },
                  opacity: { duration: 0.6, ease: "easeInOut" },
                }}
                loading="lazy"
                style={{ willChange: "transform, opacity" }}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE_URL;
                }}
              />
            </AnimatePresence>

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent opacity-90 pointer-events-none" />

            {/* Text Content */}
            <ClubContent club={currentClubData} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autoplay Progress Bar Container */}
      {clubsCount > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-ink-3/70 overflow-hidden z-10">
          <AnimatePresence>
            {isAutoPlaying && (
              <motion.div
                className="h-full bg-beacon"
                animate={progressBarControls}
                initial={{ opacity: 0 }}
                exit={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.3 } }}
                style={{ width: "0%" }}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Dots */}
      {clubsCount > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 flex items-center gap-2 sm:gap-3 z-10">
          {clubs.map((club, index) => (
            <button
              key={club.id || index}
              onClick={() => handleDotClick(index)}
              className="group relative p-1"
              aria-label={`Go to slide ${index + 1}: ${
                club.name || "Unnamed Club"
              }`}
            >
              <div
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                  index === currentClubIndex
                    ? `bg-beacon scale-125 ring-2 ring-beacon/40`
                    : "bg-paper/40 hover:bg-paper/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ImageSlider);
