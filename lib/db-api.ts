/**
 * Fetches DB departures for wo2go.
 *
 * Primary: db-vendo-client (dbweb profile) — calls Deutsche Bahn directly.
 * Fallback: v6.db.transport.rest — public REST proxy of the same data.
 *
 * Both use chunked 2-hour windows over 12 hours to stay within rate limits.
 */

import { Departure } from '@/types';
import { fetchDeparturesChunkVendo } from '@/lib/db-vendo';
import { promises as fs } from 'fs';
import path from 'path';

const REST_BASE_URL = 'https://v6.db.transport.rest';

const TOTAL_DURATION_MINUTES = 720; // 12 hours
const CHUNK_DURATION_MINUTES = 120; // 2 hours per request
const RESULTS_PER_CHUNK = 100;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;
const CHUNK_DELAY_MS = 400;

const REST_FETCH_OPTIONS: RequestInit = {
  next: { revalidate: 60 },
  headers: {
    'User-Agent': 'wo2go/0.1 (+https://wo2go.vercel.app)',
    Accept: 'application/json',
  },
};

// Simple in-memory cache for aggregated departures to reduce API chattiness.
// Keyed by stationId and cached for a short TTL because results are time-sensitive.
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const departuresCache = new Map<
  string,
  { expires: number; data: Departure[] }
>();

const DISK_CACHE_DIR = path.join(process.cwd(), 'data', 'departures-cache');

export function clearDeparturesCache(stationId?: string) {
  if (stationId) departuresCache.delete(stationId);
  else departuresCache.clear();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRestDepartures(data: unknown): Departure[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'departures' in data) {
    const departures = (data as { departures?: Departure[] }).departures;
    return departures ?? [];
  }
  return [];
}

async function fetchDeparturesChunkRest(
  stationId: string,
  when: Date,
  durationMinutes: number
): Promise<Departure[]> {
  const params = new URLSearchParams({
    when: when.toISOString(),
    duration: String(durationMinutes),
    results: String(RESULTS_PER_CHUNK),
    stopovers: 'true',
    remarks: 'false',
    linesOfStops: 'false',
    includeRelatedStations: 'false',
  });

  const url = `${REST_BASE_URL}/stops/${stationId}/departures?${params}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(url, REST_FETCH_OPTIONS);

    if (response.ok) {
      const data = await response.json();
      return parseRestDepartures(data);
    }

    lastError = new Error(
      `DB API returned ${response.status}: ${response.statusText}`
    );

    if (response.status === 503 && attempt < MAX_RETRIES - 1) {
      await sleep(RETRY_BASE_MS * (attempt + 1));
      continue;
    }

    throw lastError;
  }

  throw lastError ?? new Error('DB API request failed');
}

async function fetchDeparturesChunk(
  stationId: string,
  when: Date,
  durationMinutes: number
): Promise<Departure[]> {
  const vendo = await fetchDeparturesChunkVendo(
    stationId,
    when,
    durationMinutes,
    RESULTS_PER_CHUNK
  );
  if (vendo !== null) return vendo;

  return fetchDeparturesChunkRest(stationId, when, durationMinutes);
}

/**
 * Fast-path: fetch only the first chunk (next `CHUNK_DURATION_MINUTES`) or
 * return cached data if available. Returns `{ departures, cached }` where
 * `cached` indicates we returned from in-memory cache (full dataset).
 */
export async function getDeparturesFast(
  stationId: string
): Promise<{ departures: Departure[]; cached: boolean }> {
  const cacheKey = stationId;
  const nowMs = Date.now();
  const cached = departuresCache.get(cacheKey);
  if (cached && cached.expires > nowMs) {
    return { departures: JSON.parse(JSON.stringify(cached.data)) as Departure[], cached: true };
  }

  // Check disk cache for a snapshot (fast fallback across server restarts)
  try {
    const filePath = path.join(DISK_CACHE_DIR, `${cacheKey}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as { expires?: number; data?: Departure[] };
    if (parsed && parsed.data && (!parsed.expires || parsed.expires > Date.now())) {
      // populate in-memory cache for future fast hits
      departuresCache.set(cacheKey, { expires: parsed.expires ?? Date.now() + CACHE_TTL_MS, data: parsed.data });
      return { departures: JSON.parse(JSON.stringify(parsed.data)) as Departure[], cached: true };
    }
  } catch {
    // ignore read errors — fall through to fetching a fast chunk
  }

  // Otherwise fetch just the first chunk (next CHUNK_DURATION_MINUTES)
  const when = new Date();
  const deps = await fetchDeparturesChunk(stationId, when, CHUNK_DURATION_MINUTES);
  return { departures: deps, cached: false };
}

/**
 * Fetches all departures from a station for the next 12 hours.
 * Each departure includes stopovers for destination aggregation.
 */
export async function getDepartures(stationId: string): Promise<Departure[]> {
  // Return cached aggregate if fresh.
  const cacheKey = stationId;
  const nowMs = Date.now();
  const cached = departuresCache.get(cacheKey);
  if (cached && cached.expires > nowMs) {
    return JSON.parse(JSON.stringify(cached.data)) as Departure[];
  }
  const now = new Date();
  const seenTripIds = new Set<string>();
  const all: Departure[] = [];

  const chunkCount = Math.ceil(TOTAL_DURATION_MINUTES / CHUNK_DURATION_MINUTES);

  // Controlled concurrency fetch: fetch up to CONCURRENCY chunks in parallel
  const CONCURRENCY = 2;
  const indexes = Array.from({ length: chunkCount }, (_, i) => i);

  try {
    for (let i = 0; i < indexes.length; i += CONCURRENCY) {
      const batch = indexes.slice(i, i + CONCURRENCY);
      const promises = batch.map((idx) => {
        const when = new Date(now.getTime() + idx * CHUNK_DURATION_MINUTES * 60_000);
        return fetchDeparturesChunk(stationId, when, CHUNK_DURATION_MINUTES);
      });

      const results = await Promise.all(promises);

      for (const departures of results) {
        for (const dep of departures) {
          if (dep.tripId) {
            if (seenTripIds.has(dep.tripId)) continue;
            seenTripIds.add(dep.tripId);
          }
          all.push(dep);
        }
      }

      // small pause between batches to be polite to upstream APIs
      if (i + CONCURRENCY < indexes.length) await sleep(CHUNK_DELAY_MS);
    }

    // Cache a shallow-serializable copy for the TTL window.
    departuresCache.set(cacheKey, {
      expires: Date.now() + CACHE_TTL_MS,
      data: JSON.parse(JSON.stringify(all)) as Departure[],
    });

    // Persist to disk so subsequent cold starts can return instant snapshots.
    try {
      await fs.mkdir(DISK_CACHE_DIR, { recursive: true });
      const filePath = path.join(DISK_CACHE_DIR, `${cacheKey}.json`);
      await fs.writeFile(
        filePath,
        JSON.stringify({ expires: Date.now() + CACHE_TTL_MS, data: JSON.parse(JSON.stringify(all)) })
      );
    } catch (e) {
      // non-fatal — don't break the response on disk write failures
      // eslint-disable-next-line no-console
      console.warn('Failed to write departures disk cache', e);
    }

    return all;
  } catch (err) {
    // On error, if we have stale cached data, return it instead of throwing so the
    // UI can show something useful. Otherwise rethrow to surface the error.
    if (cached) {
      return JSON.parse(JSON.stringify(cached.data)) as Departure[];
    }
    throw err;
  }
}
