declare module 'db-vendo-client' {
  export function createClient(
    profile: object,
    userAgent: string,
    opt?: { enrichStations?: boolean | (() => unknown) }
  ): {
    departures: (
      station: string,
      opt?: Record<string, unknown>
    ) => Promise<{ departures: unknown[] }>;
  };
}

declare module 'db-vendo-client/p/dbweb/index.js' {
  export const profile: object;
}
