/**
 * Station search via v6.db.transport.rest locations endpoint.
 */

export interface StationSearchResult {
  id: string;
  name: string;
}

const BASE_URL = 'https://v6.db.transport.rest';

export async function searchStations(
  query: string,
  limit = 8
): Promise<StationSearchResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    query: query.trim(),
    results: String(limit),
    poi: 'false',
    addresses: 'false',
    stops: 'true',
  });

  const response = await fetch(`${BASE_URL}/locations?${params}`, {
    headers: {
      'User-Agent': 'wo2go/0.1 (+https://wo2go.vercel.app)',
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];

  const data = await response.json();
  const items = Array.isArray(data) ? data : [];

  return items
    .filter(
      (item: { type?: string; id?: string; name?: string }) =>
        item.type === 'stop' && item.id && item.name
    )
    .map((item: { id: string; name: string }) => ({
      id: item.id,
      name: item.name,
    }));
}
