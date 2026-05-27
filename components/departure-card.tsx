'use client';

import type { Departure } from '@/types';
import { productLabel, productColor } from '@/lib/format';

interface Props {
  departure: Departure;
  originId?: string;
}

function getDestinationName(dep: Departure, originId?: string) {
  if (dep.stopovers && dep.when && originId) {
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

export function DepartureCard({ departure, originId }: Props) {
  const product = departure.line?.product ?? 'regional';
  const badgeBg = productColor(product);
  const badgeLabel = productLabel(product);
  const time = departure.when ? new Date(departure.when) : null;
  const timeStr = time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const destName = getDestinationName(departure, originId);

  return (
    <article className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card px-4 py-3.5 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-foreground truncate">{departure.line?.name ?? badgeLabel} — {destName}</p>
        <p className="mt-1 text-xs text-muted-foreground truncate">{departure.line?.name ? `${departure.line.name}` : ''}</p>
      </div>

      <div className="flex items-center gap-3">
        <div style={{ backgroundColor: badgeBg }} className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
          {badgeLabel}
        </div>
        <div className="text-sm font-medium text-foreground tabular-nums">{timeStr}</div>
      </div>
    </article>
  );
}

export default DepartureCard;
