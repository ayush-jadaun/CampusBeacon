import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  lazy,
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
import { HiChatBubbleLeftRight, HiTruck } from "react-icons/hi2";
import { X, Building } from "lucide-react";
import { handleLogout } from "../../../slices/authSlice";
import { getAllHostels } from "../../../slices/hostelSlice";
import "react-toastify/dist/ReactToastify.css";

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
      className="absolute inset-0 bg-black/80 backdrop-blur-lg"
      onClick={onClose}
    />
    <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-gray-900/95 shadow-2xl">
      <div className="flex flex-col h-full py-16 px-4 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        {isAuthenticated && (
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors mb-4"
          >
            <HiUser className="w-6 h-6" />
            <span>Profile</span>
          </Link>
        )}

        {mainLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={onClose}
            className="flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </Link>
        ))}

        {isAuthenticated && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Academics
            </div>
            {academicsOptions.map((option) => (
              <Link
                key={option.name}
                to={option.path}
                onClick={onClose}
                className="flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <option.icon className="w-5 h-5" />
                <span>{option.name}</span>
              </Link>
            ))}
          </div>
        )}

        {isAuthenticated && hostels.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hostels
            </div>
            {hostels.map((hostel) => (
              <Link
                key={hostel.hostel_id}
                to={`/hostels/${hostel.hostel_id}`}
                onClick={onClose}
                className="flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <HiOfficeBuilding className="w-5 h-5" />
                <span>{hostel.hostel_name}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/10">
          {isAuthenticated ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center space-x-4 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <HiLogout className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center space-x-4 w-full px-4 py-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition-colors"
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
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl mx-auto z-50">
        <div className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10 h-16 flex items-center px-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            CampusBeacon
          </div>
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 shadow-lg"
          aria-label="Menu"
        >
          <HiMenu className="w-6 h-6 text-white" />
        </motion.button>
      </div>
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Suspense
            fallback={<div className="fixed inset-0 z-40 bg-black/50" />}
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
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl mx-auto z-50 hidden sm:block"
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
            <div className="relative rounded-2xl overflow-visible bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10">
              <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <Link
                    to="/"
                    className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent"
                  >
                    CampusBeacon
                  </Link>

                  {/* Desktop Links */}
                  <div className="flex items-center space-x-4 md:space-x-6 text-sm md:text-base">
                    {/* Main Links */}
                    {mainLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white transition-colors relative group"
                      >
                        <link.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span>{link.name}</span>
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      </Link>
                    ))}

                    {/* Academics Dropdown */}
                    {isAuthenticated && (
                      <div
                        className="relative"
                        onMouseEnter={() => handleMenuEnter("academics")}
                        onMouseLeave={() => handleMenuLeave("academics")}
                      >
                        <button className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white transition-colors relative group">
                          <HiAcademicCap className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span>Academics</span>
                          <span
                            className={`absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 ${
                              showAcademicsMenu
                                ? "scale-x-100"
                                : "scale-x-0 group-hover:scale-x-100"
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {showAcademicsMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 top-full mt-2 w-60 bg-black/70 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-lg z-10"
                            >
                              {academicsOptions.map((option) => (
                                <Link
                                  key={option.name}
                                  to={option.path}
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                  <option.icon className="w-5 h-5 flex-shrink-0 opacity-80" />
                                  <span className="font-medium">
                                    {option.name}
                                  </span>
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
                        <button className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white transition-colors relative group">
                          <Building className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span>Hostels</span>
                          <span
                            className={`absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 ${
                              showHostelMenu
                                ? "scale-x-100"
                                : "scale-x-0 group-hover:scale-x-100"
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {showHostelMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 top-full mt-2 w-56 bg-black/70 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-lg z-10 max-h-80 overflow-y-auto"
                            >
                              {hostels.map((hostel) => (
                                <Link
                                  key={hostel.hostel_id}
                                  to={`/hostels/${hostel.hostel_id}`}
                                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors font-medium"
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
                          className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white transition-colors relative group"
                        >
                          <HiUser className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span>Profile</span>
                          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white transition-colors relative group"
                        >
                          <HiLogout className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span>Logout</span>
                          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white transition-colors relative group"
                      >
                        <HiLogin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span>Login</span>
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
