/**
 * Direct Deutsche Bahn access via db-vendo-client (dbweb profile).
 * Supports stopovers on departure boards — same data source as v6.db.transport.rest.
 */

import { createClient } from 'db-vendo-client';
import { profile as dbwebProfile } from 'db-vendo-client/p/dbweb/index.js';
import type { Departure, Product, Stopover } from '@/types';

const USER_AGENT = 'wo2go/0.1 (+https://wo2go.vercel.app)';

type VendoStop = {
  id: string;
  name: string;
  type?: string;
};

type VendoStopover = {
  stop: VendoStop | null;
  arrival: Date | string | null;
  arrivalDelay?: number | null;
  departure?: Date | string | null;
  departureDelay?: number | null;
};

type VendoDeparture = {
  tripId: string;
  stop: VendoStop;
  when: Date | string | null;
  plannedWhen: Date | string | null;
  direction: string | null;
  line: {
    id: string;
    name: string;
    product: string;
    mode: string;
  } | null;
  stopovers?: VendoStopover[];
  nextStopovers?: VendoStopover[];
};

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    client = createClient(dbwebProfile, USER_AGENT, { enrichStations: false });
  }
  return client;
}

function toIso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapStopover(raw: VendoStopover): Stopover | null {
  if (!raw.stop?.id || !raw.stop?.name) return null;
  return {
    stop: {
      id: raw.stop.id,
      name: raw.stop.name,
      type: raw.stop.type ?? 'station',
    },
    arrival: toIso(raw.arrival),
    arrivalDelay: raw.arrivalDelay ?? null,
    departure: toIso(raw.departure ?? null),
    departureDelay: raw.departureDelay ?? null,
  };
}

function mapDeparture(raw: VendoDeparture): Departure | null {
  if (!raw.tripId || !raw.stop?.id) return null;

  const rawStopovers = raw.stopovers ?? raw.nextStopovers ?? [];
  const stopovers = rawStopovers
    .map(mapStopover)
    .filter((s): s is Stopover => s !== null);

  return {
    tripId: raw.tripId,
    stop: { id: raw.stop.id, name: raw.stop.name },
    when: toIso(raw.when),
    plannedWhen: toIso(raw.plannedWhen),
    direction: raw.direction,
    line: raw.line
      ? {
          id: raw.line.id,
          name: raw.line.name,
          product: raw.line.product as Product,
          mode: raw.line.mode,
        }
      : null,
    stopovers: stopovers.length > 0 ? stopovers : undefined,
  };
}

/**
 * Fetches one time window of departures via db-vendo-client.
 * Returns null when the upstream blocks or errors (caller may fall back to REST).
 */
export async function fetchDeparturesChunkVendo(
  stationId: string,
  when: Date,
  durationMinutes: number,
  results: number
): Promise<Departure[] | null> {
  try {
    const { departures } = await getClient().departures(stationId, {
      when,
      duration: durationMinutes,
      results,
      stopovers: true,
      remarks: false,
      linesOfStops: false,
      includeRelatedStations: false,
    });

    return (departures as VendoDeparture[])
      .map(mapDeparture)
      .filter((d): d is Departure => d !== null);
  } catch {
    return null;
  }
}
