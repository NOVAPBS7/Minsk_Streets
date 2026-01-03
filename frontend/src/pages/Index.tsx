import { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ParallaxProvider } from 'react-scroll-parallax';
import IntroScreen from '@/components/IntroScreen';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import WWIISection from '@/components/WWIISection';
import StreetsResponsiveWrapper from '@/components/StreetsResponsiveWrapper';
import StreetSearchSection from '@/components/StreetSearchSection';
import MemorySection from '@/components/MemorySection';
import TouristRouteSection from '@/components/TouristRouteSection';
import ContactsSection from '@/components/ContactsSection';
import GallerySection from '@/components/GallerySection';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import ScrollingFlags from '@/components/ScrollingFlags';
import PrivacyBanner from '@/components/PrivacyBanner';
import AIChatButton from '@/components/AIChat/AIChatButton';
import AIChatModal from '@/components/AIChat/AIChatModal';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  useSmoothScroll();

  
  useEffect(() => {
    
    window.scrollTo(0, 0);
    
    
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 100);
    
    
    const timer2 = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 2100);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <LanguageProvider>
      <ParallaxProvider>
        <AnimatedBackground />
        {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
        <div className={showIntro ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
          <Navigation onAIChatOpen={() => setIsChatOpen(true)} />
          <HeroSection />
          <WWIISection />
          <ScrollingFlags />
          <StreetSearchSection />
          <StreetsResponsiveWrapper />
          <MemorySection />
          <TouristRouteSection />
          <GallerySection />
          <ContactsSection />
          <Footer />
        </div>
        <PrivacyBanner />
        {!showIntro && <AIChatButton onClick={() => setIsChatOpen(true)} />}
        <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </ParallaxProvider>
    </LanguageProvider>
  );
};

export default Index;
