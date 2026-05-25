import fs from 'fs/promises';
import path from 'path';

const BASE = 'https://v6.db.transport.rest/locations';
const queries = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
const OUT_DATA = path.join(process.cwd(), 'data', 'stations-index.json');
const OUT_PUBLIC = path.join(process.cwd(), 'public', 'stations-index.json');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchForQuery(q) {
  const url = `${BASE}?query=${encodeURIComponent(q)}&type=station`;
  const res = await fetch(url, { headers: { 'User-Agent': 'wo2go-fetch-stations/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (!Array.isArray(json)) return [];
  return json.map((it) => ({ id: it.id, name: it.name, region: it?.place?.state ?? it?.region ?? '' }));
}

(async () => {
  console.log('Starting stations fetch…');
  const collected = new Map();

  for (const q of queries) {
    try {
      console.log('Query:', q);
      const items = await fetchForQuery(q);
      for (const it of items) {
        if (!it || !it.id || !it.name) continue;
        if (!collected.has(it.id)) collected.set(it.id, { id: String(it.id), name: String(it.name), region: it.region ?? '' });
      }
    } catch (e) {
      console.warn('Query failed:', q, e.message || e);
    }
    // be polite
    await sleep(300);
  }

  const arr = Array.from(collected.values()).sort((a, b) => a.name.localeCompare(b.name));
  await fs.mkdir(path.dirname(OUT_DATA), { recursive: true });
  await fs.writeFile(OUT_DATA, JSON.stringify(arr, null, 2));
  await fs.mkdir(path.dirname(OUT_PUBLIC), { recursive: true });
  await fs.writeFile(OUT_PUBLIC, JSON.stringify(arr, null, 2));

  console.log(`Wrote ${arr.length} stations to ${OUT_PUBLIC}`);
})().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to fetch stations:', err);
  process.exit(1);
});
