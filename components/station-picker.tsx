'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useTranslation } from '@/components/language-provider';
import { POPULAR_STATIONS, stationPath } from '@/lib/stations';
import type { StationSearchResult } from '@/lib/locations';
import { cn } from '@/lib/utils';

export function StationPicker() {
  const t = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/locations?q=${encodeURIComponent(q.trim())}`
      );
      if (res.ok) {
        setResults(await res.json());
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        search(query);
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div className="space-y-8">
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder={t('home.searchPlaceholder')}
            className="h-12 rounded-2xl pl-10 text-base"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open && results.length > 0}
          />
        </div>

        {open && query.trim().length >= 2 && (
          <ul
            className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-border bg-card py-1 shadow-xl"
            role="listbox"
          >
            {loading && (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                {t('home.searching')}
              </li>
            )}
            {!loading && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                {t('home.searchEmpty')}
              </li>
            )}
            {!loading &&
              results.map((station) => (
                <li key={station.id} role="option">
                  <Link
                    href={stationPath(station.id, station.name)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <span className="font-medium">{station.name}</span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t('home.popularTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {POPULAR_STATIONS.map((station) => (
            <Link
              key={station.id}
              href={stationPath(station.id, station.name)}
              className={cn(
                'group flex flex-col rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm transition-all',
                'hover:border-primary/40 hover:bg-accent/60 hover:shadow-md'
              )}
            >
              <span className="font-semibold text-foreground group-hover:text-primary">
                {station.name}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {station.region}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
