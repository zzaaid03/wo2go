'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { DestinationsClient } from '@/components/destinations-client';
import { DeparturesClient } from '@/components/departures-client';
import { useTranslation } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { TrainLoader } from '@/components/train-loader';
import type { Destination, Departure } from '@/types';

interface Props {
  stationId: string;
  initialUpstreamDown?: boolean;
  initialDestinations?: Destination[] | null;
  initialPartial?: boolean;
}
export function DestinationsLoader({ stationId, initialUpstreamDown = false, initialDestinations = null, initialPartial = false }: Props) {
  const t = useTranslation();
  console.info('[DestinationsLoader] render', { stationId, initialUpstreamDown, initialDestinations: initialDestinations ? initialDestinations.length : null, initialPartial });
  const [loading, setLoading] = useState(initialDestinations ? false : !initialUpstreamDown);
  const [destinations, setDestinations] = useState<Destination[] | null>(
    initialDestinations ?? (initialUpstreamDown ? [] : null)
  );
  const [departures, setDepartures] = useState<Departure[] | null>(null);
  const [upstreamDown, setUpstreamDown] = useState(Boolean(initialUpstreamDown));
  const [partialAttempts, setPartialAttempts] = useState(0);
  const partialTimerRef = useRef<number | null>(null);
  const partialAttemptsRef = useRef<number>(partialAttempts);
  const failSafeRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    // clear any fail-safe timer — real loader is starting
    if (failSafeRef.current) {
      window.clearTimeout(failSafeRef.current);
      failSafeRef.current = null;
    }

    setLoading(true);
    console.info('[DestinationsLoader] load() start', { stationId, partialAttempts: partialAttemptsRef.current });
    try { sessionStorage.removeItem('wo2go.navigatingTo'); window.dispatchEvent(new Event('wo2go:navigated')); } catch {}

    try {
      const serverOverlay = document.getElementById('wo2go-server-overlay');
      if (serverOverlay) serverOverlay.remove();
      console.info('[DestinationsLoader] removed server overlay');
    } catch {}

    const controller = new AbortController();
    const FETCH_TIMEOUT = 7000;
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const res = await fetch(`/api/departures?stationId=${encodeURIComponent(stationId)}`, { signal: controller.signal });
      window.clearTimeout(timeoutId);
      if (!res.ok) throw new Error('fetch-failed');
      const json = await res.json();
      setDepartures(json.departures ?? null);
      setDestinations(json.destinations ?? []);
      setUpstreamDown(Boolean(json.upstreamDown));

      // If server returned a partial result, try reloading shortly to get the
      // full aggregated results (background fetch is started server-side).
      if ((json.partial || initialPartial) && !json.upstreamDown && partialAttemptsRef.current < 5) {
        // exponential backoff (1s, 2s, 4s...)
        const delay = 1000 * Math.pow(2, partialAttemptsRef.current);
        if (partialTimerRef.current) window.clearTimeout(partialTimerRef.current);
        // schedule an increment of the attempt counter and re-run load()
        // after `delay` ms. We keep a ref in sync so load() can read the
        // current attempt count without relying on a stale closure.
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        partialTimerRef.current = window.setTimeout(() => {
          setPartialAttempts((p) => {
            const next = p + 1;
            partialAttemptsRef.current = next;
            return next;
          });
          void load();
        }, delay);
      }
    } catch (err) {
      console.error('[DestinationsLoader] load() error', err);
      // Treat aborts/timeouts and other errors as upstream unavailability
      setDestinations([]);
      setUpstreamDown(true);
    } finally {
      try { window.clearTimeout(timeoutId); } catch {}
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    // If server already provided initial destinations, hide the global overlay
    // immediately. Otherwise, let `load()` clear the flag when it starts so
    // the overlay stays visible until the client loader takes over.
    if (initialDestinations && initialDestinations.length > 0) {
      try { sessionStorage.removeItem('wo2go.navigatingTo'); window.dispatchEvent(new Event('wo2go:navigated')); } catch {}
      return () => {
        if (partialTimerRef.current) window.clearTimeout(partialTimerRef.current);
      };
    }

    if (!initialUpstreamDown) {
      // Start a short fail-safe: if load() doesn't run quickly, clear the
      // navigating flag so the overlay won't block the UI indefinitely.
      try {
        if (failSafeRef.current) window.clearTimeout(failSafeRef.current);
        failSafeRef.current = window.setTimeout(() => {
          try { sessionStorage.removeItem('wo2go.navigatingTo'); } catch {}
          window.dispatchEvent(new Event('wo2go:navigated'));
          console.warn('[DestinationsLoader] fail-safe navigated dispatch');
        }, 1500);
      } catch {}
      load();
    } else {
      try { sessionStorage.removeItem('wo2go.navigatingTo'); window.dispatchEvent(new Event('wo2go:navigated')); } catch {}
    }

    return () => {
      if (partialTimerRef.current) window.clearTimeout(partialTimerRef.current);
      if (failSafeRef.current) {
        window.clearTimeout(failSafeRef.current);
        failSafeRef.current = null;
      }
    };
  }, [load, initialUpstreamDown, initialDestinations]);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        <TrainLoader size={140} label={t('home.searching')} />
      </div>
    );
  }

  if (upstreamDown && (!destinations || destinations.length === 0)) {
    return (
      <div className="py-8 text-center">
        <div className="mb-3 text-sm text-muted-foreground">{t('error.subtitle')}</div>
        <div>
          <Button onClick={load}>{t('error.retry')}</Button>
        </div>
      </div>
    );
  }

  // If we received raw departures from the API, prefer showing individual
  // train cards. Otherwise fall back to aggregated destinations UI.
  if (departures && departures.length > 0) {
    return <DeparturesClient departures={departures} stationId={stationId} />;
  }

  return <DestinationsClient destinations={destinations ?? []} />;
}
