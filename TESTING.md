# QA Checklist

## Accessibility
- [ ] Keyboard-only navigation works across all interactive elements.
- [ ] Visible focus on `.card`, `.btn`, links, and menu items.
- [ ] Skip link moves focus to `#contenido`.
- [ ] Modal: focus trap, Esc to close, backdrop click closes, returns focus to opener.
- [ ] Aria-live announcements occur on modal open/close and main hash changes.
- [ ] Images have descriptive alt text; decorative images are ignored.

## Performance
- [ ] Critical CSS inlined renders above-the-fold content fast.
- [ ] Lazy load reveals `.reveal` elements and swaps `data-src`/`data-srcset` for media.
- [ ] MutationObserver re-initializes lazy logic for dynamic content (modal).
- [ ] Lighthouse Performance score ≥ 90 on mobile and desktop.

## PWA (optional)
- [ ] Under https and with `window.ENABLE_PWA = true`, SW registers.
- [ ] App shell and index JSONs are cached; audio files are not cached.
- [ ] Offline: home loads, devocionales/predicas lists show last cached data.

## SEO
- [ ] JSON-LD Organization present in `<head>`.
- [ ] Latest sermon `AudioObject` script generated (if feature enabled in JS).
- [ ] Meta title and description are descriptive and localized.

## Functionality
- [ ] Devocionales list loads from `devocionales/index.json`; modal renders MD safely.
- [ ] Prédicas list loads from `predicas/index.json` and embeds players lazily.
- [ ] Menu toggle works on narrow viewports.
- [ ] Podcast/Plataformas nav item and section are disabled/hidden.

## Offline via file://
- [ ] All scripts and styles load with classic loader; no module-only failures.
- [ ] Lazy loading still reveals elements without IO (fallback path).

## Regression checks
- [ ] No console errors across navigation.
- [ ] Service worker does not cache audio.
- [ ] Focus is never lost or trapped unintentionally.

## How to run
1. Serve locally (for PWA/Lighthouse): `npx http-server` (or any static server) and open via https if possible.
2. For file protocol testing, open `index.html` directly in the browser.
3. To test ESM loading, set `window.USE_ESM = true` in the console and refresh under https.
