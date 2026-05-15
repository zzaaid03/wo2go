/**
 * Formatting utilities for travel times and frequencies.
 * Pure functions — no framework dependency.
 */

/**
 * Formats a duration in minutes into a human-readable string.
 *
 * Examples:
 *  - 90  → "1h 30m"
 *  - 60  → "1h"
 *  - 23  → "23 min"
 *  - 120 → "2h"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Computes a rough frequency string from the number of connections
 * over a 12-hour window.
 *
 * Examples:
 *  - 24 connections → "every ~30 min"
 *  - 12 connections → "every ~1h"
 *  - 3 connections  → "3 connections" (too sparse for a frequency pattern)
 */
export function formatFrequency(
  connectionCount: number,
  connectionsLabel: string
): string {
  if (connectionCount <= 0) return `0 ${connectionsLabel}`;

  const windowMinutes = 720; // 12 hours
  const avgInterval = Math.round(windowMinutes / connectionCount);

  // Only show frequency pattern if at least 4 connections (meaningful pattern)
  if (connectionCount >= 4 && avgInterval <= 180) {
    if (avgInterval < 60) return `~ ${avgInterval} min`;
    const hours = Math.floor(avgInterval / 60);
    const mins = avgInterval % 60;
    if (mins === 0) return `~ ${hours}h`;
    return `~ ${hours}h ${mins}m`;
  }

  return `${connectionCount} ${connectionsLabel}`;
}

/**
 * Maps API product identifiers to user-facing badge labels.
 * These abbreviations are standard German rail nomenclature and
 * stay the same regardless of UI language.
 */
export function productLabel(product: string): string {
  const map: Record<string, string> = {
    nationalExpress: 'ICE',
    national: 'IC',
    regionalExp: 'RE',
    regional: 'RB',
    suburban: 'S',
    bus: 'Bus',
    tram: 'Tram',
    ferry: 'Ferry',
    taxi: 'Taxi',
  };
  return map[product] ?? product;
}

/**
 * Sort order for product badges — highest tier first.
 * Lower number = higher tier = appears first.
 */
export function productSortOrder(product: string): number {
  const order: Record<string, number> = {
    nationalExpress: 0,
    national: 1,
    regionalExp: 2,
    regional: 3,
    suburban: 4,
    bus: 5,
    tram: 6,
    ferry: 7,
    taxi: 8,
  };
  return order[product] ?? 9;
}
