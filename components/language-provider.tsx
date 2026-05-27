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

    // Apply red+black theme at runtime, respecting the active `dark` class if present.
    try {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      if (isDark) {
        root.style.setProperty('--background', '#0b0b0b');
        root.style.setProperty('--foreground', '#f8fafc');
        root.style.setProperty('--card', '#0f0f10');
        root.style.setProperty('--card-foreground', '#f8fafc');
        root.style.setProperty('--popover', '#0f0f10');
        root.style.setProperty('--popover-foreground', '#f8fafc');
        root.style.setProperty('--primary', '#b91c1c');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', '#2b0f0f');
        root.style.setProperty('--secondary-foreground', '#f8fafc');
        root.style.setProperty('--muted', '#0f0f10');
        root.style.setProperty('--muted-foreground', '#cbd5e1');
        root.style.setProperty('--accent', '#ef4444');
        root.style.setProperty('--accent-foreground', '#0b0b0b');
        root.style.setProperty('--destructive', '#ef4444');
        root.style.setProperty('--border', '#1f1f1f');
        root.style.setProperty('--input', '#141414');
        root.style.setProperty('--ring', '#b91c1c');
        root.style.setProperty('--sidebar', '#0b0b0b');
        root.style.setProperty('--sidebar-foreground', '#f8fafc');
        root.style.setProperty('--sidebar-primary', '#b91c1c');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', '#2b0f0f');
        root.style.setProperty('--sidebar-accent-foreground', '#f8fafc');
        root.style.setProperty('--sidebar-border', '#1f1f1f');
        root.style.setProperty('--sidebar-ring', '#b91c1c');
      } else {
        root.style.setProperty('--background', '#fffafa');
        root.style.setProperty('--foreground', '#0b0b0b');
        root.style.setProperty('--card', '#ffffff');
        root.style.setProperty('--card-foreground', '#0b0b0b');
        root.style.setProperty('--popover', '#ffffff');
        root.style.setProperty('--popover-foreground', '#0b0b0b');
        root.style.setProperty('--primary', '#b91c1c');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', '#fff5f5');
        root.style.setProperty('--secondary-foreground', '#7f1d1d');
        root.style.setProperty('--muted', '#f4f4f5');
        root.style.setProperty('--muted-foreground', '#6b7280');
        root.style.setProperty('--accent', '#ef4444');
        root.style.setProperty('--accent-foreground', '#ffffff');
        root.style.setProperty('--destructive', '#ef4444');
        root.style.setProperty('--border', '#eeeaea');
        root.style.setProperty('--input', '#ffffff');
        root.style.setProperty('--ring', '#b91c1c');
        root.style.setProperty('--sidebar', '#fffafa');
        root.style.setProperty('--sidebar-foreground', '#0b0b0b');
        root.style.setProperty('--sidebar-primary', '#b91c1c');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', '#fff5f5');
        root.style.setProperty('--sidebar-accent-foreground', '#7f1d1d');
        root.style.setProperty('--sidebar-border', '#eeeaea');
        root.style.setProperty('--sidebar-ring', '#b91c1c');
      }
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
