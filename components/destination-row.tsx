'use client';

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

  const sortedProducts = [...destination.products].sort(
    (a, b) => productSortOrder(a) - productSortOrder(b)
  );

  const frequency = formatFrequency(
    destination.connectionCount,
    t('destination.connections')
  );

  return (
    <article
      className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      title={destination.name}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug font-semibold break-words text-foreground">
          {destination.name}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDuration(destination.fastestMinutes)}
          <span className="mx-1.5 opacity-50">·</span>
          {frequency}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:max-w-[45%] sm:justify-end">
        {sortedProducts.map((product) => (
          <Badge
            key={product}
            variant="secondary"
            className="shrink-0 border border-border/60 bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold"
          >
            {productLabel(product)}
          </Badge>
        ))}
      </div>
    </article>
  );
}
