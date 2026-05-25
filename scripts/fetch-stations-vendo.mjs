import fs from 'fs/promises';
import path from 'path';
import { createClient } from 'db-vendo-client';
import { profile as dbwebProfile } from 'db-vendo-client/p/dbweb/index.js';

const USER_AGENT = 'wo2go-fetch-stations/1.0 (+https://wo2go.vercel.app)';
const client = createClient(dbwebProfile, USER_AGENT, { enrichStations: false });

const queries = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
const OUT_DATA = path.join(process.cwd(), 'data', 'stations-index.json');
const OUT_PUBLIC = path.join(process.cwd(), 'public', 'stations-index.json');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  console.log('Starting vend-o stations fetch…');
  const collected = new Map();

  for (const q of queries) {
    try {
      console.log('Query:', q);
      const items = await client.locations(q, { results: 50, stops: true, fuzzy: true });
      for (const it of items) {
        if (!it || !it.id || !it.name) continue;
        if (!collected.has(it.id)) {
          const region = it.place?.state ?? it.region ?? '';
          collected.set(it.id, { id: String(it.id), name: String(it.name), region: region ?? '' });
        }
      }
    } catch (e) {
      console.warn('Query failed:', q, e && e.message ? e.message : e);
    }
    await sleep(250);
  }

  const arr = Array.from(collected.values()).sort((a, b) => a.name.localeCompare(b.name));
  await fs.mkdir(path.dirname(OUT_DATA), { recursive: true });
  await fs.writeFile(OUT_DATA, JSON.stringify(arr, null, 2));
  await fs.mkdir(path.dirname(OUT_PUBLIC), { recursive: true });
  await fs.writeFile(OUT_PUBLIC, JSON.stringify(arr, null, 2));

  console.log(`Wrote ${arr.length} stations to ${OUT_PUBLIC}`);
})().catch((err) => {
  console.error('Failed to fetch stations:', err);
  process.exit(1);
});
