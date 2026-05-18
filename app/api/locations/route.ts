import { searchStations } from '@/lib/locations';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  const results = await searchStations(q);
  return Response.json(results);
}
