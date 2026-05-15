/**
 * Client for v6.db.transport.rest — the public Deutsche Bahn transport API.
 *
 * No API key required. Public CORS. Free with rate limits.
 * Reference: https://v6.db.transport.rest/api.html
 *
 * API behaviour note (verified):
 * The /stops/{id}/departures endpoint with `stopovers=true` returns
 * intermediate stops for each trip in a single call. This lets us
 * determine all reachable destinations without fetching individual trips.
 */

import { Departure } from '@/types';

const BASE_URL = 'https://v6.db.transport.rest';

/** Verified station ID for Saarbrücken Hbf */
export const SAARBRUCKEN_HBF_ID = '8000323';

/**
 * Fetches all departures from a station for the next 12 hours.
 *
 * Uses `stopovers=true` so each departure includes intermediate stops,
 * letting us build the full destination list from a single API call.
 *
 * The fetch uses Next.js revalidation (60s) to cache the response
 * and avoid hammering the upstream API on every page load.
 */
export async function getDepartures(stationId: string): Promise<Departure[]> {
  const params = new URLSearchParams({
    duration: '720',        // 12 hours in minutes
    results: '1000',        // large number; API will cap at its own limit
    stopovers: 'true',      // include intermediate stops per trip
    remarks: 'false',       // skip remarks to reduce payload
    linesOfStops: 'false',  // skip per-stop line info
  });

  const url = `${BASE_URL}/stops/${stationId}/departures?${params}`;

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 60s — fresh enough, Vercel-friendly
  });

  if (!response.ok) {
    throw new Error(
      `DB API returned ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();

  // The API returns an object with a `departures` array,
  // or directly an array depending on the version. Handle both.
  return Array.isArray(data) ? data : data.departures ?? [];
}
