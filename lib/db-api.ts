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
 * Fetches all departures from a station for the next 12 hours.
 * Each departure includes stopovers for destination aggregation.
 */
export async function getDepartures(stationId: string): Promise<Departure[]> {
  const now = new Date();
  const seenTripIds = new Set<string>();
  const all: Departure[] = [];

  const chunkCount = Math.ceil(
    TOTAL_DURATION_MINUTES / CHUNK_DURATION_MINUTES
  );

  for (let i = 0; i < chunkCount; i++) {
    if (i > 0) {
      await sleep(CHUNK_DELAY_MS);
    }

    const when = new Date(
      now.getTime() + i * CHUNK_DURATION_MINUTES * 60_000
    );
    const departures = await fetchDeparturesChunk(
      stationId,
      when,
      CHUNK_DURATION_MINUTES
    );

    for (const dep of departures) {
      if (dep.tripId) {
        if (seenTripIds.has(dep.tripId)) continue;
        seenTripIds.add(dep.tripId);
      }
      all.push(dep);
    }
  }

  return all;
}
