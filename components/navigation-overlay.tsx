"use client";

import { useEffect, useState, useRef } from 'react';
import { TrainLoader } from '@/components/train-loader';

export function NavigationOverlay() {
  const [visible, setVisible] = useState(false);
  const autoHideTimer = useRef<number | null>(null);
  const showTimer = useRef<number | null>(null);
  const SHOW_DELAY_MS = 80;

  useEffect(() => {
    function scheduleShow() {
      try {
        if (showTimer.current) window.clearTimeout(showTimer.current);
        showTimer.current = window.setTimeout(() => {
          console.info('[NavigationOverlay] showing overlay (delayed)');
          setVisible(true);
        }, SHOW_DELAY_MS);
      } catch {}
    }

    function cancelShow() {
      try {
        if (showTimer.current) {
          window.clearTimeout(showTimer.current);
          showTimer.current = null;
        }
      } catch {}
    }

    try {
      const id = sessionStorage.getItem('wo2go.navigatingTo');
      if (id) {
        console.info('[NavigationOverlay] initial navigatingTo (delayed):', id);
        scheduleShow();
      }
    } catch {
      // ignore
    }

    // If the main content renders (server-provided or client-hydrated), hide
    // the overlay immediately. This handles race conditions where the
    // navigation event fires before the client loader mounts.
    let observer: MutationObserver | null = null;
    const main = typeof document !== 'undefined' ? document.querySelector('main') : null;
    const checkAndHide = (): boolean => {
      try {
        if (!main) return false;
        const otherChildren = Array.from(main.children).filter((c) => c.id !== 'wo2go-server-overlay');
        if (otherChildren.length > 0) {
          console.info('[NavigationOverlay] main has non-overlay children, hiding overlay');
          setVisible(false);
          try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
          window.dispatchEvent(new Event('wo2go:navigated'));
          return true;
        }
        if ((main.innerText || '').trim().length > 30) {
          console.info('[NavigationOverlay] main has text content, hiding overlay');
          setVisible(false);
          try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
          window.dispatchEvent(new Event('wo2go:navigated'));
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    };

    // Run an initial check and watch for changes if nothing yet.
    if (!checkAndHide()) {
      try {
        observer = new MutationObserver(() => {
          if (checkAndHide() && observer) {
            observer.disconnect();
            observer = null;
            // If main content appeared, cancel any pending show
            cancelShow();
          }
        });
        observer.observe(main || document.body, { childList: true, subtree: true, characterData: true });
      } catch (e) {
        // ignore
      }
    }

    function onStart() {
      console.info('[NavigationOverlay] navigate event received');
      scheduleShow();
    }
    function onStop() {
      console.info('[NavigationOverlay] navigated event received');
      cancelShow();
      setVisible(false);
    }

    window.addEventListener('wo2go:navigate', onStart as EventListener);
    window.addEventListener('wo2go:navigated', onStop as EventListener);
    return () => {
      window.removeEventListener('wo2go:navigate', onStart as EventListener);
      window.removeEventListener('wo2go:navigated', onStop as EventListener);
      if (autoHideTimer.current) {
        window.clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
      if (showTimer.current) {
        window.clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
  }, []);

  // Auto-hide fallback so overlay can't get stuck indefinitely.
  useEffect(() => {
    if (!visible) {
      if (autoHideTimer.current) {
        window.clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
      return;
    }
    autoHideTimer.current = window.setTimeout(() => {
      console.warn('[NavigationOverlay] auto-hide fallback triggered');
      try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
      window.dispatchEvent(new Event('wo2go:navigated'));
      setVisible(false);
    }, 10000);
    return () => {
      if (autoHideTimer.current) {
        window.clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div id="wo2go-nav-overlay" data-wo2go-nav-overlay className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20">
      <div className="pointer-events-auto">
        <TrainLoader size={180} />
      </div>
    </div>
  );
}
