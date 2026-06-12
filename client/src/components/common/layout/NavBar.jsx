import {
  useState,
  useRef,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  HiHome,
  HiSearch,
  HiShoppingBag,
  HiUser,
  HiOfficeBuilding,
  HiLogout,
  HiLogin,
  HiMenu,
  HiAcademicCap,
  HiClipboardList,
} from "react-icons/hi";
import { X, Building } from "lucide-react";
import { handleLogout } from "../../../slices/authSlice";
import { getAllHostels } from "../../../slices/hostelSlice";
import "react-toastify/dist/ReactToastify.css";

const Wordmark = ({ className = "" }) => (
  <span className={`font-display italic font-semibold text-paper ${className}`}>
    Campus<span className="text-beacon">Beacon</span>
  </span>
);

const mobileLinkClasses =
  "flex items-center gap-4 px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:text-beacon transition-colors";

const DefaultMobileMenu = ({
  isAuthenticated,
  mainLinks,
  academicsOptions,
  hostels,
  onClose,
  onLogout,
}) => (
  <motion.div
    initial={{ opacity: 0, x: "100%" }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: "100%" }}
    transition={{ type: "spring", stiffness: 300, damping: 35 }}
    className="fixed inset-0 z-40 sm:hidden"
  >
    <div
      className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-ink-2 border-l border-ink-line">
      <div className="flex flex-col h-full py-16 px-4 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-dim hover:text-beacon transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        {isAuthenticated && (
          <Link
            to="/profile"
            onClick={onClose}
            className={`${mobileLinkClasses} border-b border-ink-line pb-4 mb-4`}
          >
            <HiUser className="w-5 h-5 text-dim" />
            <span>Profile</span>
          </Link>
        )}

        {mainLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={onClose}
            className={mobileLinkClasses}
          >
            <link.icon className="w-5 h-5 text-dim" />
            <span>{link.name}</span>
          </Link>
        ))}

        {isAuthenticated && (
          <div className="mt-4 border-t border-ink-line pt-4">
            <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-dim">
              Academics
            </div>
            {academicsOptions.map((option) => (
              <Link
                key={option.name}
                to={option.path}
                onClick={onClose}
                className={mobileLinkClasses}
              >
                <option.icon className="w-5 h-5 text-dim" />
                <span>{option.name}</span>
              </Link>
            ))}
          </div>
        )}

        {isAuthenticated && hostels.length > 0 && (
          <div className="mt-4 border-t border-ink-line pt-4">
            <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-dim">
              Hostels
            </div>
            {hostels.map((hostel) => (
              <Link
                key={hostel.hostel_id}
                to={`/hostels/${hostel.hostel_id}`}
                onClick={onClose}
                className={mobileLinkClasses}
              >
                <HiOfficeBuilding className="w-5 h-5 text-dim" />
                <span>{hostel.hostel_name}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-ink-line">
          {isAuthenticated ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className={`${mobileLinkClasses} w-full text-dim hover:text-beacon`}
            >
              <HiLogout className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-beacon text-ink rounded-full font-semibold hover:bg-beacon-soft transition-colors"
            >
              <HiLogin className="w-5 h-5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

function NavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Optimized selectors
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);
  const hostels = useSelector((state) => state.hostel.hostels);

  // State management
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [showHostelMenu, setShowHostelMenu] = useState(false);
  const [showAcademicsMenu, setShowAcademicsMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs for controlled animations and optimizations
  const showTimeoutRef = useRef(null);
  const menuTimeoutRef = useRef(null);
  const activeMenuRef = useRef(null);
  const hostelsLoadedRef = useRef(false);
  const lastScrollY = useRef(0);

  // --- Main navigation links
  const mainLinks = useMemo(
    () =>
      isAuthenticated
        ? [
            { name: "Home", path: "/", icon: HiHome },
            { name: "Lost & Found", path: "/lost-found", icon: HiSearch },
            { name: "Market", path: "/marketplace", icon: HiShoppingBag },
          ]
        : [{ name: "Home", path: "/", icon: HiHome }],
    [isAuthenticated]
  );

  // Academics menu options
  const academicsOptions = useMemo(
    () => [
      {
        name: "Attendance Tracker",
        path: "/attendance",
        icon: HiClipboardList,
      },
      // Add more academic options as needed
    ],
    []
  );

  // Mono micro-label treatment shared by every desktop nav item
  const desktopLinkClasses = (active) =>
    `link-sweep font-mono text-xs uppercase tracking-widest py-2 transition-colors ${
      active ? "text-beacon" : "text-paper"
    }`;

  // --- Event handlers
  const handleLogoutClick = async () => {
    try {
      await dispatch(handleLogout()).unwrap();
      navigate("/login");
      setIsVisible(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Unified dropdown menu handlers
  const handleMenuEnter = (menuType) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    activeMenuRef.current = menuType;

    if (menuType === "academics") setShowAcademicsMenu(true);
    if (menuType === "hostels") setShowHostelMenu(true);
  };

  const handleMenuLeave = (menuType) => {
    menuTimeoutRef.current = setTimeout(() => {
      if (activeMenuRef.current === menuType) {
        activeMenuRef.current = null;
        if (menuType === "academics") setShowAcademicsMenu(false);
        if (menuType === "hostels") setShowHostelMenu(false);
      }
    }, 150);
  };

  // Auto-hide navbar on scroll down
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY.current + 20) {
      setIsVisible(false);
    } else if (currentScrollY < lastScrollY.current - 5) {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  // --- Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Load hostels data
  useEffect(() => {
    let hostelTimer;

    if (isAuthenticated && !loading && !hostelsLoadedRef.current) {
      hostelTimer = setTimeout(() => {
        dispatch(getAllHostels());
        hostelsLoadedRef.current = true;
      }, 100);
    }

    return () => {
      if (hostelTimer) clearTimeout(hostelTimer);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, [dispatch, isAuthenticated, loading]);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Add scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initial loading state
  if (isInitialRender && loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-ink/85 backdrop-blur-md border-b border-ink-line h-16 flex items-center px-5 sm:px-8">
          <Wordmark className="text-xl sm:text-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Trigger Area */}
      <div
        className="fixed top-0 left-0 w-full h-8 z-[60]"
        onMouseEnter={() => setIsVisible(true)}
      />

      {/* Mobile Menu Button */}
      <div className="fixed top-4 right-4 z-[70] sm:hidden">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full bg-ink-2/90 backdrop-blur-sm border border-ink-line text-paper hover:text-beacon transition-colors"
          aria-label="Menu"
        >
          <HiMenu className="w-6 h-6" />
        </motion.button>
      </div>
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Suspense
            fallback={<div className="fixed inset-0 z-40 bg-ink/80" />}
          >
            <DefaultMobileMenu
              isAuthenticated={isAuthenticated}
              mainLinks={mainLinks}
              academicsOptions={academicsOptions}
              hostels={hostels}
              onClose={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogoutClick}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 hidden sm:block"
            onMouseLeave={() => {
              if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
              showTimeoutRef.current = setTimeout(() => {
                if (!activeMenuRef.current) {
                  setIsVisible(false);
                }
              }, 300);
            }}
            onMouseEnter={() => {
              if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
            }}
          >
            <div className="bg-ink/85 backdrop-blur-md border-b border-ink-line">
              <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <Link to="/" aria-label="CampusBeacon home">
                    <Wordmark className="text-xl sm:text-2xl" />
                  </Link>

                  {/* Desktop Links */}
                  <div className="flex items-center gap-5 md:gap-7">
                    {/* Main Links */}
                    {mainLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={desktopLinkClasses(
                          location.pathname === link.path
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}

                    {/* Academics Dropdown */}
                    {isAuthenticated && (
                      <div
                        className="relative"
                        onMouseEnter={() => handleMenuEnter("academics")}
                        onMouseLeave={() => handleMenuLeave("academics")}
                      >
                        <button
                          className={`flex items-center gap-1.5 ${desktopLinkClasses(
                            showAcademicsMenu
                          )}`}
                        >
                          <HiAcademicCap
                            className="w-4 h-4 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span>Academics</span>
                        </button>
                        <AnimatePresence>
                          {showAcademicsMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 top-full mt-2 w-60 bg-ink-2 rounded-sm overflow-hidden border border-ink-line shadow-[0_10px_30px_rgba(0,0,0,0.45)] z-10"
                            >
                              {academicsOptions.map((option) => (
                                <Link
                                  key={option.name}
                                  to={option.path}
                                  className="flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-ink-3 hover:text-beacon transition-colors"
                                >
                                  <option.icon
                                    className="w-4 h-4 flex-shrink-0 text-dim"
                                    aria-hidden="true"
                                  />
                                  <span>{option.name}</span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Hostels Dropdown */}
                    {isAuthenticated && hostels.length > 0 && (
                      <div
                        className="relative"
                        onMouseEnter={() => handleMenuEnter("hostels")}
                        onMouseLeave={() => handleMenuLeave("hostels")}
                      >
                        <button
                          className={`flex items-center gap-1.5 ${desktopLinkClasses(
                            showHostelMenu
                          )}`}
                        >
                          <Building
                            className="w-4 h-4 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span>Hostels</span>
                        </button>
                        <AnimatePresence>
                          {showHostelMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 top-full mt-2 w-56 bg-ink-2 rounded-sm overflow-hidden border border-ink-line shadow-[0_10px_30px_rgba(0,0,0,0.45)] z-10 max-h-80 overflow-y-auto"
                            >
                              {hostels.map((hostel) => (
                                <Link
                                  key={hostel.hostel_id}
                                  to={`/hostels/${hostel.hostel_id}`}
                                  className="block px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-ink-3 hover:text-beacon transition-colors"
                                >
                                  {hostel.hostel_name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Profile & Auth Buttons */}
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          className={desktopLinkClasses(
                            location.pathname === "/profile"
                          )}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="link-sweep font-mono text-xs uppercase tracking-widest py-2 text-dim hover:text-paper transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 bg-beacon text-ink rounded-full font-semibold px-5 py-2 hover:bg-beacon-soft transition-colors"
                      >
                        <HiLogin className="w-4 h-4" aria-hidden="true" />
                        <span>Login</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export default NavBar;
