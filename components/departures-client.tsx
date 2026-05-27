'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/filter-bar';
import { DepartureCard } from '@/components/departure-card';
import { classifyStation } from '@/lib/station-classification';
import type { Departure } from '@/types';
import type { Filters } from '@/types';

const REGIONAL_PRODUCTS = new Set([
  'regionalExp',
  'regional',
  'suburban',
  'bus',
  'tram',
]);

function getDestinationName(dep: Departure, originId?: string) {
  if (dep.stopovers && originId) {
    let pastOrigin = false;
    for (const s of dep.stopovers) {
      if (!pastOrigin) {
        if (s.stop?.id === originId) {
          pastOrigin = true;
        }
        continue;
      }
      if (!s.arrival) continue;
      return s.stop.name;
    }
  }
  return dep.direction ?? dep.stop?.name ?? '—';
}

interface Props {
  departures: Departure[];
  stationId: string;
}

export function DeparturesClient({ departures, stationId }: Props) {
  const [filters, setFilters] = useState<Filters>({ regionalOnly: false, majorStationsOnly: false, highSpeedOnly: false });

  const filtered = departures
    .filter((dep) => {
      const product = dep.line?.product;
      if (!product) return false;
      if (filters.regionalOnly && !REGIONAL_PRODUCTS.has(product)) return false;
      if (filters.highSpeedOnly && !(product === 'national' || product === 'nationalExpress')) return false;
      if (filters.majorStationsOnly) {
        const destName = getDestinationName(dep, stationId);
        const { isMajor } = classifyStation(destName, new Set([product]));
        if (!isMajor) return false;
      }
      return true;
    })
    .sort((a, b) => (new Date(a.when ?? 0).getTime() - new Date(b.when ?? 0).getTime()));

  const clearFilters = () => setFilters({ regionalOnly: false, majorStationsOnly: false, highSpeedOnly: false });

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onFilterChange={setFilters} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">No trains match these filters</p>
          {(filters.regionalOnly || filters.majorStationsOnly || filters.highSpeedOnly) && (
            <button className="btn" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5" role="list">
          {filtered.map((dep) => (
            <li key={dep.tripId + (dep.when ?? '')} className="min-w-0">
              <DepartureCard departure={dep} originId={stationId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeparturesClient;
