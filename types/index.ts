/**
 * Shared types for the wo2go application.
 *
 * - `Departure` models the raw shape returned by the v6.db.transport.rest API.
 * - `Destination` is the aggregated view we compute from many departures.
 * - `Filters` drives the client-side filter toggles.
 */

/** Product types as returned by the DB transport API */
export type Product =
  | 'nationalExpress' // ICE
  | 'national'        // IC / EC
  | 'regionalExp'     // RE
  | 'regional'        // RB
  | 'suburban'        // S-Bahn
  | 'bus'
  | 'tram'
  | 'ferry'
  | 'taxi';

/** A single stopover within a trip, as returned by the API */
export interface Stopover {
  stop: {
    id: string;
    name: string;
    type: string;
    products?: Partial<Record<Product, boolean>>;
  };
  arrival: string | null;
  arrivalDelay?: number | null;
  departure: string | null;
  departureDelay?: number | null;
}

/** A single departure from the origin station, as returned by the API */
export interface Departure {
  tripId: string;
  stop: {
    id: string;
    name: string;
  };
  when: string | null;
  plannedWhen: string | null;
  direction: string | null;
  line: {
    id: string;
    name: string;
    product: Product;
    mode: string;
  } | null;
  stopovers?: Stopover[];
}

/**
 * Aggregated destination — represents one unique station reachable
 * from the origin, with stats computed across all matching departures.
 */
export interface Destination {
  id: string;
  name: string;
  /** Shortest travel time in minutes across all connections */
  fastestMinutes: number;
  /** Number of direct connections in the 12-hour window */
  connectionCount: number;
  /** Set of product types that serve this destination */
  products: string[];
  /** Whether the station name contains "Hbf" or "Hauptbahnhof" */
  isHbf: boolean;
  /** Whether the station is considered major (Hbf or served by ICE) */
  isMajor: boolean;
}

/** Filter state managed in the client component */
export interface Filters {
  regionalOnly: boolean;
  majorStationsOnly: boolean;
  highSpeedOnly: boolean;
}
