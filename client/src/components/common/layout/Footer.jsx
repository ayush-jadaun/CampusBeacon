import { motion } from "framer-motion";
import { HiLocationMarker, HiMail, HiPhone, HiArrowUp } from "react-icons/hi";
import {
  SiReact,
  SiJavascript,
  SiNodedotjs,
  SiTailwindcss,
  SiFramer,
  SiVercel,
  SiSupabase,
} from "react-icons/si";
import {
  FaLinkedin,
  FaEnvelope,
  FaGithub,
  FaInstagram,
} from "react-icons/fa";
import { BiLogoPostgresql } from "react-icons/bi";

const technologies = [
  {
    Icon: SiJavascript,
    name: "JavaScript",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  {
    Icon: SiReact,
    name: "React",
    url: "https://react.dev/",
  },
  {
    Icon: SiNodedotjs,
    name: "Node.js",
    url: "https://nodejs.org/",
  },
  {
    Icon: BiLogoPostgresql,
    name: "PostgreSQL",
    url: "https://www.postgresql.org/",
  },
  {
    Icon: SiTailwindcss,
    name: "Tailwind CSS",
    url: "https://tailwindcss.com/",
  },
  {
    Icon: SiFramer,
    name: "Framer Motion",
    url: "https://www.framer.com/motion/",
  },
  {
    Icon: SiVercel,
    name: "Vercel",
    url: "https://vercel.com/",
  },
  {
    Icon: SiSupabase,
    name: "Supabase",
    url: "https://supabase.com/",
  },
];

const columnHeading =
  "font-mono text-xs uppercase tracking-widest text-dim mb-6";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const simpleFadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.3 },
  };

  const simpleSlideIn = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.3 },
  };

  return (
    <footer className="relative bg-ink-2 border-t border-ink-line text-paper pt-16 pb-8">
      <div className="container mx-auto px-6">
        {/* Sign-off wordmark */}
        <div className="mb-14">
          <motion.h2
            {...simpleSlideIn}
            className="font-display italic font-semibold text-4xl sm:text-5xl md:text-6xl text-paper"
          >
            Campus<span className="text-beacon">Beacon</span>
          </motion.h2>
          <motion.p
            {...simpleSlideIn}
            className="mt-5 max-w-md text-dim text-base leading-relaxed"
          >
            Your comprehensive campus companion, connecting students with
            resources, opportunities, and each other.
          </motion.p>
          <motion.div {...simpleFadeIn} className="mt-6 flex space-x-5">
            <a
              href="https://www.instagram.com/campus_beacon/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dim hover:text-beacon transition-colors"
              aria-label="CampusBeacon Instagram"
            >
              <FaInstagram size={22} />
            </a>
            <a
              href="https://github.com/ayush-jadaun/CampusBeacon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dim hover:text-beacon transition-colors"
              aria-label="CampusBeacon Github"
            >
              <FaGithub size={22} />
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 mb-12">
          {/* Contact Section */}
          <div>
            <motion.h3 {...simpleSlideIn} className={columnHeading}>
              Contact
            </motion.h3>
            <div className="space-y-4 text-base">
              <motion.a
                {...simpleSlideIn}
                href="mailto:campusbeacon0@gmail.com"
                className="flex items-center space-x-4 group"
              >
                <HiMail
                  className="text-lg flex-shrink-0 text-dim group-hover:text-beacon transition-colors"
                  aria-hidden="true"
                />
                <span className="link-sweep text-paper">
                  campusbeacon0@gmail.com
                </span>
              </motion.a>
              <motion.a
                {...simpleSlideIn}
                href="tel:+919548999129"
                className="flex items-center space-x-4 group"
              >
                <HiPhone
                  className="text-lg flex-shrink-0 text-dim group-hover:text-beacon transition-colors"
                  aria-hidden="true"
                />
                <span className="link-sweep text-paper">+91 9548999129</span>
              </motion.a>
              <motion.a
                {...simpleSlideIn}
                href="https://maps.app.goo.gl/tMuCf5DjfXLF3YuDA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-4 group"
              >
                <HiLocationMarker
                  className="text-lg flex-shrink-0 mt-1 text-dim group-hover:text-beacon transition-colors"
                  aria-hidden="true"
                />
                <span className="link-sweep text-paper">
                  MNNIT Allahabad, Prayagraj, India
                </span>
              </motion.a>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div>
            <motion.h3 {...simpleSlideIn} className={columnHeading}>
              Built With
            </motion.h3>
            <div className="grid grid-cols-4 gap-5 max-w-[14rem]">
              {technologies.map(({ Icon, name, url }) => (
                <motion.a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={name}
                  aria-label={`Link to ${name} website`}
                  {...simpleFadeIn}
                  className="text-dim hover:text-beacon transition-colors flex justify-center items-center"
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div>
            <motion.h3 {...simpleSlideIn} className={columnHeading}>
              Our Team
            </motion.h3>
            <div className="space-y-6 text-base">
              <motion.div {...simpleSlideIn}>
                <h4 className="font-display text-lg font-medium text-paper mb-1">
                  Ayush Jadaun
                </h4>
                <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-3">
                  Full Stack Developer
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/ayush-jadaun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dim hover:text-beacon transition-colors"
                    aria-label="Ayush Jadaun Github"
                  >
                    <FaGithub size={18} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ayush-jadaun-677199311/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dim hover:text-beacon transition-colors"
                    aria-label="Ayush Jadaun LinkedIn"
                  >
                    <FaLinkedin size={18} />
                  </a>
                  <a
                    href="mailto:ayushjadaun6@gmail.com"
                    className="text-dim hover:text-beacon transition-colors"
                    aria-label="Email Ayush Jadaun"
                  >
                    <FaEnvelope size={18} />
                  </a>
                </div>
              </motion.div>
              <motion.div {...simpleSlideIn}>
                <h4 className="font-display text-lg font-medium text-paper mb-1">
                  Ayush Agarwal
                </h4>
                <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-3">
                  Full Stack Developer
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/ayushagr101"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dim hover:text-beacon transition-colors"
                    aria-label="Ayush Agarwal Github"
                  >
                    <FaGithub size={18} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ayush-agarwal-108127311/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dim hover:text-beacon transition-colors"
                    aria-label="Ayush Agarwal LinkedIn"
                  >
                    <FaLinkedin size={18} />
                  </a>
                  <a
                    href="mailto:ayush.agr160@gmail.com"
                    className="text-dim hover:text-beacon transition-colors"
                    aria-label="Email Ayush Agarwal"
                  >
                    <FaEnvelope size={18} />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-ink-line pt-6 mt-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <motion.p
              {...simpleFadeIn}
              className="font-mono text-xs tracking-wide text-dim text-center sm:text-left"
            >
              Â© {new Date().getFullYear()} CampusBeacon{" "}
              <span className="text-beacon" aria-hidden="true">
                âœ¦
              </span>{" "}
              All rights reserved.
            </motion.p>
            <motion.div
              {...simpleFadeIn}
              className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 sm:gap-x-8"
            >
              <a
                href="/policy"
                className="link-sweep font-mono text-xs uppercase tracking-widest text-paper"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="link-sweep font-mono text-xs uppercase tracking-widest text-paper"
              >
                Terms of Service
              </a>
              <a
                href="/about"
                className="link-sweep font-mono text-xs uppercase tracking-widest text-paper"
              >
                About Us
              </a>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-dim hover:text-beacon transition-colors"
                aria-label="Back to top"
              >
                <span>Top</span>
                <HiArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
