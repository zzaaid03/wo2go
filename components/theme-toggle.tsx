'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useLanguage();

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        'h-8 w-8 rounded-md border border-border flex items-center justify-center text-sm transition-colors',
        theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
      )}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

export default ThemeToggle;
