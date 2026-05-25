const BASE_URL = 'https://v6.db.transport.rest';

// Simple cached probe so multiple server components/routes can use it.
let lastChecked = 0;
let lastStatus: { upstreamDown: boolean } = { upstreamDown: false };
const TTL = 10 * 1000; // 10s

export async function checkUpstream(): Promise<{ upstreamDown: boolean }> {
  const now = Date.now();
  if (now - lastChecked < TTL) return lastStatus;

  try {
    const params = new URLSearchParams({ query: 'Berlin Hbf', results: '1', stops: 'true' });
    const controller = new AbortController();
    const timeout = 1500; // 1.5s timeout for fast failure detection
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`${BASE_URL}/locations?${params}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      lastStatus = { upstreamDown: !res.ok || res.status >= 500 };
    } finally {
      clearTimeout(id);
    }
  } catch (err) {
    lastStatus = { upstreamDown: true };
  }

  lastChecked = now;
  return lastStatus;
}
