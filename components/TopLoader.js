'use client';

import { createContext, useContext, useRef, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingBar from 'react-top-loading-bar';

const LoadingBarContext = createContext();

export function LoadingBarProvider({ children }) {
  const loadingBarRef = useRef(null);

  const startLoading = () => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart();
    }
  };

  const completeLoading = () => {
    if (loadingBarRef.current) {
      loadingBarRef.current.complete();
    }
  };

  return (
    <LoadingBarContext.Provider value={{ startLoading, completeLoading }}>
      <LoadingBar color="#8b5cf6" ref={loadingBarRef} height={3} shadow={true} />
      <Suspense fallback={null}>
        <NavigationEvents />
      </Suspense>
      {children}
    </LoadingBarContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingBarContext);
  if (!context) {
    // Return safe no-op functions if used outside provider
    return {
      startLoading: () => {},
      completeLoading: () => {}
    };
  }
  return context;
}

function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, completeLoading } = useLoading();

  // Complete loading bar on pathname or query updates
  useEffect(() => {
    completeLoading();
  }, [pathname, searchParams, completeLoading]);

  // Intercept all local link clicks to start loading bar
  useEffect(() => {
    const handleAnchorClick = (event) => {
      const target = event.target.closest('a');
      if (
        target &&
        target.href &&
        target.target !== '_blank' &&
        target.hostname === window.location.hostname
      ) {
        const targetPath = target.pathname + target.search + target.hash;
        const currentPath = window.location.pathname + window.location.search + window.location.hash;

        // Only start loader if navigating to a different internal path
        if (targetPath !== currentPath && !target.hasAttribute('download')) {
          startLoading();
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [startLoading]);

  return null;
}
