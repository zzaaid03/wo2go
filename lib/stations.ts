/**
 * Curated popular stations (EVA IDs) for quick selection on the home page.
 */

export interface StationRef {
  id: string;
  name: string;
  region: string;
}

export const POPULAR_STATIONS: StationRef[] = [
  { id: '8011160', name: 'Berlin Hbf', region: 'Berlin' },
  { id: '8000261', name: 'München Hbf', region: 'Bayern' },
  { id: '8002549', name: 'Hamburg Hbf', region: 'Hamburg' },
  { id: '8000207', name: 'Köln Hbf', region: 'NRW' },
  { id: '8000105', name: 'Frankfurt (Main) Hbf', region: 'Hessen' },
  { id: '8000096', name: 'Stuttgart Hbf', region: 'Baden-Württemberg' },
  { id: '8000152', name: 'Hannover Hbf', region: 'Niedersachsen' },
  { id: '8010205', name: 'Leipzig Hbf', region: 'Sachsen' },
  { id: '8010085', name: 'Dresden Hbf', region: 'Sachsen' },
  { id: '8000323', name: 'Saarbrücken Hbf', region: 'Saarland' },
  { id: '8008094', name: 'Nürnberg Hbf', region: 'Bayern' },
  { id: '8004964', name: 'Dortmund Hbf', region: 'NRW' },
];

export function findPopularStation(id: string): StationRef | undefined {
  return POPULAR_STATIONS.find((s) => s.id === id);
}

export function stationPath(id: string, name?: string): string {
  const base = `/station/${encodeURIComponent(id)}`;
  if (!name) return base;
  return `${base}?name=${encodeURIComponent(name)}`;
}

// Bulk station index (can be replaced with a full Germany dataset)
import ALL_STATIONS_RAW from '../data/stations-index.json';

export const ALL_STATIONS: StationRef[] = (
  ALL_STATIONS_RAW as StationRef[]
).map((s) => ({ id: s.id, name: s.name, region: s.region }));
