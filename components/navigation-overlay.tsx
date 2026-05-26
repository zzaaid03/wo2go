"use client";

import { useEffect, useState } from 'react';
import { TrainLoader } from '@/components/train-loader';

export function NavigationOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const id = sessionStorage.getItem('wo2go.navigatingTo');
      if (id) setVisible(true);
    } catch {
      // ignore
    }

    function onStart() {
      setVisible(true);
    }
    function onStop() {
      setVisible(false);
    }

    window.addEventListener('wo2go:navigate', onStart as EventListener);
    window.addEventListener('wo2go:navigated', onStop as EventListener);
    return () => {
      window.removeEventListener('wo2go:navigate', onStart as EventListener);
      window.removeEventListener('wo2go:navigated', onStop as EventListener);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20">
      <div className="pointer-events-auto">
        <TrainLoader size={180} />
      </div>
    </div>
  );
}
