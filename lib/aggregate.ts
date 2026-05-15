/**
 * Aggregation logic: transforms raw departures into a deduplicated
 * list of destinations with stats (fastest time, frequency, products).
 *
 * Pure function — no framework dependency, easily unit-testable.
 */

import { Departure, Destination } from '@/types';
import { classifyStation } from './station-classification';

interface ConnectionRow {
  destinationId: string;
  destinationName: string;
  travelMinutes: number;
  product: string;
}

/**
 * Aggregates raw departures into a list of unique destinations,
 * sorted by fastest travel time ascending.
 *
 * How it works:
 * 1. For each departure, iterate over its stopovers AFTER the origin.
 * 2. Each such stopover is a reachable destination on that trip.
 * 3. Compute travel time from origin departure to stopover arrival.
 * 4. Group by destination station ID and compute stats.
 */
export function aggregateByDestination(
  departures: Departure[],
  originId: string
): Destination[] {
  const rows: ConnectionRow[] = [];

  for (const dep of departures) {
    // Skip departures without stopovers or departure time
    if (!dep.stopovers || !dep.when) continue;

    const originTime = new Date(dep.when).getTime();
    const product = dep.line?.product;
    if (!product) continue;

    // Find the origin index in stopovers so we only look at stops AFTER it
    let pastOrigin = false;

    for (const stopover of dep.stopovers) {
      if (!pastOrigin) {
        // Check if this stopover is the origin station
        if (stopover.stop?.id === originId) {
          pastOrigin = true;
        }
        continue;
      }

      // Skip if this stopover loops back to the origin
      if (stopover.stop?.id === originId) continue;

      // Skip stopovers without arrival time
      if (!stopover.arrival) continue;

      const arrivalTime = new Date(stopover.arrival).getTime();
      const travelMinutes = Math.round((arrivalTime - originTime) / 60_000);

      // Skip negative or zero travel times (data anomalies)
      if (travelMinutes <= 0) continue;

      rows.push({
        destinationId: stopover.stop.id,
        destinationName: stopover.stop.name,
        travelMinutes,
        product,
      });
    }
  }

  // Group rows by destination ID
  const grouped = new Map<
    string,
    {
      name: string;
      minMinutes: number;
      count: number;
      products: Set<string>;
    }
  >();

  for (const row of rows) {
    const existing = grouped.get(row.destinationId);
    if (existing) {
      existing.minMinutes = Math.min(existing.minMinutes, row.travelMinutes);
      existing.count += 1;
      existing.products.add(row.product);
    } else {
      grouped.set(row.destinationId, {
        name: row.destinationName,
        minMinutes: row.travelMinutes,
        count: 1,
        products: new Set([row.product]),
      });
    }
  }

  // Convert to Destination[] with station classification
  const destinations: Destination[] = [];

  for (const [id, data] of grouped) {
    const { isHbf, isMajor } = classifyStation(data.name, data.products);

    destinations.push({
      id,
      name: data.name,
      fastestMinutes: data.minMinutes,
      connectionCount: data.count,
      products: Array.from(data.products),
      isHbf,
      isMajor,
    });
  }

  // Sort by fastest travel time ascending
  destinations.sort((a, b) => a.fastestMinutes - b.fastestMinutes);

  return destinations;
}
