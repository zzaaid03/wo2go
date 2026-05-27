'use client';

/**
 * DestinationsClient — the main Client Component for the home page.
 *
 * This component receives the full list of destinations from the Server
 * Component (app/page.tsx) as a prop, then owns filter state locally
 * via useState. Filtering happens in render — no effect needed.
 *
 * This is the core "Server → Client data flow" pattern in Next.js App Router:
 * the Server Component fetches and processes data, then passes serializable
 * props to a Client Component that handles interactivity.
 */

import { useState } from 'react';
import { FilterBar } from '@/components/filter-bar';
import { DestinationRow } from '@/components/destination-row';
import { useTranslation } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import type { Destination, Filters } from '@/types';

/** Products considered "regional" — eligible for Deutschlandticket */
const REGIONAL_PRODUCTS = new Set([
  'regionalExp',
  'regional',
  'suburban',
  'bus',
  'tram',
]);

interface DestinationsClientProps {
  destinations: Destination[];
}

export function DestinationsClient({
  destinations,
}: DestinationsClientProps) {
  const t = useTranslation();
  const [filters, setFilters] = useState<Filters>({
    regionalOnly: false,
    majorStationsOnly: false,
    highSpeedOnly: false,
  });

  // Apply filters in render — derived state, no effect needed
  const filtered = destinations.filter((dest) => {
    if (filters.regionalOnly) {
      // Keep only destinations served by at least one regional product
      const hasRegional = dest.products.some((p) => REGIONAL_PRODUCTS.has(p));
      if (!hasRegional) return false;
    }
    if (filters.highSpeedOnly) {
      const hasHighSpeed = dest.products.some((p) => p === 'national' || p === 'nationalExpress');
      if (!hasHighSpeed) return false;
    }
    if (filters.majorStationsOnly) {
      if (!dest.isMajor) return false;
    }
    return true;
  });

  const clearFilters = () => setFilters({ regionalOnly: false, majorStationsOnly: false, highSpeedOnly: false });

  const hasActiveFilters = filters.regionalOnly || filters.majorStationsOnly || filters.highSpeedOnly;

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('empty.title')}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t('empty.cta')}
            </Button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5" role="list">
          {filtered.map((dest) => (
            <li key={dest.id} className="min-w-0">
              <DestinationRow destination={dest} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
