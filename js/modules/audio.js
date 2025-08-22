// Audio enhancements: keyboard shortcuts + position persistence
// Exposes window.MCM.audio.enhanceAudios(container)

window.MCM = window.MCM || {};
window.MCM.audio = window.MCM.audio || {};

(function(){
  const LS_KEY = (src) => `mcm:audio:${src || 'unknown'}`;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const seek = (audio, delta) => { try { audio.currentTime = Math.max(0, (audio.currentTime || 0) + delta); } catch {} };
  const setVol = (audio, delta) => { try { audio.volume = clamp((audio.volume ?? 1) + delta, 0, 1); } catch {} };

  const attachKeyboard = (audio) => {
    const host = audio.closest('.card, article') || audio;
    if (!host.hasAttribute('tabindex')) host.setAttribute('tabindex', '0');
    host.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const key = e.key;
      if (key === ' ' || key === 'k') { e.preventDefault(); audio.paused ? audio.play().catch(()=>{}) : audio.pause(); }
      else if (key === 'ArrowLeft') { e.preventDefault(); seek(audio, -5); }
      else if (key === 'ArrowRight') { e.preventDefault(); seek(audio, 5); }
      else if (key.toLowerCase() === 'j') { e.preventDefault(); seek(audio, -10); }
      else if (key.toLowerCase() === 'l') { e.preventDefault(); seek(audio, 10); }
      else if (key === 'ArrowUp') { e.preventDefault(); setVol(audio, 0.05); }
      else if (key === 'ArrowDown') { e.preventDefault(); setVol(audio, -0.05); }
      else if (key.toLowerCase() === 'm') { e.preventDefault(); audio.muted = !audio.muted; }
    });
  };

  const restorePosition = (audio) => {
    try {
      const src = audio.currentSrc || audio.src || audio.getAttribute('src') || '';
      const raw = localStorage.getItem(LS_KEY(src));
      if (!raw) return;
      const t = parseFloat(raw);
      if (!isNaN(t) && isFinite(t) && t > 0) {
        const apply = () => { try { audio.currentTime = t; } catch {} };
        if (audio.readyState >= 1) apply(); else audio.addEventListener('loadedmetadata', apply, { once: true });
      }
    } catch {}
  };

  const persistPosition = (audio) => {
    let last = 0;
    const tick = () => {
      try {
        const t = Math.floor(audio.currentTime || 0);
        if (t !== last) {
          last = t;
          const src = audio.currentSrc || audio.src || audio.getAttribute('src') || '';
          localStorage.setItem(LS_KEY(src), String(t));
        }
      } catch {}
    };
    audio.addEventListener('timeupdate', tick);
    audio.addEventListener('ended', () => {
      try {
        const src = audio.currentSrc || audio.src || audio.getAttribute('src') || '';
        localStorage.removeItem(LS_KEY(src));
      } catch {}
    });
  };

  window.MCM.audio.enhanceAudios = (container) => {
    try {
      const root = container || document;
      const audios = Array.from(root.querySelectorAll('audio'));
      audios.forEach((audio) => {
        attachKeyboard(audio);
        restorePosition(audio);
        persistPosition(audio);
      });
    } catch {}
  };
})();
