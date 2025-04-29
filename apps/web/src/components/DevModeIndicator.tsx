'use client';

import { useEffect, useState } from 'react';
import { DEV_MODE } from '@qbit/auth-common/src/config';

/**
 * DevModeIndicator - A visual indicator that appears only in development mode
 * 
 * This component renders a small visual indicator in the corner of the screen
 * when the application is running in development mode. It helps developers
 * quickly identify when they're working with a development environment.
 */
export default function DevModeIndicator() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show after hydration to avoid SSR mismatch
    setIsVisible(DEV_MODE);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center bg-yellow-500 text-black px-3 py-1 rounded-md shadow-lg font-medium text-sm">
      <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-red-600"></span>
      DEV MODE
    </div>
  );
} 