import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginSignup from "./pages/auth/LoginPage";
import NavBar from "./components/common/layout/NavBar";
import Footer from "./components/common/layout/Footer";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/user/ProfilePage";
import Marketplace from "./pages/marketplace/BuyAndSellPage";
import LostAndFound from "./pages/services/LostAndFound";
import SVBH from "./pages/hostel/SVBH";
import DJGH from "./pages/hostel/DJGH";
import ProtectedRoute from "./components/features/auth/ProtectedRoute";
import AboutUs from "./pages/utility/AboutUs";
import ContactsDisplay from "./pages/utility/ContactPage";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailVerification from "./pages/auth/EmailVerification";
import CollegeEateries from "./pages/services/Eateries";
import ResourcesPage from "./pages/utility/ResourceHub";
import PrivacyPolicy from "./pages/utility/PrivacyPolicy";
import TermsOfService from "./pages/utility/TermsOfService";
import NotFound from "./pages/utility/404";
import ServerError from "./pages/utility/500";
import Maintenance from "./pages/utility/Maintenance";
import MNNITFactsGenerator from "./pages/utility/FactsGenerator";
import CampusExplorer from "./pages/utility/CampusExplorer";
import MNNITTimeCapsule from "./pages/utility/MNNITTimeCapsule";
import RideShare from "./pages/services/RideShare";
import RidesProvider from "./contexts/ridesContext";
import {
  HostelNotificationsProvider,
  HostelProvider,
  MenuProvider,
  OfficialProvider,
  ComplaintProvider,
} from "./contexts/hostelContext";
import Dashboard from "./pages/hostel/Dashboard";
import ChatTestPage from "./pages/chat/ChatTestPage";
import AdminPanel from "./pages/admin/AdminPanel";
import MenuPage from "./pages/hostel/MenuPage";
import HostelPage from "./pages/hostel/HostelPage";
import AdminHostelPage from "./pages/hostel/AdminHostelPage";
import OfficialPage from "./pages/hostel/OfficialPage";
import ComplaintPage from "./pages/hostel/ComplaintPage";
import NotificationsPage from "./pages/hostel/NotificationPage";
import SeeHostel from "./pages/hostel/SeeHostel";
import HostelSelector from "./pages/hostel/HostelSelector";

function App() {
  return (
    <BrowserRouter>
      <HostelProvider>
        <MenuProvider>
          <OfficialProvider>
            <HostelNotificationsProvider>
              <ComplaintProvider>
                <RidesProvider>
                  <div className="flex flex-col min-h-screen">
                    <NavBar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginSignup />} />
                        <Route
                          path="/reset-password"
                          element={<ResetPassword />}
                        />
                        <Route
                          path="/verify-email"
                          element={<EmailVerification />}
                        />
                        <Route path="/policy" element={<PrivacyPolicy />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/404" element={<NotFound />} />
                        <Route path="/500" element={<ServerError />} />
                        <Route path="/maintenance" element={<Maintenance />} />
                        <Route
                          path="/facts"
                          element={<MNNITFactsGenerator />}
                        />
                        <Route path="/explore" element={<CampusExplorer />} />
                        <Route path="/time" element={<MNNITTimeCapsule />} />
                        <Route path="/rides" element={<RideShare />} />
                        <Route path="/contact" element={<ContactsDisplay />} />
                        <Route path="/SVBH" element={<SVBH />} />
                        <Route path="/DJGH" element={<DJGH />} />
                        <Route path="/Menu" element={<MenuPage />} />
                        <Route
                          path="/hostelcreate"
                          element={<AdminHostelPage />}
                        />
                        <Route path="/official" element={<OfficialPage />} />
                        <Route path="/complaints" element={<ComplaintPage />} />
                        <Route
                          path="/hostel-notification"
                          element={<NotificationsPage />}
                        />
                        <Route
                          path="/viewpagehostel"
                          element={<HostelSelector />}
                        />
                        <Route path="/dashboard" element={<Dashboard />} />
                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route
                            path="/marketplace"
                            element={<Marketplace />}
                          />
                          <Route path="/god/*" element={<AdminPanel />} />
                          <Route path="/chat" element={<ChatTestPage />} />
                          <Route
                            path="/lost-found"
                            element={<LostAndFound />}
                          />
                          <Route path="/resource" element={<ResourcesPage />} />

                          <Route
                            path="/eatries"
                            element={<CollegeEateries />}
                          />
                        </Route>
                        {/* Redirect unknown paths */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </RidesProvider>
              </ComplaintProvider>
            </HostelNotificationsProvider>
          </OfficialProvider>
        </MenuProvider>
      </HostelProvider>
    </BrowserRouter>
  );
}

export default App;
