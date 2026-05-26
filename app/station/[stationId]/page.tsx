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

  const showServerOverlay = !upstream.upstreamDown && initialDestinations == null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      {showServerOverlay && (
        <div id="wo2go-server-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.12)' }}>
          <div style={{ width: 200, textAlign: 'center' }}>
            <svg viewBox="0 0 120 60" width={200} height={100} aria-hidden="true">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0%" stopColor="#e6eef8" />
                  <stop offset="100%" stopColor="#cfe6fb" />
                </linearGradient>
              </defs>
              <rect x="0" y="36" width="120" height="6" fill="#e6e6e6" />
              <g className="train" transform="translate(-30,0)">
                <rect x="8" y="10" rx="4" ry="4" width="72" height="30" fill="url(#g)" stroke="#bcd7f5" />
                <rect x="16" y="16" width="14" height="10" rx="1" fill="#fff" opacity="0.9" />
                <rect x="34" y="16" width="14" height="10" rx="1" fill="#fff" opacity="0.9" />
                <rect x="52" y="16" width="18" height="10" rx="1" fill="#fff" opacity="0.9" />
                <rect x="2" y="28" width="88" height="4" fill="#a8cbe9" />
                <circle className="wheel" cx="20" cy="44" r="6" fill="#3b82f6" />
                <circle className="wheel" cx="64" cy="44" r="6" fill="#3b82f6" />
              </g>
            </svg>
            <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>Lade Verbindungen…</div>
          </div>
          <style>{`
            .train { animation: train-move 1.6s linear infinite; }
            .wheel { transform-origin: 20px 44px; animation: wheel-rot 0.6s linear infinite; }
            .wheel:nth-of-type(2) { transform-origin: 64px 44px; animation-duration: 0.68s; }
            @keyframes train-move { 0% { transform: translateX(-30px); } 50% { transform: translateX(18px); } 100% { transform: translateX(120px); } }
            @keyframes wheel-rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}
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
