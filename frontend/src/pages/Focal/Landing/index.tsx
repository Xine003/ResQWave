import { ChatbotConvo } from "@/pages/Focal/Landing/components/ChatbotConvo";
import { LandingHeader } from "@/pages/Focal/Landing/components/Header";
import { LandingHero } from "@/pages/Focal/Landing/components/Hero";
import { useEffect, useState } from "react";

export function Landing() {
  const [navOpen, setNavOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 1.5; // Minimum scroll to trigger hide/show
      
      // Determine if user scrolled past threshold
      setIsScrolled(currentScrollY > scrollThreshold);
      
      // Show header if:
      // 1. At the top (within threshold)
      // 2. Scrolling up
      if (currentScrollY <= scrollThreshold) {
        setShowHeader(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        // Scrolling down and past threshold
        setShowHeader(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen text-white flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Global Radial Gradient Backgrounds with animation */}
      <div
        className="global-radial-gradient"
        style={{
          right: '-8%',
          top: '90%',
          width: '900px',
          height: '900px',
          background: 'radial-gradient(circle, rgba(0, 65, 161, 0.1) 0%, rgba(0, 97, 255, 0.1) 50%, rgba(23, 23, 23, 0.1) 100%)',
        }}
      />
      <div
        className="global-radial-gradient"
        style={{
          left: '-11%',
          top: '-35%',
          width: '950px',
          height: '950px',
          background: 'radial-gradient(circle, rgba(0, 65, 161, 0.1) 0%, rgba(0, 97, 255, 0.1) 40%, rgba(23, 23, 23, 0.1) 100%)',
        }}
      />
      {/* Header */}
      <LandingHeader navOpen={navOpen} setNavOpen={setNavOpen} isScrolled={isScrolled} showHeader={showHeader} />
      {/* Hero Section */}
      <LandingHero />
      {/* Floating Chatbot Widget */}
      <ChatbotConvo />
      <div className="h-1000">fdas</div>
    </div>
  );
}