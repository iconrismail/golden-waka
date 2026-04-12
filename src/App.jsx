import { ReactLenis } from '@studio-freight/react-lenis'
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import GenericPage from './components/GenericPage';
import AboutPage from './components/AboutPage';
import DatesPage from './components/DatesPage';
import TravelPage from './components/TravelPage';
import ServicePage from './components/ServicePage';
import HomePage from './components/HomePage';
import GalleryPage from './components/GalleryPage';
import ContactPage from './components/ContactPage';
import JournalPage from './components/JournalPage';
import SupportPage from './components/SupportPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './components/AdminPage';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dates" element={<DatesPage />} />
          <Route path="/travel" element={<TravelPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/private-jets" element={
            <ServicePage
              title="Private Aviation"
              subtitle="Fly on Your Terms"
              heroImage="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2574&auto=format&fit=crop"
              description="Bypass long lines and commercial terminals. Experience the ultimate freedom of private aviation with our fleet of long-range jets, tailored catering, and seamless ground transport."
              features={[
                { title: "Global Reach", desc: "Access to 5,000+ airports" },
                { title: "On-Demand", desc: "Ready in as little as 4 hours" },
                { title: "Pet Friendly", desc: "Bring your companions" },
                { title: "Privacy", desc: "Discrete terminals & lounges" }
              ]}
            />
          } />
          <Route path="/villas" element={
            <ServicePage
              title="Luxury Villas"
              subtitle="Your Private Sanctuary"
              heroImage="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop"
              description="From clifftop estates in Amalfi to beachfront mansions in Turks & Caicos. Our portfolio of private villas offers the space, privacy, and amenities of a five-star resort, exclusively for you."
              features={[
                { title: "Private Staff", desc: "Chefs, butlers, & housekeeping" },
                { title: "Exclusive Access", desc: "Beaches & golf courses" },
                { title: "Concierge", desc: "24/7 Itinerary planning" },
                { title: "Design", desc: "Award-winning architecture" }
              ]}
            />
          } />
          <Route path="/experiences" element={
            <ServicePage
              title="Curated Experiences"
              subtitle="Memories for a Lifetime"
              heroImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop"
              description="Go beyond the guidebook. Whether it's a private after-hours tour of the Vatican, shark diving in South Africa, or truffle hunting in Piedmont, we unlock the world's most exclusive moments."
              features={[
                { title: "Access", desc: "Behind closed doors" },
                { title: "Guides", desc: "Local experts & historians" },
                { title: "Adventure", desc: "Custom expeditions" },
                { title: "Culture", desc: "Immersive workshops" }
              ]}
            />
          } />
          <Route path="/concierge" element={
            <ServicePage
              title="Global Concierge"
              subtitle="Your Wish, Granted"
              heroImage="https://images.unsplash.com/photo-1565551984260-60a674488a0b?q=80&w=2574&auto=format&fit=crop"
              description="Our dedicated lifestyle managers are at your service 24/7. From last-minute restaurant reservations to sourcing rare gifts, we handle the details so you can enjoy the journey."
              features={[
                { title: "24/7 Support", desc: "Always available" },
                { title: "Dining", desc: "Priority reservations" },
                { title: "Events", desc: "VIP tickets & access" },
                { title: "Logistics", desc: "Seamless transfers" }
              ]}
            />
          } />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminPage /></AdminRoute>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// Routes where the marketing Header + Footer should be hidden
const FULLSCREEN_ROUTES = ['/login', '/dashboard', '/admin'];

function AppLayout() {
  const { pathname } = useLocation();
  const hideShell = FULLSCREEN_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen selection:bg-white selection:text-black font-sans"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {!hideShell && <Header />}
      <ScrollToTop />
      <AnimatedRoutes />
      {!hideShell && <Footer />}
    </div>
  );
}

function App() {
  const lenisOptions = {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  };

  return (
    <ReactLenis root options={lenisOptions}>
      <ThemeProvider>
      <AuthProvider>
      <ToastProvider>
        <Router>
          <AppLayout />
        </Router>
      </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </ReactLenis>
  );
}

export default App;
