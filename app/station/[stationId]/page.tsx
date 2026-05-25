export const dynamic = 'force-dynamic';

import { DestinationsLoader } from '@/components/destinations-loader';
import { StationPageHeader } from '@/components/station-page-header';
import { findPopularStation } from '@/lib/stations';
import { checkUpstream } from '@/lib/upstream';
import { getDeparturesFast } from '@/lib/db-api';
import { aggregateByDestination } from '@/lib/aggregate';

interface StationPageProps {
  params: Promise<{ stationId: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function StationPage({
  params,
  searchParams,
}: StationPageProps) {
  const { stationId } = await params;
  const { name: nameParam } = await searchParams;

  const popular = findPopularStation(stationId);
  const stationName = nameParam ?? popular?.name ?? `Station ${stationId}`;

  // Probe upstream on the server so we can server-render a helpful initial
  // state. This avoids showing a long-loading spinner when the upstream is down.
  const upstream = await checkUpstream();

  let initialDestinations = undefined;
  let initialPartial = false;

  if (!upstream.upstreamDown) {
    try {
      const { departures, cached } = await getDeparturesFast(stationId);
      initialDestinations = aggregateByDestination(departures, stationId);
      initialPartial = !cached;
    } catch {
      // ignore — the loader will handle fetching or showing upstream error
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <StationPageHeader stationName={stationName} />
      {/* Pass initial probe and partial results to the client loader for immediate UI */}
      <DestinationsLoader
        stationId={stationId}
        initialUpstreamDown={upstream.upstreamDown}
        initialDestinations={initialDestinations}
        initialPartial={initialPartial}
      />
    </main>
  );
}
