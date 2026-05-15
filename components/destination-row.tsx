'use client';

/**
 * DestinationRow — presentational component for a single destination.
 *
 * Displays the station name, fastest travel time, connection frequency,
 * and product badges (ICE, IC, RE, etc.).
 */

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/components/language-provider';
import {
  formatDuration,
  formatFrequency,
  productLabel,
  productSortOrder,
} from '@/lib/format';
import type { Destination } from '@/types';

interface DestinationRowProps {
  destination: Destination;
}

export function DestinationRow({ destination }: DestinationRowProps) {
  const t = useTranslation();

  // Sort products so highest tier (ICE) appears first
  const sortedProducts = [...destination.products].sort(
    (a, b) => productSortOrder(a) - productSortOrder(b)
  );

  const frequency = formatFrequency(
    destination.connectionCount,
    t('destination.connections')
  );

  return (
    <div className="flex min-h-14 items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/50">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">
          {destination.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDuration(destination.fastestMinutes)}
          <span className="mx-1.5">·</span>
          {frequency}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        {sortedProducts.map((product) => (
          <Badge
            key={product}
            variant="secondary"
            className="px-1.5 py-0 text-[10px] font-medium"
          >
            {productLabel(product)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
