// Lazy reveal + media loader
// Exposes window.MCM.lazy.init(root) and window.MCM.lazy.refresh(root)

window.MCM = window.MCM || {};
window.MCM.lazy = window.MCM.lazy || {};

(function(){
  const inView = (el, cls = 'in') => el.classList.add(cls);
  const swapSrc = (el) => {
    try {
      const data = el.getAttribute('data-src');
      if (data && !el.getAttribute('src')) el.setAttribute('src', data);
      const srcset = el.getAttribute('data-srcset');
      if (srcset && !el.getAttribute('srcset')) el.setAttribute('srcset', srcset);
    } catch {}
  };

  let ioInstance = null;
  const setupIO = (root) => {
    const io = ioInstance || (('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const t = entry.target;
          if (t.classList.contains('reveal') && !t.classList.contains('in')) inView(t);
          if (t.tagName === 'IMG' || t.tagName === 'IFRAME') swapSrc(t);
          io.unobserve(t);
        }
      });
    }, { rootMargin: '80px 0px' }) : null);
    ioInstance = io;

    const candidates = Array.from(root.querySelectorAll('.reveal, img[data-src], iframe[data-src]'));
    candidates.forEach(el => {
      if (io) io.observe(el);
      else {
        // Fallback si no hay IO: aplicar inmediatamente
        if (el.classList.contains('reveal')) inView(el);
        if (el.tagName === 'IMG' || el.tagName === 'IFRAME') swapSrc(el);
      }
    });
  };

  let moBound = false;
  const bindObserver = () => {
    if (moBound || !('MutationObserver' in window)) return;
    try {
      const mo = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          m.addedNodes && m.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            // Re-scan only within added subtree
            setupIO(node);
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
      moBound = true;
    } catch {}
  };

  window.MCM.lazy.init = (container) => {
    try {
      const root = container || document;
      setupIO(root);
      bindObserver();
    } catch {}
  };

  window.MCM.lazy.refresh = (container) => {
    try { setupIO(container || document); } catch {}
  };
})();
