'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useTranslation } from '@/components/language-provider';
import { POPULAR_STATIONS, stationPath } from '@/lib/stations';
import type { StationSearchResult } from '@/lib/locations';
import { cn } from '@/lib/utils';

interface StationPickerProps {
  onNavigate?: (url: string) => void;
}

export function StationPicker({ onNavigate }: StationPickerProps) {
  const t = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StationSearchResult[]>([]);
  type LocalStation = StationSearchResult & { norm: string };
  const [localIndex, setLocalIndex] = useState<LocalStation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [upstreamDown, setUpstreamDown] = useState(false);
  const [fastProbeDone, setFastProbeDone] = useState(false);
  const [notifyUpstreamOnSelect, setNotifyUpstreamOnSelect] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryTimerRef = useRef<number | null>(null);
  const prefetchRef = useRef<Record<string, boolean>>({});

  const prefetchDepartures = useCallback((id: string) => {
    if (prefetchRef.current[id]) return;
    prefetchRef.current[id] = true;
    // fire-and-forget to populate server cache
    fetch(`/api/departures?stationId=${encodeURIComponent(id)}`)
      .then(() => {})
      .catch(() => {});
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    try {
      // If a local index is available, search client-side for instant results
      if (localIndex) {
        const qNorm = q.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

        const prefix = localIndex.filter((s) => s.norm.startsWith(qNorm));
        const contains = localIndex.filter((s) => !s.norm.startsWith(qNorm) && s.norm.includes(qNorm));
        const matches = prefix.concat(contains).slice(0, 8);

        setResults(matches);
        setUpstreamDown(false);
        setActiveIndex(-1);
        return;
      }

      const res = await fetch(`/api/locations?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const json = await res.json();
        // API returns { results, upstreamDown }
        if (Array.isArray(json)) {
          setResults(json);
          setUpstreamDown(false);
        } else {
          setResults(json.results ?? []);
          setUpstreamDown(Boolean(json.upstreamDown));
        }
        setActiveIndex(-1);
      } else {
        setResults([]);
        setActiveIndex(-1);
        setUpstreamDown(true);
      }
    } catch {
      setResults([]);
      setActiveIndex(-1);
      setUpstreamDown(true);
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

  // Load the public stations index once on mount for fast client-side searches
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cached = sessionStorage.getItem('wo2go.stations');
        if (cached) {
          const parsed: LocalStation[] = JSON.parse(cached);
          if (!cancelled) setLocalIndex(parsed);
          return;
        }

        const res = await fetch('/stations-index.json');
        if (!res.ok) return;
        const data = await res.json();
        const normalized: LocalStation[] = (data as any[]).map((s) => ({
          id: s.id,
          name: s.name,
          source: 'local' as const,
          norm: String(s.name).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(),
        }));
        sessionStorage.setItem('wo2go.stations', JSON.stringify(normalized));
        if (!cancelled) setLocalIndex(normalized);
      } catch {
        // ignore — will fallback to server API
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Background upstream health probe (runs once on mount and updates every 15s)
  useEffect(() => {
    let cancelled = false;
    async function probe() {
      try {
        const cached = sessionStorage.getItem('wo2go.upstream');
        if (cached) {
          const parsed = JSON.parse(cached) as { upstreamDown: boolean; ts: number };
          // respect cached value for 15s
          if (Date.now() - parsed.ts < 15000) {
            setUpstreamDown(parsed.upstreamDown);
            setFastProbeDone(true);
            return;
          }
        }

        const res = await fetch('/api/upstream');
        if (!res.ok) throw new Error('probe-failed');
        const json = await res.json();
        if (!cancelled) {
          setUpstreamDown(Boolean(json.upstreamDown));
          setFastProbeDone(true);
          sessionStorage.setItem('wo2go.upstream', JSON.stringify({ upstreamDown: Boolean(json.upstreamDown), ts: Date.now() }));
        }
      } catch {
        if (!cancelled) {
          setUpstreamDown(true);
          setFastProbeDone(true);
        }
      }
    }

    probe();
    const id = window.setInterval(() => probe(), 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // When upstream is down, poll occasionally to detect recovery
  useEffect(() => {
    if (!upstreamDown) {
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      return;
    }

    // poll every 10s
    if (!retryTimerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      retryTimerRef.current = window.setInterval(() => {
        if (query.trim().length >= 2) search(query);
      }, 10000);
    }

    return () => {
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [upstreamDown, query, search]);

  

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

  // Auto-hide the upstream-notice shown at selection
  useEffect(() => {
    if (!notifyUpstreamOnSelect) return;
    const id = window.setTimeout(() => setNotifyUpstreamOnSelect(false), 2000);
    return () => clearTimeout(id);
  }, [notifyUpstreamOnSelect]);

  return (
    <div className="space-y-8">
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          {notifyUpstreamOnSelect && (
            <div className="absolute left-0 right-0 -bottom-10 z-30 px-3">
              <div className="rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 text-center">
                {t('error.subtitle')}
              </div>
            </div>
          )}
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onKeyDown={(e) => {
              if (!open) {
                if (e.key === 'ArrowDown' && results.length > 0) {
                  e.preventDefault();
                  setOpen(true);
                  setActiveIndex(0);
                }
                return;
              }

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeIndex >= 0 && results[activeIndex]) {
                  const sel = results[activeIndex];
                  setQuery(sel.name);
                  setOpen(false);
                  // If we've probed and upstream is down, show immediate notice
                  if (fastProbeDone && upstreamDown) {
                    setNotifyUpstreamOnSelect(true);
                    setTimeout(() => {
                      if (onNavigate) onNavigate(stationPath(sel.id, sel.name));
                      else window.location.href = stationPath(sel.id, sel.name);
                    }, 700);
                  } else {
                    try {
                      if (onNavigate) {
                        onNavigate(stationPath(sel.id, sel.name));
                      } else {
                        // use href assignment in the real browser
                        // eslint-disable-next-line no-param-reassign
                        // @ts-ignore
                        window.location.href = stationPath(sel.id, sel.name);
                      }
                    } catch {
                      // ignore in non-browser test envs
                    }
                  }
                }
              } else if (e.key === 'Escape') {
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
            aria-activedescendant={
              activeIndex >= 0 && results[activeIndex]
                ? `station-option-${results[activeIndex].id}`
                : undefined
            }
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
            {upstreamDown && (
              <li className="px-3 py-2">
                <div
                  role="status"
                  className="rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>{t('error.subtitle')}</div>
                    <div className="flex-shrink-0">
                      <button
                        className="ml-3 rounded-md bg-yellow-600 px-3 py-1 text-sm text-white"
                        onClick={() => search(query)}
                      >
                        {t('error.retry')}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )}
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
              results.map((station, idx) => (
                <li
                  key={station.id}
                  id={`station-option-${station.id}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  <Link
                    href={stationPath(station.id, station.name)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm',
                      activeIndex === idx ? 'bg-accent/40' : 'hover:bg-accent'
                    )}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => prefetchDepartures(station.id)}
                    onFocus={() => prefetchDepartures(station.id)}
                  >
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <span className="font-medium">{station.name}</span>
                    {station.source === 'local' && (
                      <span className="ml-2 text-[11px] text-muted-foreground">
                        {t('home.suggestion')}
                      </span>
                    )}
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
              onMouseEnter={() => prefetchDepartures(station.id)}
              onFocus={() => prefetchDepartures(station.id)}
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
