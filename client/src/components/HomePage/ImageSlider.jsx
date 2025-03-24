import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Memoized club data
const clubs = [
  {
    title: "Computer Coding Club",
    description: "Explore the world of programming and development",
    icon: "💻",
    image: "src/assets/images/ccImage.png",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    tags: ["Programming", "Development", "Tech"],
  },
  {
    title: "Robotics Club",
    description: "Build and program the future of automation",
    icon: "🤖",
    image: "src/assets/images/robotics.png",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    tags: ["Robotics", "AI", "Engineering"],
  },
  {
    title: "Core Dramatics",
    description: "Express creativity through art and performance",
    icon: "🎭",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    tags: ["Drama", "Arts", "Performance"],
  },
  {
    title: "Green Club",
    description: "Connect with nature and help save the environment",
    icon: "🌿",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    tags: ["Environment", "Nature", "Sustainability"],
  },
];

// Memoized Club Content Component
const ClubContent = React.memo(({ club }) => (
  <div className="absolute inset-0 flex flex-col justify-end p-12">
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-3xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="text-6xl">{club.icon}</div>
        <h3
          className={`text-4xl font-bold bg-gradient-to-r ${club.gradient} bg-clip-text text-transparent`}
        >
          {club.title}
        </h3>
      </div>
      <p className="text-xl text-gray-200 mb-6 font-light">
        {club.description}
      </p>
      <div className="flex gap-3">
        {club.tags.map((tag) => (
          <span
            key={tag}
            className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${club.gradient} text-white text-sm font-medium`}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  </div>
));

ClubContent.displayName = "ClubContent";

// Memoized Navigation Button Component
const NavButton = React.memo(({ direction, onClick, children }) => (
  <button
    onClick={onClick}
    className={`absolute ${
      direction === "left" ? "left-4" : "right-4"
    } top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50`}
  >
    {children}
  </button>
));

NavButton.displayName = "NavButton";

const ImageSlider = () => {
  const [currentClub, setCurrentClub] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Memoize handlers
  const handlePrevious = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentClub((prev) => (prev - 1 + clubs.length) % clubs.length);
  }, []);

  const handleNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentClub((prev) => (prev + 1) % clubs.length);
  }, []);

  const handleDotClick = useCallback((index) => {
    setIsAutoPlaying(false);
    setCurrentClub(index);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, handleNext]);

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-3xl bg-gray-900 group">
      <NavButton direction="left" onClick={handlePrevious}>
        <ChevronLeft size={24} />
      </NavButton>
      <NavButton direction="right" onClick={handleNext}>
        <ChevronRight size={24} />
      </NavButton>

      <AnimatePresence mode="wait">
        {clubs.map(
          (club, index) =>
            index === currentClub && (
              <motion.div
                key={club.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
                style={{ willChange: "transform, opacity" }}
              >
                <motion.img
                  src={club.image}
                  alt={club.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 8 }}
                  loading="lazy"
                  style={{ willChange: "transform" }}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80`}
                />
                <ClubContent club={club} />
              </motion.div>
            )
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className={`h-full bg-gradient-to-r ${clubs[currentClub].gradient}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={currentClub}
          style={{ willChange: "width" }}
        />
      </div>

      <div className="absolute bottom-8 right-8 flex items-center gap-3">
        {clubs.map((club, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className="group relative"
          >
            <div
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${
                  index === currentClub
                    ? `bg-gradient-to-r ${club.gradient} scale-125`
                    : "bg-white/50 hover:bg-white/75"
                }
              `}
            />
            <div
              className={`
                absolute -inset-2 rounded-full opacity-0 
                group-hover:opacity-25 transition-opacity
                bg-gradient-to-r ${club.gradient}
                blur
              `}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ImageSlider);
