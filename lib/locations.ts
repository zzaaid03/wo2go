/**
 * Station search via v6.db.transport.rest locations endpoint.
 */

export interface StationSearchResult {
  id: string;
  name: string;
  source?: 'remote' | 'local';
}

import { POPULAR_STATIONS, ALL_STATIONS } from './stations';

const BASE_URL = 'https://v6.db.transport.rest';

export async function searchStations(
  query: string,
  limit = 8
): Promise<{ results: StationSearchResult[]; upstreamDown: boolean }> {
  if (query.trim().length < 2) return { results: [], upstreamDown: false };

  // Local-first search using the bundled ALL_STATIONS index.
  const qNorm = query
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  const localMatches = ALL_STATIONS
    .filter((s) =>
      s.name
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .includes(qNorm)
    )
    .slice(0, limit)
    .map((s) => ({ id: s.id, name: s.name, source: 'local' as const }));

  if (localMatches.length > 0) {
    return { results: localMatches, upstreamDown: false };
  }

  // No local matches — fall back to popular stations (small curated list)
  const popular = POPULAR_STATIONS.filter((s) =>
    s.name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .includes(qNorm)
  )
    .slice(0, limit)
    .map((s) => ({ id: s.id, name: s.name, source: 'local' as const }));

  return { results: popular, upstreamDown: false };
}
