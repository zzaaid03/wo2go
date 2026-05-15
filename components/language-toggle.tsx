'use client';

/**
 * A compact DE / EN language switcher pill.
 * Sits in the header. Reads and writes language via the LanguageProvider context.
 */

import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex rounded-md border border-border text-xs font-medium">
      <button
        onClick={() => setLanguage('de')}
        aria-label="Deutsch"
        className={cn(
          'h-8 rounded-l-md px-3 transition-colors',
          language === 'de'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        )}
      >
        DE
      </button>
      <button
        onClick={() => setLanguage('en')}
        aria-label="English"
        className={cn(
          'h-8 rounded-r-md px-3 transition-colors',
          language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        )}
      >
        EN
      </button>
    </div>
  );
}
