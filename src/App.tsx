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

gsap.registerPlugin(ScrollTrigger);

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
    <HashRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* App Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="capsule/:id" element={<CapsuleDetail />} />
          <Route path="new" element={<NewCapsule />} />
          <Route path="archive" element={<Archive />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
