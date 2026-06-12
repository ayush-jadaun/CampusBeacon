import { motion } from "framer-motion";
import {
  Calendar,
  FileText,
  User,
  Phone,
  Newspaper,
  Map,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { HiAcademicCap } from "react-icons/hi";

/**
 * The noticeboard: paper notes pinned on the dark board.
 * Cream cards, slight rotations, a pin dot, mono category stamps.
 */
const LINKS = [
  {
    icon: Calendar,
    label: "Academic Calendar",
    description: "Semester schedule, holidays and exam windows.",
    href: "https://drive.google.com/file/d/1yYKlN_WktRy2SQYdSaAr-8R42w3wGnTs/view?usp=sharing",
    stamp: "PDF",
    external: true,
    tilt: "-rotate-1",
  },
  {
    icon: User,
    label: "Academic Portal",
    description: "Grades, registrations and official records.",
    href: "https://www.academics.mnnit.ac.in/new",
    stamp: "MNNIT",
    external: true,
    tilt: "rotate-[0.75deg]",
  },
  {
    icon: FileText,
    label: "LAN Information",
    description: "Get the hostel internet working at 2 AM.",
    href: "https://drive.google.com/file/d/1IUyYjTPWsRlQCzVMvO1dkHKLIamg37js/view?usp=sharing",
    stamp: "GUIDE",
    external: true,
    tilt: "rotate-1",
  },
  {
    icon: Phone,
    label: "Contacts",
    description: "Wardens, offices and emergency numbers.",
    href: "/contact",
    stamp: "DIRECTORY",
    tilt: "-rotate-[0.75deg]",
  },
  {
    icon: Map,
    label: "Campus Explorer",
    description: "Hidden corners worth skipping a lecture for.",
    href: "/explore",
    stamp: "FUN",
    tilt: "rotate-[1.25deg]",
  },
  {
    icon: Lightbulb,
    label: "Facts Generator",
    description: "Things you didn't know about this campus.",
    href: "/facts",
    stamp: "FUN",
    tilt: "-rotate-1",
  },
  {
    icon: Newspaper,
    label: "Time Capsule",
    description: "MNNIT through the decades, year by year.",
    href: "/time",
    stamp: "ARCHIVE",
    tilt: "rotate-[0.5deg]",
  },
  {
    icon: HiAcademicCap,
    label: "Clubs",
    description: "Every society and community on campus.",
    href: "/clubs",
    stamp: "CULTURE",
    tilt: "-rotate-[1.25deg]",
  },
];

const NoteInner = ({ link }) => (
  <>
    {/* Pin */}
    <span
      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-beacon border-2 border-beacon-deep shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
      aria-hidden="true"
    />

    <div className="flex items-start justify-between gap-3">
      <link.icon className="w-6 h-6 text-ink/80" aria-hidden="true" />
      <span className="font-mono text-[10px] tracking-[0.2em] text-ink/50 border border-ink/25 rounded-sm px-1.5 py-0.5">
        {link.stamp}
      </span>
    </div>

    <h3 className="mt-4 font-display text-xl font-semibold text-ink leading-tight">
      {link.label}
    </h3>
    <p className="mt-2 text-sm text-ink/65 leading-snug flex-grow">
      {link.description}
    </p>

    <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs tracking-wide text-ink/60 group-hover:text-ink transition-colors">
      {link.external ? "Open" : "Visit"}
      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  </>
);

const noteClasses = (tilt) =>
  `group relative flex flex-col h-full bg-paper ${tilt} rounded-sm p-5 pt-6 ` +
  "shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 " +
  "hover:rotate-0 hover:scale-[1.03] hover:z-10";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const QuickLinks = () => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    transition={{ staggerChildren: 0.06 }}
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
  >
    {LINKS.map((link) => (
      <motion.div key={link.label} variants={cardVariants} className="h-full">
        {link.external ? (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={noteClasses(link.tilt)}
          >
            <NoteInner link={link} />
          </a>
        ) : (
          <Link to={link.href} className={noteClasses(link.tilt)}>
            <NoteInner link={link} />
          </Link>
        )}
      </motion.div>
    ))}
  </motion.div>
);

export default QuickLinks;
