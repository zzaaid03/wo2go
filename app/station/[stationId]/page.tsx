export const dynamic = 'force-dynamic';

import { DestinationsClient } from '@/components/destinations-client';
import { StationPageHeader } from '@/components/station-page-header';
import { getDepartures } from '@/lib/db-api';
import { aggregateByDestination } from '@/lib/aggregate';
import { findPopularStation } from '@/lib/stations';

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

  const departures = await getDepartures(stationId);
  const destinations = aggregateByDestination(departures, stationId);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <StationPageHeader stationName={stationName} />
      <DestinationsClient destinations={destinations} />
    </main>
  );
}
