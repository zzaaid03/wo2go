'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useTranslation } from '@/components/language-provider';

interface StationPageHeaderProps {
  stationName: string;
}

export function StationPageHeader({ stationName }: StationPageHeaderProps) {
  const t = useTranslation();

  return (
    <div className="mb-6 space-y-3">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('station.back')}
      </Link>
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t('station.from')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {stationName}
        </h1>
      </div>
    </div>
  );
}
