import { checkUpstream } from '@/lib/upstream';

export async function GET() {
  const status = await checkUpstream();
  return Response.json(status);
}
