// MCM Buga - Interacciones básicas
(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Live region accesible para avisos de estado
  const ensureLiveRegion = () => {
    let r = document.getElementById('sr-live');
    if (!r) {
      r = document.createElement('div');
      r.id = 'sr-live';
      r.className = 'sr-only';
      r.setAttribute('role', 'status');
      r.setAttribute('aria-live', 'polite');
      document.body.appendChild(r);
    }
    return r;
  };
  const announce = (msg) => {
    try { ensureLiveRegion().textContent = String(msg || ''); } catch {}
  };

  // Carga de módulos tipo=module sólo una vez, compatibles con file:// (exponen en window.MCM)
  const loadedModules = new Set();
  const loadModuleOnce = (src) => new Promise((resolve, reject) => {
    try {
      if (!src || loadedModules.has(src)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => { loadedModules.add(src); resolve(); };
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    } catch (e) { reject(e); }
  });

  // Progressive import placeholder: use classic loader to avoid referencing reserved 'import' identifier in non-module context.
  // If in the future we run under modules/HTTP, this can be upgraded, but for now we always fallback safely.
  const tryImport = async (src) => { await loadModuleOnce(src); return null; };

  // Optional: HTTPS-only ESM loader using inline module script. Controlled by window.USE_ESM === true.
  const tryESM = (moduleUrl) => new Promise((resolve) => {
    try {
      if (window.USE_ESM === true && typeof document !== 'undefined' && location && /^https?:/i.test(location.protocol)) {
        const key = `esm:${moduleUrl}`;
        if (loadedModules.has(key)) return resolve();
        const s = document.createElement('script');
        s.type = 'module';
        // Use inline import to avoid parsing 'import' in this non-module JS context
        s.textContent = `import '${moduleUrl}';`;
        s.onload = () => { loadedModules.add(key); resolve(); };
        s.onerror = () => resolve();
        document.head.appendChild(s);
        return;
      }
    } catch {}
    // Fallback silently with relative path for file:// compatibility
    const rel = moduleUrl.startsWith('/') ? moduleUrl.slice(1) : moduleUrl;
    loadModuleOnce(rel).then(resolve).catch(() => resolve());
  });

  // Skeleton helpers
  const renderSkeletonCards = (wrap, count = 3) => {
    if (!wrap) return;
    const html = Array.from({ length: count }).map(() => `
      <article class="card skeleton">
        <div class="card-body">
          <div class="sk-title shimmer"></div>
          <div class="sk-line shimmer"></div>
          <div class="sk-line shimmer short"></div>
        </div>
      </article>
    `).join('');
    wrap.innerHTML = html;
  };

  // Helper: forzar decodificación UTF-8 consistente (incluye escenarios sin headers)
  const fetchTextUTF8 = async (url, opts = {}) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error('fetch fail');
    // Fallback si TextDecoder no está disponible
    if (typeof TextDecoder !== 'function') {
      return await res.text();
    }
    const buf = await res.arrayBuffer();
    const dec = new TextDecoder('utf-8');
    return dec.decode(buf);
  };

  // Configurar opciones de marked si está disponible (mejor soporte GFM y saltos de línea)
  try {
    if (window.marked && typeof window.marked.setOptions === 'function') {
      window.marked.setOptions({
        gfm: true,
        breaks: true,        // tratar salto de línea simple como <br>
        smartLists: true,
        smartypants: false,
        mangle: false,       // evitar mangling de texto con acentos/emails
        headerIds: false     // ids en encabezados no necesarios dentro del modal
      });
    }
  } catch {}

  // Delegación: acordeones en bloques renderizados
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.accordion-toggle');
    if (!btn) return;
    const container = btn.closest('.accordion');
    const panel = container && container.querySelector('.accordion-panel');
    if (!panel) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  });

  // Menú móvil
  const toggle = qs('.nav-toggle');
  const menu = qs('#menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Cerrar al seleccionar un enlace
    qsa('a', menu).forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Utilidades globales para devocionales y Markdown (disponibles en modo offline)
  // Cache de subtítulos por (URL + día) para evitar colisiones cuando varios días comparten el mismo .md
  const daySubtitleCache = new Map();
  const extractDaySubtitle = (md, dayNum) => {
    const text = String(md || '');
    const n = Number(dayNum) || 0;
    const re = /^\s*#{1,6}\s*(?:.+?\s)?D[ií]a\s*[:.-]?\s*(\d+)\s*[:.-]?\s*(.+)$/gim;
    let m;
    while ((m = re.exec(text))) {
      const d = parseInt(m[1], 10);
      if (!isNaN(d) && d === n) {
        const rest = m[2].trim();
        return rest.replace(/\s*\([^)]{3,}\)\s*$/, '').trim();
      }
    }
    return '';
  };

  // Extrae el primer encabezado del MD como respaldo de título
  const extractMainHeading = (md) => {
    const text = String(md || '');
    const m = /^\s*#{1,6}\s+(.+)$/m.exec(text);
    if (!m) return '';
    let t = m[1].trim();
    // Quitar prefijos comunes "📖" y el marcador "Día N ..." si viene incluido
    t = t.replace(/^📖\s*/, '').trim();
    t = t.replace(/^D[ií]a\s*[:.-]?\s*\d+\s*[:.-]?\s*/i, '').trim();
    // Limpiar colas tipo (verso), etc.
    t = t.replace(/\s*\([^)]{3,}\)\s*$/, '').trim();
    return t;
  };
  const fetchDevoMarkdown = async (url) => {
    const tryFetch = async (u) => fetchTextUTF8(u, { cache: 'no-store' });
    try {
      return await tryFetch(url);
    } catch {
      try {
        const obj = window.DEVOCIONAL_CONTENTS || {};
        const uniq = new Set();
        const toStr = (x) => String(x || '');
        const toNFC = (s) => { try { return toStr(s).normalize('NFC'); } catch { return toStr(s); } };
        const add = (s) => { const t = toStr(s); if (t) uniq.add(t); };
        const addVariants = (s) => {
          const t = toStr(s);
          add(t);
          // decode/encode variants
          try { add(decodeURI(t)); } catch {}
          try { add(encodeURI(t)); } catch {}
          // slashes/backslashes
          const slash = t.replace(/\\/g, '/');
          if (slash !== t) { add(slash); try { add(decodeURI(slash)); } catch {} }
          // strip leading ./
          const noDot = t.replace(/^\.\//, '');
          if (noDot !== t) { add(noDot); try { add(decodeURI(noDot)); } catch {} }
        };
        addVariants(url);

        // 1) Intento exacto con todas las variantes generadas
        for (const k of uniq) { if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k]; }

        // 2) Intento por comparación normalizada NFC y decodeURI
        const targets = Array.from(uniq).map(s => {
          let d = s; try { d = decodeURI(s); } catch {}
          return toNFC(d);
        });
        const keys = Object.keys(obj);
        for (const key of keys) {
          const keyVariants = [key];
          try { keyVariants.push(decodeURI(key)); } catch {}
          const normed = keyVariants.map(toNFC);
          if (normed.some(n => targets.includes(n))) {
            return obj[key];
          }
        }
      } catch {}
      throw new Error('no content');
    }
  };
  // Limpia subtítulos inline: mantiene emojis; solo quita separadores iniciales y marcadores simples de Markdown
  const cleanInlineTitle = (s) => {
    let t = String(s || '');
    t = t.replace(/^\s*[-–—:]{1,2}\s*/, '');
    t = t.replace(/[\*_<>\/`~]+/g, '');
    t = t.replace(/\s{2,}/g, ' ');
    return t.trim();
  };

  // Fallback básico: convierte Markdown limitado a HTML seguro (encabezados, hr, listas, negrita, cursiva)
  const escapeHTML = (s) => String(s).replace(/[&<>'"]/g, (c) => (
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  ));
  const inlineMD = (s) => {
    let x = s;
    x = x.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    x = x.replace(/(^|\W)\*(?!\*)([^*]+)\*(?!\*)/g, (m, p1, p2) => `${p1}<em>${p2}</em>`);
    return x;
  };
  const renderMarkdownBasic = (md) => {
    const lines = String(md || '').split('\n');
    let html = '';
    let inUL = false;
    const closeUL = () => { if (inUL) { html += '</ul>'; inUL = false; } };
    for (let raw of lines) {
      const line = raw.replace(/\s+$/, '');
      if (/^\s*-{3,}\s*$/.test(line)) { closeUL(); html += '<hr />'; continue; }
      const h = /^(#{1,6})\s+(.+)$/.exec(line);
      if (h) {
        closeUL();
        const level = h[1].length;
        const text = inlineMD(escapeHTML(h[2]));
        html += `<h${level}>${text}</h${level}>`;
        continue;
      }
      const li = /^\s*-\s+(.+)$/.exec(line);
      if (li) {
        if (!inUL) { html += '<ul>'; inUL = true; }
        html += `<li>${inlineMD(escapeHTML(li[1]))}</li>`;
        continue;
      }
      if (/^[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(line)) {
        closeUL();
        html += `<p>${line}</p>`;
        continue;
      }
      if (line.trim() === '') { closeUL(); continue; }
      closeUL();
      html += `<p>${inlineMD(escapeHTML(line))}</p>`;
    }
    closeUL();
    return html;
  };

  // Parser de atributos simples: key="value" | key='value' | key=value
  const parseAttrs = (s) => {
    const out = {};
    const str = String(s || '');
    const re = /(\w+)=\"([^\"]*)\"|(\w+)=\'([^\']*)\'|(\w+)=([^\s]+)/g;
    let m;
    while ((m = re.exec(str))) {
      if (m[1]) out[m[1]] = m[2];
      else if (m[3]) out[m[3]] = m[4];
      else if (m[5]) out[m[5]] = m[6];
    }
    return out;
  };

  // Renderizar Markdown con soporte de bloques :::callout|verse|accordion|prayer
  const renderMarkdownWithBlocks = (md) => {
    const mdToHTML = (text) => {
      if (!text) return '';
      return (window.marked && typeof window.marked.parse === 'function') ? window.marked.parse(text) : renderMarkdownBasic(text);
    };
    const lines = String(md || '').split('\n');
    const parts = [];
    const emitMarked = (text) => { if (!text) return; parts.push(mdToHTML(text)); };
    const escape = (t) => String(t || '').replace(/[&<>\"']/g, c => (
      c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
    ));
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const m = /^\s*:::\s*(callout|verse|accordion|prayer)\b(.*)$/i.exec(line);
      if (!m) {
        const buf = [];
        while (i < lines.length && !/^\s*:::/i.test(lines[i])) { buf.push(lines[i]); i++; }
        emitMarked(buf.join('\n'));
        continue;
      }
      const kind = m[1].toLowerCase();
      const attrs = parseAttrs(m[2]);
      i++;
      const content = [];
      while (i < lines.length && !/^\s*:::\s*$/.test(lines[i])) { content.push(lines[i]); i++; }
      if (i < lines.length && /^\s*:::\s*$/.test(lines[i])) i++;
      const innerHTML = mdToHTML(content.join('\n'));
      if (kind === 'callout') {
        const variant = (attrs.tipo || attrs.type || 'info').toLowerCase();
        const title = attrs.title ? `<div class=\"callout-title\">${escape(attrs.title)}</div>` : '';
        parts.push(`<div class=\"callout ${escape(variant)}\">${title}<div class=\"callout-body\">${innerHTML}</div></div>`);
      } else if (kind === 'verse') {
        const ref = attrs.ref ? escape(attrs.ref) : '';
        const ver = attrs.version ? escape(attrs.version) : '';
        const cap = ref ? `<figcaption>${ref}${ver ? ` — ${ver}` : ''}</figcaption>` : '';
        parts.push(`<figure class=\"verse-card\"><blockquote>${innerHTML}</blockquote>${cap}</figure>`);
      } else if (kind === 'accordion') {
        const title = escape(attrs.title || 'Sección');
        parts.push(`<div class=\"accordion\"><button class=\"accordion-toggle\" aria-expanded=\"false\">${title}</button><div class=\"accordion-panel\" hidden>${innerHTML}</div></div>`);
      } else if (kind === 'prayer') {
        const title = attrs.title ? `<div class=\"prayer-title\">${escape(attrs.title)}</div>` : '';
        parts.push(`<div class=\"prayer\">${title}<div class=\"prayer-body\">${innerHTML}</div></div>`);
      }
    }
    return parts.join('');
  };

  // Carga dinámica de prédicas desde predicas/index.json
  const sermonsWrap = qs('.sermons[data-dynamic]');
  if (sermonsWrap) {
    // Estado inicial: skeletons + aria-busy
    sermonsWrap.setAttribute('aria-busy', 'true');
    renderSkeletonCards(sermonsWrap, 3);
    announce('Cargando prédicas…');
    const renderSermons = (list = []) => {
      try {
        const items = Array.isArray(list) ? [...list] : [];
        items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const html = items.map(s => `
          <article class="card sermon reveal in">
            <div class="card-body">
              <h3>${s.title}</h3>
              <audio controls preload="none" src="${s.audio}" aria-label="Reproducir ${s.title}"></audio>
              <p class="summary">${s.summary}</p>
              <button class="btn btn-ghost sermon-toggle" aria-expanded="false" aria-controls="dev-${s.id}">Leer desarrollo</button>
              <div id="dev-${s.id}" class="sermon-details" hidden data-src="${s.content}"></div>
            </div>
          </article>
        `).join('');
        sermonsWrap.innerHTML = html || '<div class="card"><div class="card-body"><p>No hay prédicas disponibles por ahora.</p></div></div>';
        sermonsWrap.removeAttribute('aria-busy');
        announce(items.length ? `Se cargaron ${items.length} prédicas` : 'No hay prédicas disponibles');
        // Mejoras: audio y lazy
        loadModuleOnce('js/modules/audio.js').then(() => { try { window.MCM && window.MCM.audio && window.MCM.audio.enhanceAudios(sermonsWrap); } catch {} });
        loadModuleOnce('js/modules/lazy.js').then(() => { try { window.MCM && window.MCM.lazy && window.MCM.lazy.init(sermonsWrap); } catch {} });
        // JSON-LD para la última prédica (AudioObject)
        try {
          const s0 = items[0];
          const data = s0 ? {
            "@context": "https://schema.org",
            "@type": "AudioObject",
            name: String(s0.title || ''),
            description: String(s0.summary || ''),
            contentUrl: String(s0.audio || ''),
            encodingFormat: (String(s0.audio || '').toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : undefined),
            uploadDate: String(s0.date || '')
          } : null;
          let tag = document.getElementById('ld-audio');
          if (!tag) { tag = document.createElement('script'); tag.id = 'ld-audio'; tag.type = 'application/ld+json'; document.head.appendChild(tag); }
          tag.textContent = data ? JSON.stringify(data) : '';
        } catch {}
      } catch (err) {
        sermonsWrap.innerHTML = '<div class="card"><div class="card-body"><p>No se pudieron cargar las prédicas.</p></div></div>';
        sermonsWrap.removeAttribute('aria-busy');
        announce('Error al cargar las prédicas');
      }
    };
  
  // renderMarkdownWithBlocks y helpers ya están definidos arriba

    (async () => {
      try {
        const res = await fetch('predicas/index.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('No se pudo cargar el listado de prédicas');
        const items = await res.json();
        renderSermons(items);
      } catch (e) {
        // Fallback para apertura local (file://) sin servidor
        if (Array.isArray(window.SERMONS)) {
          renderSermons(window.SERMONS);
        } else {
          sermonsWrap.innerHTML = '<div class="card"><div class="card-body"><p>No se pudieron cargar las prédicas. Abre el sitio con un servidor o actualiza la página.</p></div></div>';
          sermonsWrap.removeAttribute('aria-busy');
          announce('No se pudieron cargar las prédicas');
        }
      }
    })();
  }

  // Delegación: toggle de semanas (mostrar/ocultar días)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.week-toggle');
    if (!btn) return;
    const id = btn.getAttribute('aria-controls');
    if (!id) return;
    const panel = document.getElementById(id);
    if (!panel) return;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    panel.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.textContent = isOpen ? 'Ver días' : 'Ocultar días';
    // Al abrir por primera vez, intentar mejorar los títulos de cada día leyendo el .md
    if (!isOpen && !panel.dataset.enhanced) {
      panel.dataset.enhanced = 'true';
      btn.setAttribute('aria-busy', 'true');
      improveDayTitlesFromMarkdown(panel).finally(() => btn.removeAttribute('aria-busy'));
    }
  });

  // Visor de Devocionales (Markdown en modal)
  const ensureDevoViewer = () => {
    let modal = document.getElementById('devo-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'devo-modal';
      modal.className = 'modal';
      modal.setAttribute('hidden', '');
      modal.innerHTML = `
        <div class="modal-backdrop" data-close></div>
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-label="Devocional">
          <button class="modal-close" type="button" aria-label="Cerrar" data-close>×</button>
          <div class="modal-title"></div>
          <div class="modal-body prose"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    const body = modal.querySelector('.modal-body');
    const title = modal.querySelector('.modal-title');
    const dialog = modal.querySelector('.modal-dialog');
    let lastFocused = null;

    const getFocusables = () => {
      const sel = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
      return Array.from(dialog.querySelectorAll(sel)).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    };
    const show = (html, t) => {
      if (t) title.innerHTML = `<h3>${t}</h3>`; else title.innerHTML = '';
      body.innerHTML = html;
      modal.classList.add('show');
      modal.removeAttribute('hidden');
      // Evitar scroll del body
      document.documentElement.style.overflow = 'hidden';
      // Focus management
      lastFocused = document.activeElement;
      const closeBtn = modal.querySelector('.modal-close');
      const focusables = getFocusables();
      if (focusables.length === 0) dialog.setAttribute('tabindex', '-1');
      setTimeout(() => {
        try {
          (closeBtn || focusables[0] || dialog).focus();
        } catch {}
      }, 0);
      announce('Devocional abierto');
    };
    const hide = () => {
      modal.classList.remove('show');
      modal.setAttribute('hidden', '');
      document.documentElement.style.overflow = '';
      announce('Devocional cerrado');
      // Restaurar foco
      try { if (lastFocused && document.contains(lastFocused)) lastFocused.focus(); } catch {}
    };
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) hide();
    });
    if (!modal.dataset.trap) {
      modal.dataset.trap = '1';
      modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const f = getFocusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    return { show, hide };
  };

  // Utilidad: limpiar texto de devocional (eliminar BOM, invisibles, normalizar y corregir mojibake)
  const cleanDevocionalText = (input) => {
    if (typeof input !== 'string') return '';

    // 1. Normalizar saltos de línea
    let s = input.replace(/\r\n?/g, '\n');

    // 2. Eliminar BOM y caracteres de control no deseados
    s = s.replace(/^[\uFEFF\u200B-\u200F\u2060-\u206F]+/g, '');

    // 3. Normalizar espacios no rompibles (preservar saltos de línea)
    // No uses \s aquí porque colapsa los \n y rompe el Markdown por líneas
    s = s.replace(/[\u00A0\u202F\u2007]/g, ' ');

    // 4. Eliminar caracteres de control (excepto tab y newline)
    s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // 5. Normalizar Unicode (NFC)
  try { 
    s = s.normalize('NFC'); 
  } catch (e) { 
    console.warn('Error normalizando texto:', e);
  }

  // 6. Limpiar caracteres especiales al inicio/fin de línea
  s = s.split('\n').map(line => 
    line.replace(/^[\s\u200B-\u200F\u2060-\u206F]+/, '')
        .replace(/[\s\u200B-\u200F\u2060-\u206F]+$/, '')
  ).join('\n');

  // 7. Eliminar líneas vacías al inicio/fin
  return s.replace(/^\s+|\s+$/g, '');
};

  // Mejora de títulos de días leyendo el Markdown (top-level para uso desde cualquier sección)
  const improveDayTitlesFromMarkdown = async (panel) => {
    const weekShort = panel.dataset.weekShort || '';
    const links = qsa('a.devo-open[data-day]', panel);
    await Promise.all(links.map(async (a) => {
      try {
        const url = a.getAttribute('data-src');
        const day = parseInt(a.getAttribute('data-day'), 10) || 0;
        if (!url || !day) return;
        const cacheKey = `${url}#${day}`;
        let subtitle = daySubtitleCache.get(cacheKey);
        if (!subtitle) {
          const raw = await fetchDevoMarkdown(url);
          const cleaned = cleanDevocionalText(raw);
          subtitle = extractDaySubtitle(cleaned, day) || extractMainHeading(cleaned) || '';
          subtitle = cleanInlineTitle(subtitle);
          if (subtitle) daySubtitleCache.set(cacheKey, subtitle);
        }
        const dayLabel = `Día ${day}`;
        if (subtitle) {
          const withEmoji = subtitle.trim().startsWith('📖') ? subtitle.trim() : `📖 ${subtitle.trim()}`;
          const composed = `${dayLabel} — ${withEmoji}`;
          a.textContent = composed;
          a.setAttribute('data-title', composed);
        }
      } catch {}
    }));
  };

  // Decoración visual: añadir emojis según contenido (solo visual en modal)
  const decorateDevoHTML = (html) => {
    if (!html) return html;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;

    const startsWithEmoji = (t) => /^\p{Extended_Pictographic}/u.test(String(t).trimStart());

    // Encabezados: reglas por título
    const headingRules = [
      { re: /^enfoque\b/i, emoji: '🎯 ' },
      { re: /^preguntas? clave\b/i, emoji: '🔑 ' },
      { re: /^texto clave\b/i, emoji: '📌 ' },
      { re: /^aplicaci[óo]n semanal\b/i, emoji: '🗓️ ' },
      { re: /^oraci[óo]n\b/i, emoji: '🙏 ' },
      { re: /^lectura\b/i, emoji: '📖 ' },
    ];

    const prependEmojiNode = (node, emojiStr) => {
      if (!node) return;
      const first = node.firstChild;
      if (first && first.nodeType === Node.TEXT_NODE) {
        first.nodeValue = `${emojiStr}${first.nodeValue.replace(/^\s+/, ' ')}`;
      } else {
        node.insertBefore(document.createTextNode(emojiStr), node.firstChild);
      }
    };

    // Primer heading: si menciona Día y no tiene emoji al inicio, añadir 📖
    const allHeadings = wrap.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (allHeadings.length) {
      const h0 = allHeadings[0];
      const t = h0.textContent || '';
      if (/\bd[ií]a\b/i.test(t) && !startsWithEmoji(t)) {
        prependEmojiNode(h0, '📖 ');
      }
    }

    // Otras reglas por encabezado
    allHeadings.forEach(h => {
      const text = h.textContent || '';
      if (startsWithEmoji(text)) return;
      const m = headingRules.find(r => r.re.test(text.trim()));
      if (m) prependEmojiNode(h, m.emoji);
    });

    // Preguntas: líneas que inician con signo de apertura español
    wrap.querySelectorAll('p, li, h3, h4').forEach(el => {
      const t = (el.textContent || '').trimStart();
      if (t.startsWith('¿') && !startsWithEmoji(t)) {
        prependEmojiNode(el, '❓ ');
      }
    });

    // Listas: mapear palabras clave a emojis
    const liRules = [
      { re: /ciudad(es)?/i, emoji: '🏰' },
      { re: /m[úu]sica|canto|salmo/i, emoji: '🎵' },
      { re: /metalurgia|herramienta|forja|bronce|hierro|plata/i, emoji: '🛠️' },
      { re: /ganader[ií]a|ovejas?|vacas?|rebaño/i, emoji: '🐑' },
      { re: /violencia|guerra|pelea|matar|asesin/i, emoji: '⚔️' },
      { re: /pecado|maldad|ca[ií]n\b/i, emoji: '💀' },
      { re: /oraci[óo]n|invocar/i, emoji: '🙏' },
      { re: /bendici[óo]n|bendecir/i, emoji: '💫' },
      { re: /vida|longevidad|años?|edad/i, emoji: '📅' },
      { re: /familia|linaje|genealog[ií]a/i, emoji: '👨‍👩‍👧‍👦' },
      { re: /dios|señor|cristo/i, emoji: '✝️' },
      { re: /creaci[óo]n|tierra|mundo|naturaleza/i, emoji: '🌍' },
    ];

    wrap.querySelectorAll('li').forEach(li => {
      const text = li.textContent || '';
      if (startsWithEmoji(text)) return;
      const matches = [];
      liRules.forEach(rule => { if (rule.re.test(text)) matches.push(rule.emoji); });
      if (matches.length) {
        const unique = Array.from(new Set(matches)).slice(0, 3).join(' ');
        prependEmojiNode(li, unique + ' ');
      }
    });

    return wrap.innerHTML;
  };


  // Delegación: abrir devocional en modal y renderizar Markdown
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('a.devo-open');
    if (!a) return;
    // Permitir Ctrl/Cmd click para abrir en nueva pestaña nativa
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    e.preventDefault();
    const src = a.getAttribute('data-src');
    const title = a.getAttribute('data-title') || 'Devocional';
    const week = Number(a.getAttribute('data-week') || 0);
    const dayNum = Number(a.getAttribute('data-day') || 0);
    if (!src) return;
    const viewer = (window.MCM && window.MCM.modal && typeof window.MCM.modal.ensure === 'function')
      ? window.MCM.modal.ensure()
      : ensureDevoViewer();
    try {
      const text = await fetchDevoMarkdown(src);
      const cleaned = cleanDevocionalText(text);
      const raw = renderMarkdownWithBlocks(cleaned);
      const html = (window.DOMPurify ? window.DOMPurify.sanitize(raw) : raw);
      const shouldDecorate = (week === 1 && dayNum >= 2 && dayNum <= 5);
      const decorated = shouldDecorate ? decorateDevoHTML(html) : html;
      viewer.show(decorated, title);
    } catch (err) {
      // En vez de abrir una nueva pestaña, mostramos un mensaje en el modal
      const msg = `No se pudo cargar el contenido. Si estás abriendo el sitio como archivo (file://), inicia un servidor local y vuelve a intentar.`;
      const help = `
        <div class="notice">
          <p>Ejemplos:</p>
          <pre><code>python -m http.server 8080</code></pre>
          <pre><code>npx serve -l 8080</code></pre>
          <p>Luego abre: <code>http://localhost:8080/</code></p>
        </div>`;
      viewer.show(`<div class="error">${msg}</div>${help}`, title);
    }
  });

  // Extrae un título de semana a partir de la URL del .md
  const extractWeekTitle = (url, w) => {
    try {
      const u = (() => { try { return decodeURI(String(url || '')); } catch { return String(url || ''); } })();
      const path = u.split(/[?#]/)[0];
      const segs = path.split('/').filter(Boolean).map(s => s.trim());
      // Buscar segmento que contenga "Semana <w>"
      const lower = `semana ${w}`;
      let hit = segs.find(s => s.toLowerCase().includes(lower));
      if (!hit && segs.length >= 2) {
        // Suele estar en el penúltimo segmento (carpeta de la semana)
        hit = segs[segs.length - 2];
      }
      if (!hit) return `Semana ${w}`;
      // Limpiar extensión, ids de notion y espacios raros
      let cleaned = hit.replace(/\.[a-z0-9]+$/i, '')
                       .replace(/\s+[0-9a-f]{32}$/i, '')
                       .replace(/\s{2,}/g, ' ')
                       .trim();
      // Asegurar prefijo "Semana N" si no lo tiene
      if (!/^Semana\s+\d+/i.test(cleaned)) cleaned = `Semana ${w} — ${cleaned}`;
      return cleaned;
    } catch {
      return `Semana ${w}`;
    }
  };

  // Carga dinámica de devocionales desde devocionales/index.json
  const devosWrap = qs('.devos[data-dynamic]');
  if (devosWrap) {
    devosWrap.setAttribute('aria-busy', 'true');
    renderSkeletonCards(devosWrap, 4);
    announce('Cargando devocionales…');
    const renderDevos = (list = []) => {
      try {
        const items = Array.isArray(list) ? [...list] : [];
        // Agrupar por semana
        const byWeek = new Map();
        items.forEach(d => {
          if (!d || typeof d !== 'object') return;
          const wNum = Number(d.week);
          const w = Number.isNaN(wNum) ? 0 : wNum || 0;
          if (!byWeek.has(w)) byWeek.set(w, []);
          byWeek.get(w).push(d);
        });
        const weeks = Array.from(byWeek.keys()).sort((a, b) => a - b);
        const html = weeks.map(w => {
          try {
            const days = Array.isArray(byWeek.get(w)) ? byWeek.get(w) : [];
            // Ordenar días por número ascendente o por fecha si no hay día
            days.sort((a, b) => {
              const ad = Number(a?.day), bd = Number(b?.day);
              if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) return ad - bd;
              return String(a?.date || '').localeCompare(String(b?.date || ''));
            });
            const sample = days.find(d => d && d.url);
            const weekTitle = sample ? extractWeekTitle(sample.url, w) : `Semana ${w}`;
            const weekShort = weekTitle.replace(/^Semana\s+\d+\s*[-:–—]?\s*/i, '').trim() || `Semana ${w}`;
            const listItems = days.map(d => {
              try {
                const rawTitle = String(d?.title || weekShort || `Semana ${w}`);
                const title = rawTitle.replace(/^\s*#{1,6}\s*/, '').trim();
                const dayLabel = Number(d?.day) ? `Día ${d.day}` : (d?.date ? d.date : 'Ver');
                const lowerTitle = title.toLowerCase().trim();
                const isGeneric = /semana\s+\d+/i.test(title) || /^d[ií]a\s+\d+/.test(lowerTitle) || /devocional\s+g[ée]nesis/.test(lowerTitle);
                const displayTitle = isGeneric ? weekShort : title;
                const displayTitleEmoji = displayTitle.trim().startsWith('📖') ? displayTitle : `📖 ${displayTitle}`;
                const linkText = `${dayLabel} — ${displayTitleEmoji}`;
                const dataTitle = displayTitleEmoji.replace(/"/g, '&quot;');
                const urlStr = d?.url ? String(d.url) : '';
                const safeHref = urlStr ? encodeURI(urlStr) : '';
                return `
                  <li>
                    ${safeHref ? `<a href="${safeHref}" class="devo-open" data-src="${safeHref}" data-week="${w}" data-day="${Number(d?.day) || ''}" data-title="${dataTitle}">${linkText}</a>` : `<span>${linkText}</span>`}
                  </li>
                `;
              } catch {
                const fallbackLabel = Number(d?.day) ? `Día ${d.day}` : 'Ver';
                return `<li><span>${fallbackLabel} — 📖 ${weekShort}</span></li>`;
              }
            }).join('');
            const weekId = `week-${w}`;
            return `
              <article class="card reveal in week">
                <div class="card-body">
                  <h3>${weekTitle}</h3>
                  <button class="btn btn-ghost week-toggle" aria-expanded="false" aria-controls="${weekId}">Ver días</button>
                  <div id="${weekId}" class="week-days" hidden data-week="${w}" data-week-short="${weekShort.replace(/\"/g, '&quot;')}">
                    <ul class="week-day-list">${listItems}</ul>
                  </div>
                </div>
              </article>
            `;
          } catch {
            return `
              <article class="card reveal in week">
                <div class="card-body">
                  <h3>Semana ${w}</h3>
                  <p>No se pudo mostrar esta semana.</p>
                </div>
              </article>
            `;
          }
        }).join('');
        devosWrap.innerHTML = html || '<div class="card"><div class="card-body"><p>No hay devocionales disponibles por ahora.</p></div></div>';
        devosWrap.removeAttribute('aria-busy');
        announce(items.length ? `Se cargaron ${items.length} semanas de devocionales` : 'No hay devocionales disponibles');
        loadModuleOnce('js/modules/lazy.js').then(() => { try { window.MCM && window.MCM.lazy && window.MCM.lazy.init(devosWrap); } catch {} });
        // Auto-mejorar títulos de días para semanas 1 a 8 (con guard)
        const panels = qsa('.week-days', devosWrap);
        const enhancer = (typeof improveDayTitlesFromMarkdown === 'function') ? improveDayTitlesFromMarkdown : null;
        panels.forEach(panel => {
          const wk = Number(panel.dataset.week || 0);
          if (wk >= 1 && wk <= 8 && !panel.dataset.enhanced) {
            panel.dataset.enhanced = 'true';
            if (enhancer) enhancer(panel).catch(() => {});
          }
        });
      } catch (err) {
        try { console.error('renderDevos() error:', err); } catch {}
        devosWrap.innerHTML = '<div class="card"><div class="card-body"><p>No se pudieron cargar los devocionales.</p></div></div>';
        devosWrap.removeAttribute('aria-busy');
        announce('Error al cargar los devocionales');
      }
    };
    (async () => {
      try {
        const res = await fetch('devocionales/index.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('No se pudo cargar el listado de devocionales');
        const items = await res.json();
        renderDevos(items);
      } catch (e) {
        try { console.warn('Fallo al cargar devocionales/index.json:', e); } catch {}
        if (Array.isArray(window.DEVOCIONALES)) {
          try {
            renderDevos(window.DEVOCIONALES);
          } catch (e2) {
            try { console.error('renderDevos() falló con DEVOCIONALES embebidos:', e2); } catch {}
            devosWrap.innerHTML = '<div class="card"><div class="card-body"><p>No se pudieron cargar los devocionales.</p></div></div>';
            devosWrap.removeAttribute('aria-busy');
            announce('No se pudieron cargar los devocionales');
          }
        } else {
          devosWrap.innerHTML = '<div class="card"><div class="card-body"><p>No se pudieron cargar los devocionales. Abre el sitio con un servidor o actualiza la página.</p></div></div>';
          devosWrap.removeAttribute('aria-busy');
          announce('No se pudieron cargar los devocionales');
        }
      }
    })();
  }

  // Slider testimonios
  qsa('[data-slider]').forEach(slider => {
    const prev = qs('.slider-prev', slider);
    const next = qs('.slider-next', slider);
    const track = qs('.slides', slider);
    // Accesibilidad
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-label', 'Testimonios');
    slider.setAttribute('tabindex', '0');

    const step = () => Math.max(200, track.clientWidth - 120);
    const scroll = dir => track && track.scrollBy({ left: dir * step(), behavior: 'smooth' });

    prev && prev.addEventListener('click', () => scroll(-1));
    next && next.addEventListener('click', () => scroll(1));

    // Teclado
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); scroll(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scroll(1); }
    });
  });

  // Temas: carga dinámica + filtro por chips
  const temasGrid = qs('#temas .topic-grid[data-dynamic]');
  const chipContainer = qs('#temas .chips');
  const chips = qsa('#temas .chip');
  const applyTemasFilter = (filter) => {
    // Actualizar estado visual de chips
    chips.forEach(ch => {
      const active = (ch.dataset.filter || 'all') === filter;
      ch.classList.toggle('active', active);
      ch.setAttribute('aria-selected', String(active));
    });
    // Filtrar tarjetas actuales (si ya existen)
    if (temasGrid) {
      qsa('[data-topic]', temasGrid).forEach(card => {
        const show = filter === 'all' || (card.dataset.topic || '') === filter;
        card.hidden = !show;
      });
    }
  };
  if (chipContainer && chips.length) {
    chips.forEach(chip => {
      const go = () => applyTemasFilter(chip.dataset.filter || 'all');
      chip.addEventListener('click', go);
      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
      chip.setAttribute('aria-selected', String(chip.classList.contains('active')));
    });
  }

  if (temasGrid) {
    temasGrid.setAttribute('aria-busy', 'true');
    renderSkeletonCards(temasGrid, 4);
    const renderTemas = (list = []) => {
      try {
        const items = Array.isArray(list) ? [...list] : [];
        // Ordenar por categoría y luego por title
        const orderCat = ['niños','jóvenes','hombres','mujeres','general'];
        items.sort((a,b) => {
          const ai = orderCat.indexOf(String(a.category||'').toLowerCase());
          const bi = orderCat.indexOf(String(b.category||'').toLowerCase());
          return (ai - bi) || String(a.title||'').localeCompare(String(b.title||''));
        });
        const html = items.map(t => {
          const cat = String(t.category || '').toLowerCase();
          const id = String(t.id || '').trim();
          const title = String(t.title || 'Tema');
          const summary = String(t.summary || '');
          const src = String(t.content || '');
          const catLabel = (
            cat === 'niños' ? 'Niños' :
            cat === 'jóvenes' ? 'Jóvenes' :
            cat === 'hombres' ? 'Hombres' :
            cat === 'mujeres' ? 'Mujeres' :
            'General'
          );
          const safeId = id || `${cat}-${title.replace(/\s+/g,'-').toLowerCase()}`;
          return `
            <article class="card reveal in" data-topic="${cat}" data-id="${safeId}">
              <div class="card-body">
                <div class="eyebrow">${catLabel}</div>
                <h3>${title}</h3>
                ${summary ? `<p class="summary">${summary}</p>` : ''}
                <a href="#" class="btn btn-ghost devo-open" data-src="${src}" data-title="${title}">Leer tema</a>
              </div>
            </article>
          `;
        }).join('');
        temasGrid.innerHTML = html || '<div class="card"><div class="card-body"><p>No hay temas disponibles por ahora.</p></div></div>';
        temasGrid.removeAttribute('aria-busy');
        announce(items.length ? `Se cargaron ${items.length} temas` : 'No hay temas disponibles');
        loadModuleOnce('js/modules/lazy.js').then(() => { try { window.MCM && window.MCM.lazy && window.MCM.lazy.init(temasGrid); } catch {} });
        // Aplicar filtro actual (chip activo)
        const active = (chips.find ? chips.find(c => c.classList.contains('active')) : Array.from(chips).find(c => c.classList.contains('active')));
        applyTemasFilter(active ? (active.dataset.filter || 'all') : 'all');
      } catch (err) {
        try { console.error('renderTemas() error:', err); } catch {}
        temasGrid.innerHTML = '<div class="card"><div class="card-body"><p>No se pudieron cargar los temas.</p></div></div>';
        temasGrid.removeAttribute('aria-busy');
        announce('Error al cargar los temas');
      }
    };
    (async () => {
      const tryFetchJSON = async (url) => {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      };
      const candidates = [
        'temas/index.json',
        './temas/index.json',
        (() => { try { return encodeURI('temas/index.json'); } catch { return 'temas/index.json'; } })(),
        (() => { try { return encodeURI('./temas/index.json'); } catch { return './temas/index.json'; } })(),
      ];
      try {
        let data = null, lastErr = null;
        for (const u of candidates) {
          try { data = await tryFetchJSON(u); break; } catch (err) { lastErr = err; }
        }
        if (!data) throw lastErr || new Error('No data');
        renderTemas(data);
      } catch (e) {
        try { console.warn('Fallo al cargar Temas (index.json):', e); } catch {}
        if (Array.isArray(window.TEMAS)) {
          renderTemas(window.TEMAS);
        } else {
          temasGrid.innerHTML = '<div class="card"><div class="card-body"><p>No se pudieron cargar los temas. Abre el sitio con un servidor o actualiza la página.</p></div></div>';
          temasGrid.removeAttribute('aria-busy');
          announce('No se pudieron cargar los temas');
        }
      }
    })();
  }

  // Utilidades: convertir texto plano de prédica a HTML estructurado
  const ensureSermonBody = (panel) => {
    let body = panel.querySelector('.sermon-body');
    if (!body) {
      body = document.createElement('div');
      body.className = 'sermon-body';
      panel.appendChild(body);
    }
    return body;
  };

  const renderSermonTextAsHTML = (text, panel) => {
    const body = ensureSermonBody(panel);
    body.innerHTML = '';
    const el = (tag, txt) => { const n = document.createElement(tag); if (txt) n.textContent = txt; return n; };
    // Parser simple por secciones
    const lines = String(text || '').split(/\r?\n/);
    let title = '';
    const sections = { keys: [], outline: [], apply: [] };
    let mode = '';
    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      if (line.toLowerCase().startsWith('titulo:')) {
        title = line.slice(line.indexOf(':') + 1).trim();
        mode = '';
        return;
      }
      if (line.toLowerCase().startsWith('texto clave:')) { mode = 'keys'; return; }
      if (line.toLowerCase().startsWith('bosquejo:')) { mode = 'outline'; return; }
      if (line.toLowerCase().startsWith('aplicación semanal:') || line.toLowerCase().startsWith('aplicacion semanal:')) { mode = 'apply'; return; }
      if (line.startsWith('- ')) {
        const t = line.replace(/^-\s+/, '');
        if (mode && sections[mode]) sections[mode].push(t);
        return;
      }
      // Líneas sueltas: si están en keys, unir como una sola frase
      if (mode === 'keys') {
        sections.keys.push(line);
      }
    });

    if (title) body.appendChild(el('h4', title));
    if (sections.keys.length) {
      body.appendChild(el('h4', 'Texto clave'));
      const p = el('p', sections.keys.join(' '));
      body.appendChild(p);
    }
    if (sections.outline.length) {
      body.appendChild(el('h4', 'Bosquejo'));
      const ul = document.createElement('ul');
      sections.outline.forEach(item => ul.appendChild(el('li', item)));
      body.appendChild(ul);
    }
    if (sections.apply.length) {
      body.appendChild(el('h4', 'Aplicación semanal'));
      const ul = document.createElement('ul');
      sections.apply.forEach(item => ul.appendChild(el('li', item)));
      body.appendChild(ul);
    }
    if (!body.childNodes.length) {
      // Fallback: mostrar como pre-formateado si no hubieron secciones
      const pre = el('pre');
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.margin = '8px 0 0';
      pre.textContent = text || '';
      body.appendChild(pre);
    }
  };

  // Toggle de sermones + carga diferida de contenido (.txt) con delegación
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.sermon-toggle');
    if (!btn) return;
    const id = btn.getAttribute('aria-controls');
    if (!id) return;
    const panel = document.getElementById(id);
    if (!panel) return;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    panel.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.textContent = isOpen ? 'Leer desarrollo' : 'Ocultar desarrollo';

    // Al abrir, cargar el texto si no está cargado
    if (!isOpen && panel.dataset.loaded !== 'true') {
      const src = panel.dataset.src;
      if (!src) return;
      try {
        btn.disabled = true;
        const txt = await fetchTextUTF8(src);
        renderSermonTextAsHTML(txt, panel);
        panel.dataset.loaded = 'true';
      } catch (err) {
        // Fallback local: usar contenido embebido si existe
        try {
          const contents = window.SERMON_CONTENTS || {};
          const candidates = [src];
          try { candidates.push(decodeURI(src)); } catch {}
          const fallback = candidates.map(k => contents[k]).find(Boolean);
          if (fallback) {
            renderSermonTextAsHTML(fallback, panel);
            panel.dataset.loaded = 'true';
            return;
          }
        } catch {}
        let errBox = panel.querySelector('.error');
        if (!errBox) {
          errBox = document.createElement('div');
          errBox.className = 'error';
          errBox.style.color = '#b00020';
          errBox.style.marginTop = '8px';
          panel.appendChild(errBox);
        }
        errBox.textContent = 'No se pudo cargar el contenido de la prédica.';
      } finally {
        btn.disabled = false;
      }
    }
  });

  // Header: animación estilo Airbnb (intro + flotación ligera)
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headerIcons = qsa('.primary-nav .menu .nav-icon');
  if (headerIcons.length) {
    headerIcons.forEach((icon, i) => {
      if (!reduceMotion) {
        icon.classList.add('intro');
        icon.style.animationDelay = `${i * 90}ms`;
        icon.addEventListener('animationend', () => {
          icon.classList.remove('intro');
          icon.classList.add('float');
          icon.style.animationDelay = '';
        }, { once: true });
      } else {
        // Sin animaciones, aplicar estado final
        icon.classList.remove('intro');
        icon.classList.add('float');
      }
    });
  }

  // Scrollspy: resaltar enlace activo con subrayado animado
  const navLinks = qsa('.primary-nav .menu a');
  const idToLink = new Map();
  navLinks.forEach(a => {
    if (a.hash) {
      const id = a.hash.slice(1);
      const sec = document.getElementById(id);
      if (sec) idToLink.set(id, a);
    }
  });
  if ('IntersectionObserver' in window && idToLink.size) {
    const spinIcon = (link) => {
      if (reduceMotion || !link) return;
      const icon = link.querySelector('.nav-icon');
      if (!icon) return;
      icon.classList.add('celebrate');
      const cleanup = () => icon.classList.remove('celebrate');
      icon.addEventListener('animationend', cleanup, { once: true });
      // Fallback por si no dispara animationend
      setTimeout(() => icon.classList.remove('celebrate'), 1000);
    };

    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        const active = idToLink.get(id);
        if (!active) return;
        navLinks.forEach(l => l.classList.remove('active'));
        active.classList.add('active');
        spinIcon(active);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
    idToLink.forEach((_, id) => {
      const sec = document.getElementById(id);
      sec && spy.observe(sec);
    });
  }

  // Flair: giros aleatorios ocasionales
  if (!reduceMotion && headerIcons.length) {
    const scheduleRandom = () => {
      const delay = 6000 + Math.random() * 6000; // 6-12s
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          const icon = headerIcons[Math.floor(Math.random() * headerIcons.length)];
          if (icon) {
            icon.classList.add('celebrate');
            icon.addEventListener('animationend', () => icon.classList.remove('celebrate'), { once: true });
            setTimeout(() => icon.classList.remove('celebrate'), 1000);
          }
        }
        scheduleRandom();
      }, delay);
    };
    scheduleRandom();
    document.addEventListener('visibilitychange', () => {
      // No acción específica; el bucle ya verifica visibilityState.
    });
  }

  // Inicialización global de mejoras (por si hay audios/elementos lazy ya presentes)
  tryESM('/js/modules/modal.js');
  tryESM('/js/modules/a11y.js').then(() => {
    try { window.MCM && window.MCM.a11y && window.MCM.a11y.init(document); } catch {}
  });
  tryESM('/js/modules/lazy.js').then(() => {
    try { window.MCM && window.MCM.lazy && window.MCM.lazy.init(document); } catch {}
  });
  tryESM('/js/modules/audio.js').then(() => {
    try { window.MCM && window.MCM.audio && window.MCM.audio.enhanceAudios(document); } catch {}
  });
})();