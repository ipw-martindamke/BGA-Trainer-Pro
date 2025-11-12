/* bga-trainer-pro - extracted app.js
   - Small accessibility/security hardening patches:
     * initTooltips: ensure tooltip text has role="tooltip"
     * createModal: after innerHTML, add rel="noopener noreferrer" to external links
     * stats toggle: update aria-expanded attribute when toggling dashboard
   - Other logic unchanged (LearningManager, debounced persistence etc.)
*/

(function () {
  'use strict';

  // ======= Utilities =======
  const safeLocalStorage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { console.warn('localStorage get failed', e); return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); return true; } catch (e) { console.warn('localStorage set failed', e); return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); return true; } catch (e) { console.warn('localStorage remove failed', e); return false; }
    }
  };

  function scheduleSave(fn) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout: 1000 });
    } else {
      setTimeout(fn, 250);
    }
  }

  function debounce(fn, wait = 200) {
    let t = null;
    return (...args) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // ======= LearningManager (improved persistence) =======
  const LearningManager = {
    STORAGE_KEY: 'bga_trainer_learning_profile',
    profile: null,

    init() {
      const stored = safeLocalStorage.get(this.STORAGE_KEY);
      if (stored) {
        try {
          this.profile = JSON.parse(stored);
          if (!Array.isArray(this.profile.attempts)) this.profile.attempts = [];
          if (!this.profile.startedAt) this.profile.startedAt = new Date().toISOString();
        } catch (e) {
          console.error('Invalid profile JSON, creating new', e);
          this.createNewProfile();
        }
      } else {
        this.createNewProfile();
      }
      return this.profile;
    },

    createNewProfile() {
      this.profile = { startedAt: new Date().toISOString(), attempts: [], totalCases: 0, correctCases: 0 };
      this._saveImmediate();
    },

    _saveImmediate() { safeLocalStorage.set(this.STORAGE_KEY, JSON.stringify(this.profile)); },

    _saveDeferred: debounce(function () {
      scheduleSave(() => {
        safeLocalStorage.set(LearningManager.STORAGE_KEY, JSON.stringify(LearningManager.profile));
      });
    }, 300),

    saveAttempt(caseId, selectedPrimary, selectedComp, correctPrimary, correctComp, mode) {
      const isCorrect = (selectedPrimary === correctPrimary && selectedComp === correctComp);
      const attempt = { caseId, selectedPrimary, selectedComp, correctPrimary, correctComp, isCorrect, mode, ts: new Date().toISOString() };
      this.profile.attempts.push(attempt);
      this.profile.totalCases = (this.profile.totalCases || 0) + 1;
      if (isCorrect) this.profile.correctCases = (this.profile.correctCases || 0) + 1;
      this._saveDeferred();
      return attempt;
    },

    getBasicStats() {
      const totalAttempts = (this.profile && this.profile.attempts) ? this.profile.attempts.length : 0;
      const uniqueCasesWorked = new Set((this.profile.attempts || []).map(a => a.caseId)).size;
      const correct = (this.profile.correctCases || 0);
      return { totalAttempts, uniqueCasesWorked, correctCases: correct };
    },

    reset() { this.createNewProfile(); safeLocalStorage.remove(this.STORAGE_KEY); return true; }
  };

  // ======= Accessible Modal Helper (small hardening) =======
  function createModal({ title = '', content = '', closeLabel = 'Schließen' } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'bga-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const dialog = document.createElement('div');
    dialog.className = 'bga-modal';
    dialog.style.cssText = 'background:#fff;padding:20px;border-radius:12px;max-width:800px;width:90%;max-height:90vh;overflow:auto;position:relative;';
    dialog.setAttribute('tabindex', '-1');

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '12px';

    const h2 = document.createElement('h2');
    h2.textContent = title;
    h2.id = 'modal-title-' + Math.random().toString(36).slice(2,9);
    dialog.setAttribute('aria-labelledby', h2.id);

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.innerHTML = '&times;';
    btnClose.setAttribute('aria-label', closeLabel);
    btnClose.style.cssText = 'font-size:22px;background:none;border:0;cursor:pointer;color:#6b7280;';

    header.appendChild(h2);
    header.appendChild(btnClose);

    const body = document.createElement('div');
    body.innerHTML = content;

    // Security: ensure any external links opened in new tab have rel to prevent opener attacks
    try {
      const externalAnchors = body.querySelectorAll('a[target="_blank"]');
      externalAnchors.forEach(a => {
        const existingRel = a.getAttribute('rel') || '';
        if (!/noopener/i.test(existingRel)) existingRel ? a.setAttribute('rel', existingRel + ' noopener noreferrer') : a.setAttribute('rel', 'noopener noreferrer');
      });
    } catch (e) {
      // if content is not parseable, ignore (defensive)
      console.warn('createModal: failed to adjust external anchors', e);
    }

    const footer = document.createElement('div');
    footer.style.marginTop = '16px';
    footer.style.textAlign = 'right';
    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.textContent = closeLabel;
    okBtn.className = 'btn btn-primary';
    okBtn.style.marginLeft = '8px';
    footer.appendChild(okBtn);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);

    const previouslyFocused = document.activeElement;

    function trapFocus(e) {
      const focusable = dialog.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      } else if (e.key === 'Escape') { close(); }
    }

    function close() {
      document.removeEventListener('keydown', trapFocus);
      overlay.remove();
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    }

    btnClose.addEventListener('click', close);
    okBtn.addEventListener('click', close);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });

    document.addEventListener('keydown', trapFocus);
    setTimeout(() => { document.body.appendChild(overlay); dialog.focus(); }, 0);

    return { overlay, dialog, close };
  }

  // ======= Accessible Tooltips (small improvement) =======
  function initTooltips() {
    const triggers = document.querySelectorAll('.tooltip');
    triggers.forEach((t, idx) => {
      const textEl = t.querySelector('.tooltip-text');
      if (!textEl) return;
      const id = 'bga-tooltip-' + idx;
      textEl.id = id;
      // Mark tooltip element for assistive tech
      textEl.setAttribute('role', 'tooltip');
      t.setAttribute('tabindex', '0');
      t.setAttribute('aria-describedby', id);
      t.setAttribute('role', 'button');
      const show = () => { textEl.style.visibility = 'visible'; textEl.style.opacity = '1'; };
      const hide = () => { textEl.style.visibility = 'hidden'; textEl.style.opacity = '0'; };
      t.addEventListener('focus', show);
      t.addEventListener('blur', hide);
      t.addEventListener('mouseenter', show);
      t.addEventListener('mouseleave', hide);
    });
  }

  // ======= Init =======
  document.addEventListener('DOMContentLoaded', () => {
    LearningManager.init();
    initTooltips();

    const devEl = document.getElementById('dev-mode');
    if (devEl) {
      devEl.addEventListener('click', (e) => {
        if (e.shiftKey) {
          const stats = LearningManager.getBasicStats();
          const msg = `ENTWICKLER-MODUS\n\nAktueller Speicher:\n• ${stats.totalAttempts} gespeicherte Versuche\n• ${stats.uniqueCasesWorked} verschiedene Fälle\n\nMöchtest du alle Daten löschen?\n(Nur für Testing/Entwicklung)`;
          if (confirm(msg)) { LearningManager.reset(); alert('Lernfortschritt wurde zurückgesetzt.'); location.reload(); }
        } else {
          alert('Tipp: Shift+Klick für Entwickler-Optionen');
        }
      });
    }

    // Simple stats toggle wiring (update aria-expanded)
    const statsToggle = document.getElementById('stats-toggle-btn');
    const statsDashboard = document.getElementById('stats-dashboard');
    const statsClose = document.getElementById('stats-close-btn');
    if (statsToggle && statsDashboard) {
      statsToggle.addEventListener('click', () => {
        const opened = !statsDashboard.classList.contains('hidden');
        statsDashboard.classList.toggle('hidden');
        // toggle aria-expanded
        statsToggle.setAttribute('aria-expanded', String(!opened));
        // fill basic stats
        const content = document.getElementById('stats-content');
        if (content) {
          const s = LearningManager.getBasicStats();
          content.innerHTML = `<div class="stats-grid"><div class="stat-item"><div class="stat-label">Gespeicherte Versuche</div><div class="stat-value">${s.totalAttempts}</div></div><div class="stat-item"><div class="stat-label">Verschiedene Fälle</div><div class="stat-value">${s.uniqueCasesWorked}</div></div></div>`;
        }
      });
    }
    if (statsClose) {
      statsClose.addEventListener('click', () => {
        statsDashboard.classList.add('hidden');
        if (statsToggle) statsToggle.setAttribute('aria-expanded', 'false');
      });
    }
  });

  window.BGATools = { LearningManager, createModal, scheduleSave, debounce };

})();
