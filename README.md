# Misión Carismática al Mundo Buga — SPA

Sitio estático optimizado con mejoras de accesibilidad, desempeño y SEO. Compatible con `file://` y servidores HTTP(S).

## Características clave
- Modular: `js/modules/modal.js`, `js/modules/lazy.js` (+ `window.MCM.*`).
- Carga progresiva de módulos: `tryESM()` bajo HTTPS + fallback clásico para `file://`.
- Lazy loading con `IntersectionObserver` y `MutationObserver` (contenido dinámico).
- Modal accesible: trap de foco, `Esc`, retorno de foco, `aria-live`.
- PWA opcional: `service-worker.js` cachea shell/índices (excluye audio).
- SEO mejorado: metadatos Open Graph, Twitter Card, `Organization` JSON-LD.

## Banderas de configuración
- `window.ENABLE_PWA` (bool): registra el Service Worker cuando es `true` (solo HTTP(S)).
- `window.USE_ESM` (bool): habilita carga ESM con `<script type="module">` cuando es `true` y el origen es HTTPS.

Ejemplos para activarlas (en consola):
```js
window.ENABLE_PWA = true;
window.USE_ESM = true; // requiere HTTPS
location.reload();
```

## Desarrollo y pruebas
- Abrir directamente con `file://` para verificar compatibilidad sin servidor.
- Servir localmente para PWA/Lighthouse (ejemplo):
```bash
npx http-server . -p 4173
```
- Checklist en `TESTING.md` (accesibilidad, performance, PWA, SEO, regresiones).

## Estructura relevante
- `index.html`: landing, metadatos SEO, CSS crítico inline, registro opcional de SW.
- `css/styles.css`: estilos completos, `.reveal`, estados de foco/hover.
- `js/main.js`: inicialización, loaders progresivos, bootstrap de módulos.
- `js/modules/modal.js`: API `window.MCM.modal.ensure()` → `{ show(html, title), hide() }`.
- `js/modules/lazy.js`: `window.MCM.lazy.init(root)`, `window.MCM.lazy.refresh(root)`.
- `service-worker.js`: cache de shell y limpieza por versión; excluye `audio/`.

## Podcast/Plataformas desactivado
- Menú y sección comentados en `index.html`.
- Para reactivar: descomentar el `<li>` del nav y la `<section id="podcast">`.

## Notas
- Evitamos `import()` directo en producción por compatibilidad, usando `<script type="module">` inyectado bajo HTTPS y fallback clásico.
- Si faltan funciones en `window.MCM.a11y`, la app continúa gracias a comprobaciones seguras.
