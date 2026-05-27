'use client';

/**
 * FilterBar — presentational component for the two filter toggles.
 *
 * Does NOT hold its own state. Receives filter values and callbacks
 * from the parent DestinationsClient component.
 */

import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/components/language-provider';
import type { Filters } from '@/types';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  resultCount: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  resultCount,
}: FilterBarProps) {
  const t = useTranslation();

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <label
          htmlFor="regional-filter"
          className="text-sm font-medium leading-none text-foreground"
        >
          {t('filter.regional')}
        </label>
        <Switch
          id="regional-filter"
          checked={filters.regionalOnly}
          onCheckedChange={(checked) =>
            onFilterChange({ ...filters, regionalOnly: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <label
          htmlFor="major-stations-filter"
          className="text-sm font-medium leading-none text-foreground"
        >
          {t('filter.majorStations')}
        </label>
        <Switch
          id="major-stations-filter"
          checked={filters.majorStationsOnly}
          onCheckedChange={(checked) =>
            onFilterChange({ ...filters, majorStationsOnly: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="highspeed-filter" className="text-sm font-medium leading-none text-foreground">
          {t('filter.highSpeed')}
        </label>
        <Switch
          id="highspeed-filter"
          checked={filters.highSpeedOnly}
          onCheckedChange={(checked) => onFilterChange({ ...filters, highSpeedOnly: checked })}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {resultCount} {t('filter.countLabel')}
      </p>
    </div>
  );
}
