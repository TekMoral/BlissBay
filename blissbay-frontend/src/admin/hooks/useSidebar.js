import { useState, useEffect, useLayoutEffect } from 'react';

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useLayoutEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setShowSidebar(!mobile);
    if (mobile) setCollapsed(false);
  }, []);

  useEffect(() => {
    let resizeTimer;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setShowSidebar(!mobile);
        if (mobile) setCollapsed(false);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    collapsed,
    setCollapsed,
    isMobile,
    showSidebar,
    setShowSidebar,
  };
}
