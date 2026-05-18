'use client';

/**
 * Error boundary for the app.
 *
 * Next.js App Router requirement: error.tsx MUST be a Client Component
 * ('use client'). It receives `error` and `reset` props automatically.
 * Calling reset() re-renders the route segment, retrying the server fetch.
 */

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/language-provider';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslation();

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <p className="text-sm font-medium">{t('error.title')}</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {t('error.subtitle')}
      </p>
      <Button variant="outline" size="sm" onClick={() => reset()}>
        {t('error.retry')}
      </Button>
    </main>
  );
}
