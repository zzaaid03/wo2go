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
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored === 'de' || stored === 'en') return stored as Language;
    } catch {
      // ignore localStorage errors
    }
    return 'de';
  });

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
        el.remove();
        try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
        window.dispatchEvent(new Event('wo2go:navigated'));
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
