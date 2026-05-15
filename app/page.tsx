/**
 * Home page — Server Component.
 *
 * This is the core "Server → Client data flow" pattern in Next.js App Router:
 * 1. This Server Component fetches departure data directly (no useEffect needed)
 * 2. It aggregates the raw data into a Destination[] array
 * 3. It passes the serializable result as a prop to DestinationsClient
 *
 * The Client Component then handles interactivity (filters, language toggle)
 * without needing to refetch data.
 */

/**
 * Force dynamic rendering — this page fetches live departure data from
 * the DB API, so it can't be statically generated at build time.
 */
export const dynamic = 'force-dynamic';

import { getDepartures, SAARBRUCKEN_HBF_ID } from '@/lib/db-api';
import { aggregateByDestination } from '@/lib/aggregate';
import { DestinationsClient } from '@/components/destinations-client';

export default async function HomePage() {
  const departures = await getDepartures(SAARBRUCKEN_HBF_ID);
  const destinations = aggregateByDestination(departures, SAARBRUCKEN_HBF_ID);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <DestinationsClient destinations={destinations} />
    </main>
  );
}
