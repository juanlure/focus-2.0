import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Landing Page Sections
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import LogoCarousel from './sections/LogoCarousel';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Testimonials from './sections/Testimonials';
import Pricing from './sections/Pricing';
import CTA from './sections/CTA';
import Footer from './sections/Footer';

// App Pages
import AppLayout from './app/AppLayout';
import Dashboard from './app/Dashboard';
import CapsuleDetail from './app/CapsuleDetail';
import NewCapsule from './app/NewCapsule';
import Archive from './app/Archive';
import Settings from './app/Settings';
import Login from './app/Login';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Auth
import { isAuthenticated } from './services/auth';

gsap.registerPlugin(ScrollTrigger);

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Landing Page Component
function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="relative bg-white min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <LogoCarousel />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

// Main App Component
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected App Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="capsule/:id" element={<CapsuleDetail />} />
            <Route path="new" element={<NewCapsule />} />
            <Route path="archive" element={<Archive />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
