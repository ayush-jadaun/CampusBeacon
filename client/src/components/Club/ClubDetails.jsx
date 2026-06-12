import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiInfo, FiExternalLink } from "react-icons/fi";
import { FaInstagram, FaLinkedin, FaFacebook, FaLink } from "react-icons/fa";
import ImageGallery from "./ImageGallery";

const getSocialIcon = (url = "") => {
  try {
    if (typeof url !== "string" || !url.trim()) return <FaLink className="text-lg" />;
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("instagram.com")) return <FaInstagram className="text-lg" />;
    if (hostname.includes("linkedin.com")) return <FaLinkedin className="text-lg" />;
    if (hostname.includes("facebook.com")) return <FaFacebook className="text-lg" />;
  } catch (e) {}
  return <FaLink className="text-lg" />;
};

const ClubDetails = ({
  club,
  isAdmin,
  isCoordinator,
  themeStyles = {},
  onEditClick,
}) => {
  const [isHovering, setIsHovering] = useState(null);

  if (!club) {
    return (
      <div className="flex items-center justify-center min-h-[20vh] text-dim p-4">
        <span>Loading club details...</span>
      </div>
    );
  }

  const canEdit = isAdmin || isCoordinator;
  const hasSocialLinks =
    Array.isArray(club.social_media_links) &&
    club.social_media_links.some(
      (link) => typeof link === "string" && link.trim()
    );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 90, damping: 12 },
    },
  };
  const galleryVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 70, damping: 15, delay: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <motion.div
        variants={itemVariants}
        className="relative mb-12 md:mb-16 flex justify-between items-start gap-4"
      >
        <div className="relative flex-1 mr-4">
          <p className="font-mono text-[11px] tracking-[0.3em] text-beacon uppercase mb-3">
            Club · MNNIT
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-paper tracking-tight">
            {club.name}
          </h1>
          <div className="absolute -bottom-3 left-0 h-0.5 w-28 md:w-36 bg-beacon"></div>
        </div>
        {canEdit && (
          <motion.button
            onClick={onEditClick}
            className="flex-shrink-0 p-3 rounded-full text-dim bg-ink-2 hover:bg-beacon hover:text-ink hover:border-beacon transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-beacon focus:ring-offset-2 focus:ring-offset-ink border border-ink-line group"
            aria-label="Edit Club Details"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiEdit size={20} />
          </motion.button>
        )}
      </motion.div>
      <div className="grid md:grid-cols-5 gap-8 lg:gap-12 xl:gap-16 items-start">
        <motion.div
          variants={itemVariants}
          className="md:col-span-3 bg-ink-2 p-6 sm:p-8 rounded-sm border border-ink-line transition-colors duration-500 group relative overflow-hidden"
          onMouseEnter={() => setIsHovering("main")}
          onMouseLeave={() => setIsHovering(null)}
        >
          <div className="relative">
            <p
              className={`text-base md:text-lg leading-relaxed mb-8 tracking-wide transition-colors duration-300 ${
                isHovering === "main" ? "text-paper" : "text-dim"
              }`}
            >
              {club.description || (
                <span className="flex items-center text-dim italic">
                  <FiInfo className="mr-2 text-beacon flex-shrink-0" />
                  No description provided for this club.
                </span>
              )}
            </p>
            {hasSocialLinks && (
              <div className="relative mt-10 pt-6 border-t border-ink-line">
                <h3 className="font-mono text-xs uppercase tracking-widest text-dim mb-5">
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-4 sm:gap-5">
                  {club.social_media_links.map(
                    (link, idx) =>
                      typeof link === "string" && link.trim() ? (
                        <motion.a
                          key={`${club.id}-social-${idx}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-ink rounded-full hover:bg-beacon transition-colors duration-300 text-dim hover:text-ink focus:outline-none focus:ring-2 focus:ring-beacon focus:ring-offset-2 focus:ring-offset-ink border border-ink-line hover:border-beacon relative group/link"
                          aria-label={`Visit social media link ${idx + 1}`}
                          whileHover={{ y: -4, scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onMouseEnter={() => setIsHovering(`social-${idx}`)}
                          onMouseLeave={() => setIsHovering(null)}
                        >
                          {getSocialIcon(link)}
                          <AnimatePresence>
                            {isHovering === `social-${idx}` && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap font-mono text-xs text-paper bg-ink-3 border border-ink-line px-2 py-1 rounded-sm pointer-events-none"
                              >
                                <span className="flex items-center gap-1">
                                  <FiExternalLink size={10} />
                                  {(() => {
                                    try {
                                      return new URL(link).hostname.replace(
                                        "www.",
                                        ""
                                      );
                                    } catch {
                                      return "Link";
                                    }
                                  })()}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.a>
                      ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        <motion.div
          variants={galleryVariants}
          className="md:col-span-2 h-full"
          onMouseEnter={() => setIsHovering("gallery")}
          onMouseLeave={() => setIsHovering(null)}
        >
          <div className="bg-ink-2 p-4 sm:p-6 rounded-sm border border-ink-line transition-colors duration-500 relative overflow-hidden group h-full">
            <div className="relative h-full">
              {club.images && club.images.length > 0 ? (
                <ImageGallery images={club.images} />
              ) : (
                <div className="flex items-center justify-center h-full text-dim italic bg-ink rounded-sm">
                  No images available for this club.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClubDetails;
