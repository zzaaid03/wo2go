import { getDepartures, getDeparturesFast } from '@/lib/db-api';
import { aggregateByDestination } from '@/lib/aggregate';
import { checkUpstream } from '@/lib/upstream';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const stationId = url.searchParams.get('stationId');
  if (!stationId) {
    return new Response(JSON.stringify({ error: 'stationId required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Dev-only: return a small mock dataset for Berlin Hbf to exercise the UI.
  // Station ID used in the app: 8011160
  if (process.env.NODE_ENV !== 'production' && stationId === '8011160') {
    const mockDestinations = [
      {
        id: '8002549',
        name: 'Leipzig Hbf',
        fastestMinutes: 88,
        connectionCount: 12,
        products: ['national', 'regionalExp'],
        isHbf: true,
        isMajor: true,
      },
      {
        id: '8000105',
        name: 'Potsdam Hbf',
        fastestMinutes: 36,
        connectionCount: 18,
        products: ['regional', 'suburban'],
        isHbf: true,
        isMajor: false,
      },
      {
        id: '8000207',
        name: 'Berlin Gesundbrunnen',
        fastestMinutes: 8,
        connectionCount: 35,
        products: ['suburban'],
        isHbf: false,
        isMajor: false,
      },
      {
        id: '8002549-ic',
        name: 'Hamburg Hbf',
        fastestMinutes: 120,
        connectionCount: 6,
        products: ['national'],
        isHbf: true,
        isMajor: true,
      },
    ];

    const mockDepartures = [
      {
        tripId: 'mock-1',
        stop: { id: stationId, name: 'Berlin Hbf' },
        when: new Date(Date.now() + 5 * 60_000).toISOString(),
        plannedWhen: new Date(Date.now() + 5 * 60_000).toISOString(),
        direction: 'Leipzig Hbf',
        line: { id: 'ICE123', name: 'ICE 123', product: 'nationalExpress', mode: 'train' },
      },
      {
        tripId: 'mock-2',
        stop: { id: stationId, name: 'Berlin Hbf' },
        when: new Date(Date.now() + 18 * 60_000).toISOString(),
        plannedWhen: new Date(Date.now() + 18 * 60_000).toISOString(),
        direction: 'Potsdam Hbf',
        line: { id: 'RB45', name: 'RB 45', product: 'regional', mode: 'train' },
      },
      {
        tripId: 'mock-3',
        stop: { id: stationId, name: 'Berlin Hbf' },
        when: new Date(Date.now() + 32 * 60_000).toISOString(),
        plannedWhen: new Date(Date.now() + 32 * 60_000).toISOString(),
        direction: 'Hamburg Hbf',
        line: { id: 'IC987', name: 'IC 987', product: 'national', mode: 'train' },
      },
    ];

    return new Response(JSON.stringify({ departures: mockDepartures, destinations: mockDestinations, upstreamDown: false, partial: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Fast upstream probe: check upstream status and return quickly if down.
  try {
    const status = await checkUpstream();
    if (status.upstreamDown) return Response.json({ destinations: [], upstreamDown: true });
  } catch {
    return Response.json({ destinations: [], upstreamDown: true });
  }

  try {
    // First, return a fast partial result (next CHUNK_DURATION_MINUTES).
    const { departures, cached } = await getDeparturesFast(stationId);
    const destinations = aggregateByDestination(departures, stationId);

    // If we didn't return cached full data, trigger a background full fetch
    // to populate the server cache for subsequent requests.
    if (!cached) {
      // fire-and-forget; populate cache in background
      void getDepartures(stationId).catch(() => {
        /* ignore background errors */
      });
    }

    return Response.json({ departures, destinations, upstreamDown: false, partial: !cached });
  } catch (err) {
    return Response.json({ departures: [], destinations: [], upstreamDown: true });
  }
}
