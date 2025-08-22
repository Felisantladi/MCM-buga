// Modal viewer module for Devocionales
// Exposes window.MCM.modal.ensure() returning { show(html, title), hide() }
(function(){
  try {
    window.MCM = window.MCM || {};
    window.MCM.modal = window.MCM.modal || {};

    const ensure = () => {
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

      const announce = (msg) => { try { (window.MCM && window.MCM.a11y && window.MCM.a11y.announce) ? window.MCM.a11y.announce(msg) : (function(){ let r = document.getElementById('sr-live'); if (!r) { r = document.createElement('div'); r.id = 'sr-live'; r.className = 'sr-only'; r.setAttribute('role','status'); r.setAttribute('aria-live','polite'); document.body.appendChild(r);} r.textContent = String(msg || ''); })(); } catch {} };

      const show = (html, t) => {
        if (t) title.innerHTML = `<h3>${t}</h3>`; else title.innerHTML = '';
        body.innerHTML = html;
        try { window.MCM && window.MCM.lazy && window.MCM.lazy.refresh && window.MCM.lazy.refresh(body); } catch {}
        modal.classList.add('show');
        modal.removeAttribute('hidden');
        document.documentElement.style.overflow = 'hidden';
        lastFocused = document.activeElement;
        const closeBtn = modal.querySelector('.modal-close');
        const focusables = getFocusables();
        if (focusables.length === 0) dialog.setAttribute('tabindex', '-1');
        setTimeout(() => { try { (closeBtn || focusables[0] || dialog).focus(); } catch {} }, 0);
        announce('Devocional abierto');
      };

      const hide = () => {
        modal.classList.remove('show');
        modal.setAttribute('hidden', '');
        document.documentElement.style.overflow = '';
        announce('Devocional cerrado');
        try { if (lastFocused && document.contains(lastFocused)) lastFocused.focus(); } catch {}
      };

      if (!modal.dataset.bound) {
        modal.dataset.bound = '1';
        modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) hide(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hasAttribute('hidden')) hide(); });
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

    window.MCM.modal.ensure = ensure;
  } catch {}
})();
