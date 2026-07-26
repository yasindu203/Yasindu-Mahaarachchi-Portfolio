/* ── toggle.js ─────────────────────────────────────────────────
   Yin-Yang mode toggle: light ↔ dark
   Saves preference to localStorage
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const STORAGE_KEY = 'ym-theme';
  const body = document.body;
  const toggleBtn = document.getElementById('yy-toggle');

  // ── Init: apply saved preference ────────────────────────────
  function applyTheme(theme) {
    if (theme === 'dark') {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY) || 'light';
  applyTheme(saved);

  // ── Toggle on click ──────────────────────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const isDark = body.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';

      // Spin animation
      toggleBtn.classList.add('spinning');
      setTimeout(() => toggleBtn.classList.remove('spinning'), 650);

      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // ── Sticky nav shadow on scroll (light mode) ─────────────────
  const siteNav = document.getElementById('site-nav');
  if (siteNav) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        siteNav.classList.toggle('scrolled', !entry.isIntersecting);
      },
      { rootMargin: '-1px 0px 0px 0px', threshold: 0 }
    );
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:100%;pointer-events:none';
    document.body.insertBefore(sentinel, document.body.firstChild);
    observer.observe(sentinel);
  }

  // ── Hamburger menu (mobile) ──────────────────────────────────
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.contains('open');
      navLinks.classList.toggle('open', !isOpen);
      hamburger.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Active nav link highlighting on scroll ───────────────────
  const sections = document.querySelectorAll('.section[id], .hero[id]');
  const navLinkEls = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navLinkEls.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinkEls.forEach((link) => {
              link.style.color = '';
              link.style.background = '';
            });
            const active = document.querySelector(
              `.nav-links a[href="#${entry.target.id}"]`
            );
            if (active) {
              active.style.color = 'var(--accent)';
              active.style.background = 'var(--accent-dim)';
            }
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }
})();
