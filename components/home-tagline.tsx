'use client';

import { useTranslation } from '@/components/language-provider';

export function HomeTagline() {
  const t = useTranslation();

  return (
    <p className="max-w-md text-base text-muted-foreground sm:text-lg">
      {t('home.tagline')}
    </p>
  );
}
