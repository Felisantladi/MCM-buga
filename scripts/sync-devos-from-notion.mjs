#!/usr/bin/env node
// Sync Devocionales from a Notion database into devocionales/index.json
// Requirements: Node 18+ (for global fetch)
// Env vars: NOTION_TOKEN, NOTION_DATABASE_ID

import fs from 'node:fs/promises';
import path from 'node:path';

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token || !databaseId) {
  console.error('Missing NOTION_TOKEN or NOTION_DATABASE_ID. Set them as environment variables.');
  process.exit(1);
}

const NOTION_VERSION = '2022-06-28';

async function notionQueryDatabase(dbId) {
  let results = [];
  let start_cursor = undefined;
  do {
    const body = {
      sorts: [
        { property: 'Week', direction: 'descending' },
        { property: 'Day', direction: 'ascending' },
        { timestamp: 'created_time', direction: 'descending' }
      ],
      page_size: 100,
      ...(start_cursor ? { start_cursor } : {})
    };
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Notion query failed: ${res.status} ${res.statusText} ${txt}`);
    }
    const data = await res.json();
    results = results.concat(data.results || []);
    start_cursor = data.has_more ? data.next_cursor : undefined;
  } while (start_cursor);
  return results;
}

const rtText = (rt) => (Array.isArray(rt) ? rt.map(t => t.plain_text).join('') : '').trim();
const titleText = (t) => rtText(t);
const slugify = (s) => String(s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);

function mapPage(p) {
  const props = p.properties || {};
  const title = titleText(props.Title?.title || []) || 'Devocional';
  const week = typeof props.Week?.number === 'number' ? props.Week.number : undefined;
  const day = typeof props.Day?.number === 'number' ? props.Day.number : undefined;
  const verse = rtText(props.Verse?.rich_text || []) || undefined;
  const urlProp = (props.URL && typeof props.URL.url === 'string') ? props.URL.url : undefined;
  const date = (props.Date?.date?.start) || (p.created_time ? String(p.created_time).slice(0,10) : undefined);
  const id = ['notion', slugify(title), (week ?? ''), (day ?? '')]
    .filter(Boolean)
    .join('-')
    .replace(/--+/g, '-');

  // p.url is the Notion app URL to the page; ensure pages are public or provide URL property
  const url = urlProp || p.url;
  return { id, title, verse, url, week, day, date };
}

async function main() {
  console.log('Querying Notion database...');
  const pages = await notionQueryDatabase(databaseId);
  console.log(`Fetched ${pages.length} pages from Notion.`);
  const items = pages.map(mapPage);
  const clean = items.filter(it => it.title && it.url);

  const outPath = path.resolve(process.cwd(), 'devocionales', 'index.json');
  await fs.writeFile(outPath, JSON.stringify(clean, null, 2), 'utf8');
  console.log(`Wrote ${clean.length} items to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
