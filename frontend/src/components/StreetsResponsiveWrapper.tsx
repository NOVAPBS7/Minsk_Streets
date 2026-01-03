import { useState, useEffect, useCallback } from 'react';
import StreetsSection from './StreetsSection';
import StreetsSectionMobile from './StreetsSectionMobile';

const MOBILE_BREAKPOINT = 1290;

const StreetsResponsiveWrapper = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const checkScreenSize = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [checkScreenSize]);

  // Prevent hydration mismatch by rendering nothing on server
  if (!isClient) {
    return null;
  }

  // Render mobile version for screens < 1290px
  if (isMobile) {
    return <StreetsSectionMobile />;
  }

  // Render desktop version for screens >= 1290px
  return <StreetsSection />;
};

export default StreetsResponsiveWrapper;
