import React, { useState, useEffect, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  fetchEventById,
  fetchRegistrationCounts,
  fetchMyRegistrations,
} from "../../slices/eventSlice";
import supabase from "../../config/chatConfig/supabaseClient";
import {
  FiCalendar,
  FiMapPin,
  FiShare2,
  FiLoader,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  FiHeart,
  FiBookmark,
  FiMessageSquare,
} from "react-icons/fi";
import {
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import toast from "react-hot-toast";
import RegisterButton, {
  RegistrationCount,
} from "../../components/events/RegisterButton";
import isPastEvent from "../../components/events/isPastEvent";

const ImageGallery = React.lazy(() =>
  import("../../components/Club/ImageGallery")
);
const CoordinatorList = React.lazy(() =>
  import("../../components/Club/CoordinatorList")
);
const LazyChatApp = React.lazy(() => import("../chat/ChatApp"));

const getSocialIcon = (url) => {
  if (!url) return FaGlobe;
  if (url.includes("instagram")) return FaInstagram;
  if (url.includes("twitter")) return FaTwitter;
  if (url.includes("facebook")) return FaFacebookF;
  if (url.includes("linkedin")) return FaLinkedinIn;
  if (url.includes("youtube")) return FaYoutube;
  return FaGlobe;
};

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border border-ink-line" />
        <div className="absolute inset-0 rounded-full border-t-2 border-beacon animate-spin" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-dim">
        Loading event…
      </p>
    </motion.div>
  </div>
);

const CoordinatorLoadingFallback = () => (
  <div className="min-h-[160px] rounded-sm bg-ink-3 animate-pulse flex items-center justify-center">
    <FiLoader className="text-dim text-2xl animate-spin" />
  </div>
);

const ChatLoadingFallback = () => (
  <div className="flex items-center justify-center h-64 bg-ink rounded-sm border border-ink-line">
    <FiLoader className="animate-spin text-beacon mr-3" size={20} />
    <span className="font-mono text-xs uppercase tracking-widest text-dim">
      Loading event chat…
    </span>
  </div>
);

const VideoSlider = ({ videos = [], className = "" }) => {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const validVideos = (Array.isArray(videos) ? videos : [])
    .map((v) => (typeof v === "string" ? v.trim() : null))
    .filter(Boolean);

  const videoCount = validVideos.length;

  if (videoCount === 0) {
    return null;
  }

  const nextSlide = () => setCurrent((prev) => (prev + 1) % videoCount);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + videoCount) % videoCount);

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const transitionConfig = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.5 },
  };

  return (
    <motion.div
      className={`relative rounded-sm overflow-hidden border border-ink-line bg-ink-2 group ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence initial={false} custom={current} mode="wait">
        <motion.div
          className="relative w-full aspect-video"
          key={current}
          custom={current > (current - 1 + videoCount) % videoCount ? 1 : -1}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transitionConfig}
        >
          <video
            src={validVideos[current]}
            controls
            className="w-full h-full object-cover"
            playsInline
            key={validVideos[current]}
          />
        </motion.div>
      </AnimatePresence>

      {videoCount > 1 && (
        <>
          <motion.button
            onClick={prevSlide}
            className="absolute top-1/2 left-3 -translate-y-1/2 z-10 p-3 bg-ink/70 hover:bg-beacon hover:text-ink rounded-full text-paper opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: isHovering ? 0 : -10, opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Previous video"
          >
            <FiChevronLeft size={20} />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute top-1/2 right-3 -translate-y-1/2 z-10 p-3 bg-ink/70 hover:bg-beacon hover:text-ink rounded-full text-paper opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none"
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: isHovering ? 0 : 10, opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Next video"
          >
            <FiChevronRight size={20} />
          </motion.button>
        </>
      )}

      {videoCount > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: videoCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-beacon"
                    : "w-1.5 bg-paper/50 hover:bg-paper/80"
                }`}
                aria-label={`Go to video ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const HeroMetaPill = ({ icon: Icon, children }) => (
  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink/80 border border-ink-line font-mono text-[11px] uppercase tracking-widest text-paper">
    <Icon className="text-beacon" aria-hidden="true" />
    {children}
  </span>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="bg-ink-3 border border-ink-line p-2.5 rounded-sm shrink-0 mt-0.5">
      <Icon className="text-beacon text-base" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-widest text-dim mb-0.5">
        {label}
      </p>
      <p className="text-paper">{value}</p>
    </div>
  </div>
);

const EventPage = () => {
  const { id: eventIdParam } = useParams();
  const dispatch = useDispatch();
  const {
    currentEvent,
    loading: eventLoading,
    error: eventError,
    registrationCounts,
  } = useSelector((state) => state.events);
  const { user: authUser } = useSelector((state) => state.auth);
  const isAdmin = useSelector(
    (state) => state.auth?.user?.roles?.includes("admin") || false
  );

  const [isInterested, setIsInterested] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [eventChatIntegerId, setEventChatIntegerId] = useState(null);
  const [chatIdLoading, setChatIdLoading] = useState(true);
  const [chatIdError, setChatIdError] = useState(null);

  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const yPos = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  useEffect(() => {
    if (eventIdParam) {
      dispatch(fetchEventById(eventIdParam));
      setEventChatIntegerId(null);
      setChatIdLoading(true);
      setChatIdError(null);
      setShowChat(false);
    }
    window.scrollTo(0, 0);
  }, [dispatch, eventIdParam]);

  useEffect(() => {
    dispatch(fetchRegistrationCounts());
  }, [dispatch, eventIdParam]);

  useEffect(() => {
    if (authUser) {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, authUser]);

  useEffect(() => {
    if (
      currentEvent &&
      currentEvent.id === parseInt(eventIdParam) &&
      authUser &&
      !eventChatIntegerId &&
      chatIdLoading &&
      !chatIdError
    ) {
      const eventId = currentEvent.id;
      const getOrCreateEventChannel = async () => {
        setChatIdLoading(true);
        setChatIdError(null);
        try {
          let { data: existingChannel, error: findError } = await supabase
            .from("Channels")
            .select("id")
            .eq("event_id", eventId)
            .maybeSingle();

          if (findError) throw findError;

          if (existingChannel) {
            setEventChatIntegerId(existingChannel.id);
          } else {
            const potentialChannelName = `Event: ${currentEvent.name} (ID: ${eventId})`;
            const { data: newChannel, error: createError } = await supabase
              .from("Channels")
              .insert({ name: potentialChannelName, event_id: eventId })
              .select("id")
              .single();

            if (createError) {
              if (createError.code === "23505") {
                let { data: raceChannel, error: raceError } = await supabase
                  .from("Channels")
                  .select("id")
                  .eq("event_id", eventId)
                  .single();
                if (raceError) throw raceError;
                if (raceChannel) {
                  setEventChatIntegerId(raceChannel.id);
                } else {
                  throw new Error(
                    "Channel not found even after race condition handling."
                  );
                }
              } else {
                throw createError;
              }
            } else if (newChannel) {
              setEventChatIntegerId(newChannel.id);
            } else {
              throw new Error("Channel creation did not return an ID.");
            }
          }
        } catch (err) {
          console.error("Error getting/creating event channel:", err);
          setChatIdError(
            `Failed to initialize chat: ${err.message || "Unknown error"}`
          );
          toast.error("Could not initialize event chat.");
        } finally {
          setChatIdLoading(false);
        }
      };
      getOrCreateEventChannel();
    } else if (!authUser && chatIdLoading) {
      setChatIdLoading(false);
    }
  }, [
    currentEvent,
    eventIdParam,
    authUser,
    eventChatIntegerId,
    chatIdLoading,
    chatIdError,
  ]);

  if (
    eventLoading ||
    !currentEvent ||
    currentEvent.id !== parseInt(eventIdParam)
  ) {
    return <LoadingState />;
  }

  if (eventError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-10 bg-ink-2 border border-ink-line rounded-sm max-w-lg"
        >
          <FiAlertCircle className="text-5xl text-beacon mx-auto mb-5" />
          <h2 className="font-display text-2xl font-medium text-paper mb-3">
            Something went wrong
          </h2>
          <p className="text-dim mb-8">
            {typeof eventError === "string"
              ? eventError
              : "Could not load event details."}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                if (eventIdParam) dispatch(fetchEventById(eventIdParam));
              }}
              className="px-6 py-2.5 rounded-full bg-beacon text-ink font-mono text-xs uppercase tracking-widest hover:bg-beacon-soft transition-colors duration-300"
            >
              Try again
            </button>
            <Link
              to="/events"
              className="px-6 py-2.5 rounded-full border border-ink-line text-dim font-mono text-xs uppercase tracking-widest hover:text-paper hover:border-dim transition-colors duration-300"
            >
              Back to events
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (
    !eventLoading &&
    (!currentEvent || currentEvent.id !== parseInt(eventIdParam))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink p-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg p-10 bg-ink-2 border border-ink-line rounded-sm"
        >
          <FiAlertCircle className="text-5xl text-beacon mx-auto mb-5" />
          <h1 className="font-display text-3xl font-medium text-paper mb-4">
            Event not found
          </h1>
          <p className="text-dim mb-8">
            We couldn&#39;t find the event you&#39;re looking for (ID:{" "}
            {eventIdParam}). It might have been removed or the link is invalid.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-beacon text-ink font-semibold hover:bg-beacon-soft transition-colors duration-300"
          >
            <FiArrowLeft /> Explore other events
          </Link>
        </motion.div>
      </div>
    );
  }

  const {
    id: eventId,
    name = "Event Name Not Available",
    description = "No description provided.",
    date,
    location = "Location not specified",
    images = [],
    videos = [],
    social_media_links: socialLinks = [],
    coordinators = [],
    max_participants: maxParticipants,
    category = "Event",
  } = currentEvent;

  const past = isPastEvent(currentEvent);
  const registeredCount = registrationCounts[eventId] ?? 0;
  const spotsLeft =
    maxParticipants != null
      ? Math.max(maxParticipants - registeredCount, 0)
      : null;

  let formattedDate = "Date not specified";
  let formattedTime = "Time not specified";
  if (date) {
    try {
      const eventDateObj = new Date(date);
      if (!isNaN(eventDateObj.getTime())) {
        formattedDate = eventDateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        formattedTime = eventDateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: name,
      text: `Check out this event: ${name} on ${formattedDate} at ${formattedTime}!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Event shared successfully!");
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      toast.error("Could not share event.");
    }
  };

  const handleInterestToggle = () => {
    setIsInterested(!isInterested);
    toast.success(
      isInterested ? "Removed from interested" : "Added to interested events!"
    );
  };

  const handleBookmarkToggle = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Removed from bookmarks" : "Event bookmarked!");
  };

  const descriptionParagraphs = description
    ? description.split("\n").filter((p) => p.trim().length > 0)
    : [];

  const iconPillClass = (active) =>
    `p-2.5 rounded-full border transition-colors duration-300 ${
      active
        ? "bg-beacon text-ink border-beacon"
        : "border-ink-line text-dim hover:text-paper hover:border-dim"
    }`;

  return (
    <div className="relative min-h-screen bg-ink text-paper overflow-x-hidden">
      <div className="grain z-[60]" aria-hidden="true" />

      {/* ============ Hero ============ */}
      <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-ink-line">
        {images && images.length > 0 && (
          <div className="absolute inset-0 z-0">
            <img
              src={images[0]}
              alt={`${name} background`}
              className="w-full h-full object-cover object-center opacity-30"
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40"
              aria-hidden="true"
            />
          </div>
        )}

        <motion.div
          style={{ opacity: headerOpacity, y: yPos }}
          className="relative z-20 flex flex-col items-center justify-center text-center px-4 md:px-8 py-28"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <span className="px-4 py-1.5 rounded-full bg-ink/80 border border-ink-line font-mono text-[11px] uppercase tracking-[0.25em] text-beacon">
              {category}
            </span>
            {past && (
              <span className="px-4 py-1.5 rounded-full bg-ink/80 border border-ink-line font-mono text-[11px] uppercase tracking-[0.25em] text-dim">
                Past event
              </span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-display font-semibold text-paper leading-[1.02] text-[clamp(2.4rem,6vw,5rem)] max-w-4xl pb-2"
          >
            {name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-6 mb-8"
          >
            <HeroMetaPill icon={FiCalendar}>{formattedDate}</HeroMetaPill>
            <HeroMetaPill icon={FiClock}>{formattedTime}</HeroMetaPill>
            <HeroMetaPill icon={FiMapPin}>{location}</HeroMetaPill>
            <HeroMetaPill icon={FiUsers}>
              {maxParticipants
                ? `${registeredCount}/${maxParticipants} registered`
                : `${registeredCount} registered`}
            </HeroMetaPill>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center gap-3 mt-2"
          >
            <RegisterButton event={currentEvent} />
            <button
              onClick={handleInterestToggle}
              className={iconPillClass(isInterested)}
              disabled={!authUser}
              aria-label={
                isInterested ? "Remove interest" : "Mark as interested"
              }
              title={
                !authUser
                  ? "Log in to mark interest"
                  : isInterested
                  ? "Remove interest"
                  : "Mark as interested"
              }
            >
              <FiHeart className={isInterested ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleBookmarkToggle}
              className={iconPillClass(bookmarked)}
              disabled={!authUser}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark event"}
              title={
                !authUser
                  ? "Log in to bookmark"
                  : bookmarked
                  ? "Remove bookmark"
                  : "Bookmark event"
              }
            >
              <FiBookmark className={bookmarked ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleShare}
              className={iconPillClass(false)}
              aria-label="Share event"
              title="Share event"
            >
              <FiShare2 />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* ============ Body ============ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="bg-ink-2 border border-ink-line rounded-sm p-6 md:p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-beacon mb-4">
                ( 01 ) — About
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-paper mb-6">
                About the event
              </h2>
              {descriptionParagraphs.length > 0 ? (
                <div className="text-dim text-base md:text-lg leading-relaxed space-y-4">
                  {descriptionParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-dim italic">
                  No description available for this event.
                </p>
              )}
            </motion.section>

            <Suspense
              fallback={
                <div className="h-64 rounded-sm bg-ink-3 animate-pulse flex items-center justify-center">
                  <FiLoader className="text-dim text-2xl animate-spin" />
                </div>
              }
            >
              {Array.isArray(images) && images.filter(Boolean).length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-beacon mb-4">
                    ( 02 ) — Gallery
                  </p>
                  <ImageGallery images={images.filter(Boolean)} />
                </motion.section>
              )}

              {Array.isArray(videos) &&
                videos.filter((v) => typeof v === "string" && v.trim()).length >
                  0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.25em] text-beacon mb-4">
                      ( 03 ) — Videos
                    </p>
                    <VideoSlider
                      videos={videos.filter(
                        (v) => typeof v === "string" && v.trim()
                      )}
                    />
                  </motion.section>
                )}
            </Suspense>

            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-ink-2 border border-ink-line rounded-sm p-6 md:p-8"
            >
              <div className="flex justify-between items-center gap-4 mb-6">
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-paper">
                  Event discussion
                </h2>
                {authUser ? (
                  chatIdLoading ? (
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-ink-line text-dim font-mono text-xs uppercase tracking-widest cursor-wait"
                      disabled
                    >
                      <FiLoader className="animate-spin" size={14} />
                      Loading
                    </button>
                  ) : chatIdError ? (
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-ink-line text-dim font-mono text-xs uppercase tracking-widest"
                      title={chatIdError}
                    >
                      <FiAlertCircle size={14} />
                      Unavailable
                    </div>
                  ) : eventChatIntegerId ? (
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                        showChat
                          ? "border border-beacon text-beacon hover:text-beacon-soft hover:border-beacon-soft"
                          : "bg-beacon text-ink hover:bg-beacon-soft"
                      }`}
                      aria-expanded={showChat}
                      aria-controls="event-chat-container"
                    >
                      <FiMessageSquare size={14} />
                      {showChat ? "Hide chat" : "Show chat"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-ink-line text-dim font-mono text-xs uppercase tracking-widest">
                      <FiAlertCircle size={14} />
                      Chat init failed
                    </div>
                  )
                ) : null}
              </div>

              {!authUser && (
                <div className="text-center text-dim py-6 border-t border-ink-line mt-4">
                  Please{" "}
                  <Link
                    to="/login"
                    className="link-sweep text-beacon font-medium"
                  >
                    log in
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/signup"
                    className="link-sweep text-beacon font-medium"
                  >
                    sign up
                  </Link>{" "}
                  to join the discussion.
                </div>
              )}

              <AnimatePresence>
                {authUser && showChat && eventChatIntegerId && !chatIdError && (
                  <motion.div
                    id="event-chat-container"
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      marginTop: "1.5rem",
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      marginTop: 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Suspense fallback={<ChatLoadingFallback />}>
                      <div
                        style={{
                          minHeight: "400px",
                          maxHeight: "70vh",
                          height: "60vh",
                        }}
                      >
                        <LazyChatApp
                          key={eventChatIntegerId}
                          channelId={eventChatIntegerId}
                          channelName={`Event: ${name}`}
                          darkMode={true}
                          isAdmin={isAdmin}
                        />
                      </div>
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>

          {/* ============ Sidebar ============ */}
          <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-ink-2 border border-ink-line rounded-sm p-6"
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-beacon border-b border-ink-line pb-4 mb-5">
                Event details
              </p>
              <div className="space-y-4">
                <DetailRow icon={FiCalendar} label="Date" value={formattedDate} />
                <DetailRow icon={FiClock} label="Time" value={formattedTime} />
                <DetailRow icon={FiMapPin} label="Location" value={location} />
                <DetailRow
                  icon={FiUsers}
                  label="Capacity"
                  value={
                    maxParticipants
                      ? `${registeredCount}/${maxParticipants} registered${
                          !past ? ` · ${spotsLeft} spots left` : ""
                        }`
                      : `${registeredCount} registered · unlimited spots`
                  }
                />
                {Array.isArray(coordinators) && coordinators.length > 0 && (
                  <DetailRow
                    icon={FiUser}
                    label="Coordinators"
                    value={`${coordinators.length} contact${
                      coordinators.length !== 1 ? "s" : ""
                    } available`}
                  />
                )}
              </div>
              <div className="mt-6 pt-5 border-t border-ink-line space-y-3">
                {past ? (
                  <p className="text-center font-mono text-xs uppercase tracking-widest text-dim py-2">
                    This event has ended
                  </p>
                ) : (
                  <div className="flex flex-col items-stretch gap-2">
                    <RegisterButton
                      event={currentEvent}
                      className="w-full py-3"
                    />
                    <RegistrationCount
                      event={currentEvent}
                      className="text-center"
                    />
                  </div>
                )}
                <button
                  onClick={handleShare}
                  className="w-full py-3 rounded-full border border-ink-line text-dim font-mono text-xs uppercase tracking-widest hover:text-paper hover:border-dim transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <FiShare2 /> Share event
                </button>
              </div>
            </motion.div>

            {Array.isArray(socialLinks) &&
              socialLinks.filter(Boolean).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-ink-2 border border-ink-line rounded-sm p-6"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-beacon mb-5">
                    Connect with us
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.filter(Boolean).map((link, index) => {
                      const Icon = getSocialIcon(link);
                      return (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-ink border border-ink-line rounded-sm text-dim hover:text-beacon hover:border-beacon/50 transition-colors duration-300"
                          aria-label="Visit social media page"
                        >
                          <Icon size={20} />
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-ink-2 border border-ink-line rounded-sm p-6"
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-beacon mb-5">
                Event coordinators
              </p>
              <Suspense fallback={<CoordinatorLoadingFallback />}>
                {Array.isArray(coordinators) && coordinators.length > 0 ? (
                  <CoordinatorList
                    coordinators={coordinators}
                    isAdmin={isAdmin}
                    showTitleSection={false}
                    cardLayout="simple"
                    gridClass="grid-cols-1 gap-4"
                    maxVisible={3}
                  />
                ) : (
                  <p className="text-dim text-sm italic py-4 text-center">
                    Coordinator information not available.
                  </p>
                )}
              </Suspense>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-ink-line text-dim font-mono text-xs uppercase tracking-widest hover:text-paper hover:border-dim transition-colors duration-300"
          >
            <FiArrowLeft /> Back to all events
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default EventPage;
