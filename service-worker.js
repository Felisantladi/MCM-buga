/* Minimal SW: cache shell + indices (no audio) */
const VERSION = 'v1-20250821-01';
const CACHE_NAME = `mcm-cache-${VERSION}`;
const CORE = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/modules/a11y.js',
  './js/modules/lazy.js',
  './js/modules/audio.js',
  './js/modules/modal.js',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/Logo MCm.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('mcm-cache-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

const isAudio = (url) => /\.(mp3|wav|ogg)(\?|#|$)/i.test(url);

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass non-GET, cross-origin third-party fonts, and audio
  if (req.method !== 'GET' || isAudio(url.pathname)) return;

  // Cache-first for same-origin app shell and static assets
  if (url.origin === self.location.origin) {
    if (url.pathname === '/' || url.pathname.endsWith('/index.html') || CORE.some(p => url.pathname.endsWith(p.replace('./','/')))) {
      event.respondWith(caches.match(req).then(res => res || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); return r; }))); return;
    }
  }

  // Network-first for JSON indices (devocionales/predicas)
  if (/\/(devocionales|predicas)\/index\.json$/i.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        const copy = fresh.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return fresh;
      } catch {
        const cached = await caches.match(req);
        return cached || new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }

  // Default: stale-while-revalidate for same-origin GET (excluding audio)
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const fetchPromise = fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); return r; }).catch(() => undefined);
      return cached || (await fetchPromise);
    })());
  }
});
