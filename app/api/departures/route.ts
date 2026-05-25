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

    return Response.json({ destinations, upstreamDown: false, partial: !cached });
  } catch (err) {
    return Response.json({ destinations: [], upstreamDown: true });
  }
}
