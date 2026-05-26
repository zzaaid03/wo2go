"use client";

import { useEffect, useState, useRef } from 'react';
import { TrainLoader } from '@/components/train-loader';

export function NavigationOverlay() {
  const [visible, setVisible] = useState(false);
  const autoHideTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const id = sessionStorage.getItem('wo2go.navigatingTo');
      if (id) {
        console.debug('[NavigationOverlay] initial navigatingTo:', id);
        setVisible(true);
      }
    } catch {
      // ignore
    }

    function onStart() {
      console.debug('[NavigationOverlay] navigate event received');
      setVisible(true);
    }
    function onStop() {
      console.debug('[NavigationOverlay] navigated event received');
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
