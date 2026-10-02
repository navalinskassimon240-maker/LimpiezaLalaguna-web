import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;      // Celular (< 768px o dispositivo táctil de mano)
  isTablet: boolean;      // Tablet (768px a 1023px)
  isLaptop: boolean;      // Laptop (1024px a 1439px)
  isDesktop: boolean;     // Computadora de escritorio (>= 1440px)
  isComputer: boolean;    // Laptop o PC de escritorio
  hasTouch: boolean;      // Pantalla táctil
  isPhone: boolean;       // Teléfono (< 640px)
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
}

/**
 * Hook to intelligently detect whether the user is browsing on a phone (celu),
 * tablet, laptop, or desktop computer, and adapt UI accordingly.
 */
export function useDevice(): DeviceInfo {
  const getDeviceInfo = (): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isLaptop: true,
        isDesktop: false,
        isComputer: true,
        hasTouch: false,
        isPhone: false,
        orientation: 'landscape',
        screenWidth: 1200,
        screenHeight: 800,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent || '';
    
    // Check for mobile/tablet user agent hints
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent) || (navigator.maxTouchPoints > 1 && width >= 768 && width <= 1024);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let deviceType: DeviceType;
    if (width < 768 || (isMobileUA && width < 900)) {
      deviceType = 'mobile';
    } else if (width < 1024 || isTabletUA) {
      deviceType = 'tablet';
    } else if (width < 1440) {
      deviceType = 'laptop';
    } else {
      deviceType = 'desktop';
    }

    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isLaptop = deviceType === 'laptop';
    const isDesktop = deviceType === 'desktop';
    const isComputer = isLaptop || isDesktop;
    const isPhone = width < 640;
    const orientation = height >= width ? 'portrait' : 'landscape';

    return {
      deviceType,
      isMobile,
      isTablet,
      isLaptop,
      isDesktop,
      isComputer,
      hasTouch,
      isPhone,
      orientation,
      screenWidth: width,
      screenHeight: height,
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}
