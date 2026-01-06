'use client';

import { useEffect } from 'react';

/**
 * BfcacheHandler - Handles browser back/forward cache to prevent stale content
 * 
 * Safari and other modern browsers use bfcache to restore pages from cache when
 * navigating back/forward. This can cause issues with dynamic content and auth state.
 * This component detects when a page is loaded from cache and forces a reload.
 */
export function BfcacheHandler() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // Check if page was loaded from bfcache (persisted state)
      if (event.persisted) {
        // Force a reload to get fresh content
        window.location.reload();
      }
    };

    // Listen for pageshow event
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
