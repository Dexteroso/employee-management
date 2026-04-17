import { useEffect, useState } from 'react';

function getViewportWidth() {
  if (typeof window === 'undefined') {
    return 1280;
  }

  return window.innerWidth;
}

export function useResponsive() {
  const [width, setWidth] = useState(getViewportWidth);

  useEffect(() => {
    const handleResize = () => setWidth(getViewportWidth());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isTablet: width <= 1024,
    isMobile: width <= 768,
    isSmallMobile: width <= 560
  };
}

