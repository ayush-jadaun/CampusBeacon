import React, { Suspense, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Coffee,
  ShoppingBag,
  Book,
  Car,
  MessagesSquare,
  CalendarCheck,
  ArrowDownRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { NotificationIcon } from "../components/features/notifications";

const FeatureCard = React.lazy(() =>
  import("../components/HomePage/FeatureCard")
);
const QuickLinks = React.lazy(() =>
  import("../components/HomePage/QuickLinks")
);
const EventsSection = React.lazy(() =>
  import("../components/HomePage/EventsSection")
);
const ImageSlider = React.lazy(() =>
  import("../components/HomePage/ImageSlider")
);
const ChatbotWidget = React.lazy(() =>
  import("../components/HomePage/ChatbotWidget")
);

const SERVICES = [
  {
    icon: Coffee,
    title: "Eateries",
    description: "Every chai stall, canteen and late-night bite, rated by students.",
    href: "/eatries",
  },
  {
    icon: Search,
    title: "Lost & Found",
    description: "Lost your ID near the library? Someone here has probably found it.",
    href: "/lost-found",
  },
  {
    icon: ShoppingBag,
    title: "Buy & Sell",
    description: "Books, cycles, coolers, kettles — the campus second-hand economy.",
    href: "/marketplace",
  },
  {
    icon: Book,
    title: "Resource Hub",
    description: "Notes and papers for every branch, every semester, in one place.",
    href: "/resource",
  },
  {
    icon: MessagesSquare,
    title: "Community Chat",
    description: "Hostel groups, club channels and the campus conversation.",
    href: "/chat",
  },
  {
    icon: Car,
    title: "Ride Sharing",
    description: "Split a cab to Prayagraj Junction. Save money, make friends.",
    href: "/rides",
  },
  {
    icon: CalendarCheck,
    title: "Attendance",
    description: "Stay above 75% without spreadsheet anxiety.",
    href: "/attendance",
  },
];

const TICKER_ITEMS = [
  "Eateries",
  "Lost & Found",
  "Buy & Sell",
  "Resource Hub",
  "Community Chat",
  "Ride Sharing",
  "Attendance",
  "Clubs",
  "Events",
  "Hostels",
];

const SectionHeader = ({ index, title, blurb }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="mb-12 sm:mb-16"
  >
    <div className="flex items-center gap-4 mb-4">
      <span className="font-mono text-xs sm:text-sm text-beacon tracking-[0.25em]">
        ( {index} )
      </span>
      <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
    </div>
    <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-paper">
      {title}
    </h2>
    {blurb && (
      <p className="mt-4 max-w-xl text-base sm:text-lg text-dim">{blurb}</p>
    )}
  </motion.div>
);

const SuspenseFallback = ({ height = "h-48" }) => (
  <div className={`w-full ${height} bg-ink-2 rounded-lg animate-pulse`} />
);

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const scrollToSection = useCallback((sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="relative bg-ink text-paper min-h-screen">
      {/* Film grain over the whole page */}
      <div className="grain z-[60]" aria-hidden="true" />

      {isAuthenticated && (
        <div className="fixed top-16 right-4 z-50 flex items-center">
          <NotificationIcon />
        </div>
      )}

      {/* ============ HERO ============ */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-0"
      >
        {/* Beacon: rotating sweep + core, anchored top-right */}
        <div
          className="absolute -top-40 -right-40 w-[34rem] h-[34rem] sm:w-[44rem] sm:h-[44rem] pointer-events-none"
          aria-hidden="true"
        >
          <div className="beacon-sweep absolute inset-0" />
          <div className="absolute inset-[12%] rounded-full border border-dashed border-ink-line" />
          <div className="absolute inset-[28%] rounded-full border border-ink-line" />
          <div className="beacon-core absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-beacon shadow-[0_0_40px_8px_rgba(255,178,36,0.45)]" />
        </div>

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
            className="font-mono text-[11px] sm:text-xs tracking-[0.3em] text-beacon uppercase mb-6 sm:mb-8"
          >
            MNNIT Allahabad · Student-run campus network
          </motion.p>

          <h1 className="font-display font-semibold leading-[0.95] text-[clamp(3.2rem,9vw,7.5rem)] max-w-5xl">
            {["Your", "campus,"].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.28em]"
              >
                {word}
              </motion.span>
            ))}
            <motion.em
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block not-italic"
            >
              <span className="italic text-beacon">lit up.</span>
            </motion.em>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 max-w-xl text-base sm:text-lg text-dim leading-relaxed"
          >
            Mess menus, lost ID cards, shared cabs, semester notes and every
            club on campus — one beacon for the whole of MNNIT, kept alive by
            the students who use it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => scrollToSection("services")}
              className="group inline-flex items-center gap-2 bg-beacon text-ink font-semibold px-7 py-3.5 rounded-full hover:bg-beacon-soft transition-colors duration-300"
            >
              Explore services
              <ArrowDownRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("events")}
              className="link-sweep font-mono text-sm tracking-wide text-paper px-1 py-2"
            >
              Browse events →
            </button>
          </motion.div>
        </div>

        {/* Ticker at the foot of the hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative z-10 mt-20 sm:mt-24 border-y border-ink-line bg-ink-2/60 backdrop-blur-sm overflow-hidden"
        >
          <div className="marquee-track py-3.5">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 items-center"
                aria-hidden={copy === 1}
              >
                {TICKER_ITEMS.map((item) => (
                  <span
                    key={`${copy}-${item}`}
                    className="flex items-center font-mono text-xs sm:text-sm tracking-[0.2em] uppercase text-dim"
                  >
                    <span className="px-6">{item}</span>
                    <span className="text-beacon">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============ SERVICES INDEX ============ */}
      <section id="services" className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            index="01"
            title="Services"
            blurb="The directory. Everything the campus runs on, one row each."
          />
          <div className="border-t border-ink-line">
            {SERVICES.map((service, i) => (
              <Suspense key={service.href} fallback={<SuspenseFallback height="h-20" />}>
                <FeatureCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                  index={i + 1}
                />
              </Suspense>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NOTICEBOARD ============ */}
      <section id="quicklinks" className="relative py-24 sm:py-32 bg-ink-2/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            index="02"
            title="Noticeboard"
            blurb="Pinned for everyone — portals, calendars and the fun corners of campus."
          />
          <Suspense fallback={<SuspenseFallback height="h-64" />}>
            <QuickLinks />
          </Suspense>
        </div>
      </section>

      {/* ============ CLUBS ============ */}
      <section id="clubs" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            index="03"
            title="Clubs & culture"
            blurb="Robotics to dramatics — find the people who stay up late for the same things you do."
          />
          <Suspense fallback={<SuspenseFallback height="h-64" />}>
            <ImageSlider />
          </Suspense>
        </div>
      </section>

      {/* ============ EVENTS ============ */}
      <section id="events" className="relative py-24 sm:py-32 bg-ink-2/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <SectionHeader
            index="04"
            title="What's on"
            blurb="Fests, talks, auditions and everything in between."
          />
        </div>
        <Suspense fallback={<SuspenseFallback height="h-96" />}>
          <EventsSection />
        </Suspense>
      </section>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        <Suspense fallback={null}>
          <ChatbotWidget />
        </Suspense>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
