/* ── tabs.js ────────────────────────────────────────────────────
   Dark mode tab switching: Philosophy / Journeys / Articles
   Also handles journey sub-navigation
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── Main dark-mode tabs ──────────────────────────────────────
  const tabs = document.querySelectorAll('.dark-tab');
  const panels = document.querySelectorAll('.dark-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.tab;

      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) {
        p.classList.remove('active');
        p.setAttribute('hidden', '');
        p.setAttribute('aria-hidden', 'true');
        p.style.display = '';
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById('tab-' + target);
      if (panel) {
        panel.removeAttribute('hidden');
        panel.removeAttribute('aria-hidden');
        panel.style.display = 'block';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            panel.classList.add('active');
          });
        });
      }
    });
  });

  // ── Journey sub-navigation ───────────────────────────────────
  const journeyBtns = document.querySelectorAll('.journey-subnav-btn');
  const journeyPanels = document.querySelectorAll('.journey-panel');

  journeyBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = btn.dataset.journey;

      journeyBtns.forEach(function (b) { b.classList.remove('active'); });
      journeyPanels.forEach(function (p) { p.classList.remove('active'); });

      btn.classList.add('active');

      const panel = document.getElementById('journey-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Keyboard navigation for tabs ─────────────────────────────
  document.addEventListener('keydown', function (e) {
    const darkMode = document.body.classList.contains('dark');
    if (!darkMode) return;

    const focusedTab = document.querySelector('.dark-tab:focus');
    if (!focusedTab) return;

    const tabsArr = Array.from(tabs);
    const idx = tabsArr.indexOf(focusedTab);

    if (e.key === 'ArrowRight' && idx < tabsArr.length - 1) {
      e.preventDefault();
      tabsArr[idx + 1].focus();
      tabsArr[idx + 1].click();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      tabsArr[idx - 1].focus();
      tabsArr[idx - 1].click();
    }
  });
})();
