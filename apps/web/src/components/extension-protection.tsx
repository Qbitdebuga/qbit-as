'use client';

import React, { useEffect } from 'react';
import { protectFromExtensionErrors } from '@/utils/extension-protection';

/**
 * Client component wrapper that applies protection against browser extension errors
 */
export function ExtensionProtection({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    protectFromExtensionErrors();
  }, []);

  return <>{children}</>;
}
