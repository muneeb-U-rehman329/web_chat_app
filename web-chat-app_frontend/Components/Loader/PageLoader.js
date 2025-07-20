'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const lastPath = useRef('');
  const loadingTimerRef = useRef([]);

  const clearAllTimers = () => {
    loadingTimerRef.current.forEach(clearTimeout);
    loadingTimerRef.current = [];
  };

  const startLoading = () => {
    clearAllTimers();
    setLoading(true);
    setProgress(0);

    loadingTimerRef.current.push(setTimeout(() => setProgress(30), 50));
    loadingTimerRef.current.push(setTimeout(() => setProgress(60), 300));
    loadingTimerRef.current.push(setTimeout(() => setProgress(85), 700));
    loadingTimerRef.current.push(setTimeout(() => stopLoading(), 1000));
  };

  const stopLoading = () => {
    clearAllTimers();
    setProgress(100);
    loadingTimerRef.current.push(
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300)
    );
  };

  useEffect(() => {
    if (pathname !== lastPath.current) {
      startLoading();
      lastPath.current = pathname;
    }

    const handleStart = () => {
      if (pathname !== lastPath.current) {
        startLoading();
      }
    };

    const handleLinkClick = (event) => {
      const target = event.target.closest('a');
      if (target && target.href) {
        const url = new URL(target.href);
        if (url.pathname !== pathname) {
          startLoading();
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
      clearAllTimers();
    };
  }, [pathname]);

  return (
    <>
      <style jsx global>{`
        .page-loader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          width: 100%;
          z-index: 9999;
          background: #f0f0f0; /* Light background for visibility */
          opacity: ${loading ? '1' : '0'};
          visibility: ${loading ? 'visible' : 'hidden'};
          transition: opacity 0.3s ease, visibility 0s linear ${loading ? '0s' : '0.3s'};
          pointer-events: none;
        }

        .progress-bar {
          height: 100%;
          background: #805ad5; /* Purple color */
          width: ${progress}%;
          transition: width 0.3s ease-out;
          box-shadow: ${progress > 0 ? '0 0 8px rgba(37, 99, 235, 0.5)' : 'none'};
        }
      `}</style>

      <div className="page-loader">
        <div className="progress-bar" />
      </div>
    </>
  );
}