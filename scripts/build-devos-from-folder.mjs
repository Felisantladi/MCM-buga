#!/usr/bin/env node
// Genera devocionales/index.json escaneando la carpeta genesis/ (sin Notion)
// Requisitos: Node 16+
// Uso:
//   node scripts/build-devos-from-folder.mjs [ruta_base_genesis]
// Por defecto, ruta_base_genesis = ./genesis

import fs from 'node:fs/promises';
import path from 'node:path';

const genesisRoot = path.resolve(process.cwd(), process.argv[2] || 'genesis');
const outPath = path.resolve(process.cwd(), 'devocionales', 'index.json');

const isMarkdown = (name) => name.toLowerCase().endsWith('.md');

function clean(md) {
  let s = String(md || '');
  s = s.replace(/^\uFEFF/, '');
  try { s = s.normalize('NFC'); } catch {}
  s = s.replace(/\r\n?/g, '\n');
  s = s.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');
  s = s.replace(/\u00A0/g, ' ').replace(/\uFFFD/g, '');
  return s;
}

function cleanTitle(input) {
  let s = String(input || '');
  try { s = s.normalize('NFC'); } catch {}
  // Quitar encabezados Markdown al inicio
  s = s.replace(/^\s*#{1,6}\s*/, '');
  // Quitar emojis (Extended Pictographic) y selectores de variación
  try {
    s = s.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '');
  } catch {
    // Fallback: quitar algunos emojis comunes si el entorno no soporta propiedades Unicode
    s = s.replace(/[📖🌟🙏🏗️✨⭐️🎯🔥💡🎵🎶🎚️🎙️🚪🕊️⛪️📜📌]/g, '');
  }
  // Quitar marcadores de énfasis Markdown comunes
  s = s.replace(/[\*`_~]+/g, '');
  // Quitar espacios sobrantes y colapsar múltiples espacios
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function extractDaySubtitle(md, day) {
  const text = clean(md);
  const n = Number(day) || 0;
  // Permitir espacios iniciales antes del encabezado y emojis u otros prefijos antes de "Día"
  const re = /^\s*#{1,6}\s*(?:.+?\s)?D[iíÍ]a\s*[:.-]?\s*(\d+)\s*[:.-]?\s*(.+)$/gim;
  let m;
  while ((m = re.exec(text))) {
    const d = parseInt(m[1], 10);
    if (!Number.isNaN(d) && d === n) {
      const rest = m[2].trim();
      const withoutParenTail = rest.replace(/\s*\([^)]{3,}\)\s*$/, '').trim();
      return cleanTitle(withoutParenTail);
    }
  }
  return '';
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...await walk(p));
    } else if (e.isFile() && isMarkdown(e.name)) {
      out.push(p);
    }
  }
  return out;
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function stripTrailingHexId(basename) {
  // Quita sufijo tipo " ... 2172b660264e80a69d39fdc94249f01b"
  return basename.replace(/\s[0-9a-f]{16,}$/i, '');
}

function parseWeekDayFromPath(relPath) {
  const plain = relPath.replace(/\\/g, '/');
  const weekMatch = plain.match(/semana\s*(\d+)/i);
  // Aceptar "Día", "Dia" y mayúsculas con tilde
  const dayMatch = plain.match(/d[iíÍ]a\s*(\d+)/i);
  const week = weekMatch ? parseInt(weekMatch[1], 10) : undefined;
  const day = dayMatch ? parseInt(dayMatch[1], 10) : undefined;
  return { week, day };
}

async function buildItems(files) {
  const items = [];
  for (const abs of files) {
    const rel = path.relative(process.cwd(), abs).replace(/\\/g, '/');
    const base = path.basename(abs, '.md');
    const cleanBase = stripTrailingHexId(base);

    // Derivar semana/día desde toda la ruta
    const { week, day } = parseWeekDayFromPath(rel);

    // Filtrar: sólo incluir si al menos tenemos week y day
    if (typeof week !== 'number' || typeof day !== 'number' || Number.isNaN(week) || Number.isNaN(day)) {
      continue;
    }

    // Intentar obtener título específico del día leyendo el Markdown
    let dayTitle = '';
    try {
      const raw = await fs.readFile(abs, 'utf8');
      dayTitle = extractDaySubtitle(raw, day) || '';
    } catch {}
    // Título base (preferir subtítulo extraído del MD)
    let title = dayTitle || cleanBase || `Devocional Semana ${week}, Día ${day}`;
    // Limpieza final del título: sin cabeceras, emojis ni marcadores Markdown
    title = cleanTitle(title);

    const st = await fs.stat(abs);
    const date = new Date(st.mtime).toISOString().slice(0, 10);

    const id = ['local', slugify(title), week, day]
      .filter(Boolean)
      .join('-')
      .replace(/--+/g, '-');

    items.push({ id, title, week, day, url: rel, date });
  }
  return items;
}

async function main() {
  console.log(`Escaneando: ${genesisRoot}`);
  try {
    await fs.access(genesisRoot);
  } catch {
    console.error(`No existe la carpeta: ${genesisRoot}`);
    process.exit(1);
  }

  const files = await walk(genesisRoot);
  console.log(`Archivos .md encontrados: ${files.length}`);

  const items = await buildItems(files);
  // Orden no estrictamente necesario (el front ordena), pero ayudamos:
  items.sort((a, b) => {
    if (a.week !== b.week) return b.week - a.week; // semana desc
    if (a.day !== b.day) return a.day - b.day;     // día asc
    return (b.date || '').localeCompare(a.date || '');
  });

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Wrote ${items.length} items to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
