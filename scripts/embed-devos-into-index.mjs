#!/usr/bin/env node
// Inserta TODOS los devocionales (.md) en window.DEVOCIONAL_CONTENTS dentro de index.html
// Lee devocionales/index.json para usar las URLs exactas como claves
// Requisitos: Node 16+
// Uso:
//   node scripts/embed-devos-into-index.mjs [ruta_index_html]
// Por defecto, ruta_index_html = ./index.html

import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const indexPath = path.resolve(projectRoot, process.argv[2] || 'index.html');
const metaPath = path.resolve(projectRoot, 'devocionales', 'index.json');

function normalizeText(s) {
  s = String(s ?? '');
  s = s.replace(/^\uFEFF/, '');
  s = s.replace(/\r\n?/g, '\n');
  try { s = s.normalize('NFC'); } catch {}
  return s;
}

function escapeForTemplateLiteral(s) {
  // Escapar backticks y secuencias de interpolación
  return s
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function asObjectKeyLiteral(url) {
  // Mantener EXACTAMENTE el string (incluyendo espacios, emojis, acentos)
  return url.replace(/\\/g, '/');
}

async function loadMarkdownByUrl(urlRel) {
  const abs = path.resolve(projectRoot, urlRel);
  const data = await fs.readFile(abs, 'utf8');
  return normalizeText(data);
}

function findDevocionalAssignBlock(html) {
  const needle = 'Object.assign(window.DEVOCIONAL_CONTENTS';
  const idx = html.indexOf(needle);
  if (idx === -1) return null;
  // Buscar la primera llave "{" que abre el objeto literal
  let i = html.indexOf('{', idx);
  if (i === -1) return null;
  let depth = 0;
  let startObj = -1;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') {
      depth++;
      if (startObj === -1) startObj = i;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const endObj = i; // índice del '}' que cierra el objeto
        // Intentar extender hasta ');' del Object.assign
        let j = endObj + 1;
        while (j < html.length && /\s|\n|\r|,/u.test(html[j])) j++;
        if (html.slice(j, j + 2) === ');') j += 2;
        return { startObj, endObj, endCall: j };
      }
    }
  }
  return null;
}

async function main() {
  const [indexHtml, itemsJson] = await Promise.all([
    fs.readFile(indexPath, 'utf8').then(normalizeText),
    fs.readFile(metaPath, 'utf8').then(s => JSON.parse(normalizeText(s)))
  ]);

  // Construir entradas
  const missing = [];
  const pairs = [];
  for (const it of itemsJson) {
    const url = (it && it.url) ? String(it.url) : '';
    if (!url) continue;
    try {
      const md = await loadMarkdownByUrl(url);
      const escaped = escapeForTemplateLiteral(md);
      pairs.push({ key: asObjectKeyLiteral(url), value: escaped });
    } catch (err) {
      missing.push(url);
    }
  }

  if (pairs.length === 0) {
    console.error('No se generaron pares clave/valor. ¿index.json está vacío?');
    process.exit(1);
  }

  // Generar bloque JS consistente con el estilo existente
  const entriesJs = pairs.map(({ key, value }) => `  '${key}': \`${value}\``).join(',\n');
  const newAssign = `Object.assign(window.DEVOCIONAL_CONTENTS, {\n${entriesJs}\n});`;

  // Reemplazar bloque en index.html
  const loc = findDevocionalAssignBlock(indexHtml);
  let nextHtml;
  if (loc) {
    nextHtml = indexHtml.slice(0, indexHtml.indexOf('Object.assign(window.DEVOCIONAL_CONTENTS'))
      + newAssign
      + indexHtml.slice(loc.endCall);
  } else {
    // Si no existe el bloque, inserta antes del cierre de </script> más cercano
    const insertNeedle = '</script>';
    const p = indexHtml.lastIndexOf(insertNeedle);
    if (p === -1) {
      console.error('No se encontró dónde insertar el bloque.');
      process.exit(1);
    }
    const before = indexHtml.slice(0, p);
    const after = indexHtml.slice(p);
    const extra = `\n  // Fallback offline contenido devocionales (generado)\n  window.DEVOCIONAL_CONTENTS = window.DEVOCIONAL_CONTENTS || {};\n  ${newAssign}\n`;
    nextHtml = before + extra + after;
  }

  // Backup antes de sobrescribir
  const backupPath = indexPath + '.bak';
  await fs.writeFile(backupPath, indexHtml, 'utf8');
  await fs.writeFile(indexPath, nextHtml, 'utf8');

  console.log(`DEVOCIONAL_CONTENTS actualizado con ${pairs.length} entradas en ${path.relative(projectRoot, indexPath)}`);
  console.log(`Copia de seguridad creada en ${path.relative(projectRoot, backupPath)}`);
  if (missing.length) {
    console.warn('Archivos faltantes (no se pudieron leer):');
    for (const m of missing) console.warn(' -', m);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
