'use client';

import { useTranslation } from '@/components/language-provider';
import { LanguageToggle } from '@/components/language-toggle';

export function Header() {
  const t = useTranslation();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {t('header.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('header.subtitle')}
          </p>
        </div>
        <LanguageToggle />
      </div>
    </header>
  );
}
