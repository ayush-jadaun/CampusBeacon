import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * One row of the services index — an editorial directory entry.
 * Resting state: ink row with hairline divider.
 * Hover: the row floods beacon-amber and the type inverts to ink.
 */
const FeatureCard = React.memo(
  ({ icon: Icon, title, description, href = "/", index = 1 }) => {
    const navigate = useNavigate();

    const handleClick = useCallback(
      (e) => {
        e.preventDefault();
        navigate(href);
      },
      [navigate, href]
    );

    return (
      <motion.a
        href={href}
        onClick={handleClick}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="group relative grid grid-cols-[auto_1fr_auto] sm:grid-cols-[5rem_1fr_2fr_auto] items-center gap-x-4 sm:gap-x-8 border-b border-ink-line px-3 sm:px-6 py-6 sm:py-7 cursor-pointer transition-colors duration-300 hover:bg-beacon focus-visible:bg-beacon outline-none"
      >
        {/* Index number */}
        <span className="font-mono text-xs sm:text-sm text-dim group-hover:text-ink/60 transition-colors duration-300 tracking-widest">
          {String(index).padStart(2, "0")}
        </span>

        {/* Title */}
        <span className="flex items-center gap-3 min-w-0">
          <Icon
            className="hidden sm:block w-5 h-5 shrink-0 text-beacon group-hover:text-ink transition-colors duration-300"
            aria-hidden="true"
          />
          <span className="font-display text-2xl sm:text-3xl md:text-4xl font-medium text-paper group-hover:text-ink transition-colors duration-300 truncate">
            {title}
          </span>
        </span>

        {/* Description (desktop) */}
        <span className="hidden sm:block text-sm md:text-base text-dim group-hover:text-ink/75 transition-colors duration-300 leading-snug">
          {description}
        </span>

        {/* Arrow */}
        <span className="justify-self-end">
          <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-dim group-hover:text-ink transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </motion.a>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  href: PropTypes.string,
  index: PropTypes.number,
};

export default FeatureCard;
