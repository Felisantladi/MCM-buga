// Lightweight accessibility utilities for MCM
(function(){
  try {
    window.MCM = window.MCM || {};
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
    const init = (root = document) => {
      // Ensure live region exists
      try { ensureLiveRegion(); } catch {}
      // Optional: focus main region when navigating to #main (no DOM changes)
      try {
        const main = document.getElementById('main') || document.querySelector('main');
        if (main) {
          const focusMain = () => { try { main.setAttribute('tabindex', '-1'); main.focus(); } catch {} };
          window.addEventListener('hashchange', () => { if (location.hash === '#main') focusMain(); });
          if (location.hash === '#main') focusMain();
        }
      } catch {}
    };
    window.MCM.a11y = { init, announce };
  } catch {}
})();
