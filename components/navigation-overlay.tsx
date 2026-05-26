"use client";

import { useEffect, useState } from 'react';
import { TrainLoader } from '@/components/train-loader';

export function NavigationOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const id = sessionStorage.getItem('wo2go.navigatingTo');
      if (id) setVisible(true);
    } catch {}

    let observer: MutationObserver | null = null;
    const main = typeof document !== 'undefined' ? document.querySelector('main') : null;
    const checkAndHide = (): boolean => {
      try {
        if (!main) return false;
        const otherChildren = Array.from(main.children).filter((c) => c.id !== 'wo2go-server-overlay');
        if (otherChildren.length > 0) {
          setVisible(false);
          try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
          window.dispatchEvent(new Event('wo2go:navigated'));
          return true;
        }
        if ((main.innerText || '').trim().length > 30) {
          setVisible(false);
          try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
          window.dispatchEvent(new Event('wo2go:navigated'));
          return true;
        }
      } catch {}
      return false;
    };

    if (!checkAndHide()) {
      try {
        observer = new MutationObserver(() => {
          if (checkAndHide() && observer) {
            observer.disconnect();
            observer = null;
          }
        });
        observer.observe(main || document.body, { childList: true, subtree: true, characterData: true });
      } catch {}
    }

    function onStart() { setVisible(true); }
    function onStop() { setVisible(false); }

    window.addEventListener('wo2go:navigate', onStart as EventListener);
    window.addEventListener('wo2go:navigated', onStop as EventListener);
    return () => {
      window.removeEventListener('wo2go:navigate', onStart as EventListener);
      window.removeEventListener('wo2go:navigated', onStop as EventListener);
      if (observer) { observer.disconnect(); observer = null; }
    };
  }, []);

  if (!visible) return null;

  return (
    <div id="wo2go-nav-overlay" data-wo2go-nav-overlay className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20">
      <div className="pointer-events-auto">
        <TrainLoader size={180} />
      </div>
    </div>
  );
}
