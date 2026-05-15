/**
 * Heuristics for classifying stations as "Hbf" or "major".
 *
 * This is intentionally simple for Phase 1. In Phase 2 we can add
 * a curated allowlist for non-Hbf cities of interest like
 * Hannover Messe/Laatzen, Frankfurt Flughafen, etc.
 */

/**
 * Classifies a station based on its name and the products serving it.
 *
 * - isHbf: true if the name contains "Hbf" or "Hauptbahnhof"
 * - isMajor: true if isHbf OR if ICE (nationalExpress) serves the station
 */
export function classifyStation(
  name: string,
  products: Set<string>
): { isHbf: boolean; isMajor: boolean } {
  const isHbf = /\bHbf\b/i.test(name) || /Hauptbahnhof/i.test(name);
  const isMajor = isHbf || products.has('nationalExpress');
  return { isHbf, isMajor };
}
