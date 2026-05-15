'use client';

import { useTranslation } from '@/components/language-provider';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const t = useTranslation();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Separator className="mb-4" />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <p>
            {t('footer.builtBy')}{' '}
            <a
              href="https://github.com/zzaaid03"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Zaid Jarrar
            </a>
          </p>
          <p>
            {t('footer.dataSource')}{' '}
            <a
              href="https://v6.db.transport.rest"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              v6.db.transport.rest
            </a>
          </p>
          <p>
            {t('footer.inspiration')}{' '}
            <a
              href="https://github.com/juliuste/direkt.bahn.guru"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              direkt.bahn.guru
            </a>
            {' · '}
            <a
              href="https://www.chronotrains.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Chronotrains
            </a>
            {' · '}
            <a
              href="https://github.com/felix-geoloek/station_reach"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              station_reach
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
