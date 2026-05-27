'use client';

/**
 * Language context provider for the app.
 *
 * This is a Client Component because it uses useState and useEffect
 * for managing language state and localStorage persistence.
 * It wraps the entire app in layout.tsx, forming the client boundary.
 *
 * Provides two hooks:
 *  - useLanguage(): { language, setLanguage } — for the toggle
 *  - useTranslation(): t(key) — for translating UI strings
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { NavigationOverlay } from '@/components/navigation-overlay';
import {
  dictionaries,
  type Language,
  type TranslationKey,
} from '@/lib/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'wo2go-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with the server-default language so the initial client render
  // matches the server HTML. Hydrate the user's saved preference after
  // mount to avoid hydration mismatches.
  const [language, setLanguageState] = useState<Language>('de');

  // Persist language changes to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };
  // Remove any server-rendered overlay early on client mount to avoid a stale
  // 'loading' state if client hydration or the client loader fails to run.
  useEffect(() => {
    try {
      const el = typeof document !== 'undefined' ? document.getElementById('wo2go-server-overlay') : null;
      if (el) {
        console.info('[LanguageProvider] removing server overlay on client mount');
        el.remove();
        try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
        window.dispatchEvent(new Event('wo2go:navigated'));
      }
    } catch {}

    // Ensure our warm palette is applied at runtime. Some build-time CSS
    // can override variables; set them inline to guarantee the desired look
    // on the client immediately.
    try {
      const root = document.documentElement;
      root.style.setProperty('--background', '#fff7f0');
      root.style.setProperty('--foreground', '#0f1720');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#0f1720');
      root.style.setProperty('--popover', '#ffffff');
      root.style.setProperty('--popover-foreground', '#0f1720');
      root.style.setProperty('--primary', '#b45309');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', '#fef3c7');
      root.style.setProperty('--secondary-foreground', '#92400e');
      root.style.setProperty('--muted', '#f7f7f7');
      root.style.setProperty('--muted-foreground', '#6b7280');
      root.style.setProperty('--accent', '#059669');
      root.style.setProperty('--accent-foreground', '#ffffff');
      root.style.setProperty('--destructive', '#ef4444');
      root.style.setProperty('--border', '#e7e6e1');
      root.style.setProperty('--input', '#ffffff');
      root.style.setProperty('--ring', '#b45309');
      root.style.setProperty('--sidebar', '#fffaf0');
      root.style.setProperty('--sidebar-foreground', '#0f1720');
      root.style.setProperty('--sidebar-primary', '#b45309');
      root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
      root.style.setProperty('--sidebar-accent', '#fef3c7');
      root.style.setProperty('--sidebar-accent-foreground', '#92400e');
      root.style.setProperty('--sidebar-border', '#e7e6e1');
      root.style.setProperty('--sidebar-ring', '#b45309');
    } catch {}

    // Hydrate language from localStorage after mount to avoid differing
    // server/client HTML when the user previously selected a different
    // language.
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored === 'de' || stored === 'en') {
        setLanguageState(stored as Language);
      }
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <NavigationOverlay />
      {children}
    </LanguageContext.Provider>
  );
}

/** Returns the current language and a setter to change it. */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

/** Returns a translation function that looks up keys in the current language's dictionary. */
export function useTranslation(): (key: TranslationKey) => string {
  const { language } = useLanguage();
  return (key: TranslationKey) => dictionaries[language][key];
}
