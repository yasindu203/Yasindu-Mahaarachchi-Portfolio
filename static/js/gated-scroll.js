/* ── gated-scroll.js ────────────────────────────────────────────
   Gated Pin + Horizontal Scroll System — Yasindu Mahaarachchi
   ─────────────────────────────────────────────────────────────

   SECTION TREATMENTS
   ────────────────────────────────────────────────────────────
   Education, Projects, Certifications, Leadership
     → Desktop: GSAP pin + horizontal scrub (one ScrollTrigger
                per section, scrub:1, invalidateOnRefresh:true)
     → Mobile:  Native scroll-snap horizontal carousel

   Experience (1 entry)  → Featured card morph (reveal-on-enter)
   About / Skills / Contact → Handled by motion.js (untouched)

   MOTION TOKENS (matches site design system)
   ────────────────────────────────────────────────────────────
   Easing:   cubic-bezier(0.22, 1, 0.36, 1)  [--ease-primary]
   Reveal:   650 ms                           [--transition-slow]
   ─────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Guard: require GSAP + ScrollTrigger ─────────────────── */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ── Motion tokens (mirrored from CSS design system) ──────── */
  var EASE_PRIMARY   = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var REVEAL_MS      = 650;
  var MIN_GATE_CARDS = 3;   /* sections with fewer entries skip pinning */

  /* ── Section configs ─────────────────────────────────────── */
  var GATED_SECTIONS = [
    {
      id:          'education',
      cardSel:     '.timeline-item',
      minCards:    MIN_GATE_CARDS,
      hasFeatured: false,
    },
    {
      id:          'projects',
      cardSel:     '.project-card',
      minCards:    MIN_GATE_CARDS,
      hasFeatured: false,
    },
    {
      id:          'certifications',
      cardSel:     '.cert-card',
      minCards:    MIN_GATE_CARDS,
      hasFeatured: true,   /* CIMA featured card → compact summary in label */
    },
    {
      id:          'leadership',
      cardSel:     '.leadership-item',
      minCards:    MIN_GATE_CARDS,
      hasFeatured: false,
    },
  ];


  /* ═══════════════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════════════ */

  /** Zero-pad a number to 2 digits */
  function pad(n) { return String(n).padStart(2, '0'); }

  /**
   * Returns a Promise that resolves once every <img> inside el
   * has either loaded or errored. Defers scrollWidth measurements
   * so logos/project screenshots don't cause early release.
   */
  function waitForImages(el) {
    var imgs = Array.from(el.querySelectorAll('img'));
    if (!imgs.length) return Promise.resolve();
    return Promise.all(imgs.map(function (img) {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(function (resolve) {
        img.addEventListener('load',  resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
  }

  /**
   * Clear inline opacity / transform / transition that motion.js
   * may have set on an element and its styled descendants.
   * Called on every card before it is moved into the gated track.
   */
  function clearMotionStyles(el) {
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
    el.style.removeProperty('transition');
    Array.from(el.querySelectorAll('[style]')).forEach(function (child) {
      child.style.removeProperty('opacity');
      child.style.removeProperty('transform');
      child.style.removeProperty('transition');
    });
  }


  /* ═══════════════════════════════════════════════════════════
     DOM BUILDER — transforms a section into gated layout
     ═══════════════════════════════════════════════════════════ */

  /**
   * buildGatedDOM(section, cfg)
   *
   * Input DOM (example — Education):
   *   <section id="education">
   *     <div class="section-inner">
   *       <h2 class="section-title">...</h2>
   *       <div class="timeline">
   *         <div class="timeline-item">...</div> × N
   *       </div>
   *     </div>
   *   </section>
   *
   * Output DOM:
   *   <section id="education" class="... gated-section">
   *     <div class="section-inner">
   *       [aria-hidden featured card if certifications]
   *       <div class="gated-label">
   *         <h2 class="section-title">...</h2>       ← moved here
   *         [.gated-cima-mini if certifications]
   *         <div class="gated-progress-wrap">
   *           <div class="gated-progress-fill"></div>
   *         </div>
   *         <span class="gated-counter">01 / 06</span>
   *       </div>
   *       <div class="gated-viewport">
   *         <div class="gated-track" data-track>
   *           <div class="gated-card [original-class]">...</div> × N
   *         </div>
   *       </div>
   *     </div>
   *   </section>
   *
   * Returns { track, viewport, progressFill, counter, cards }
   * or null if there are too few cards.
   */
  function buildGatedDOM(section, cfg) {
    var cards = Array.from(section.querySelectorAll(cfg.cardSel));
    if (cards.length < cfg.minCards) return null;

    var sectionInner = section.querySelector('.section-inner');
    var sectionTitle = section.querySelector('.section-title');
    if (!sectionInner) return null;

    /* Clear inline styles motion.js may have applied to each card */
    cards.forEach(clearMotionStyles);

    /* Also clear any data-stagger-related styles on the container */
    Array.from(section.querySelectorAll('[data-stagger]')).forEach(function (el) {
      el.removeAttribute('data-stagger');
      el.removeAttribute('data-stagger-delay');
    });

    /* Mark section so CSS rules engage */
    section.classList.add('gated-section');

    /* ── Left label column ─────────────────────────────────── */
    var label = document.createElement('div');
    label.className = 'gated-label';

    /* Move the section heading into the label column.
       motion.js may have already wrapped its text in a clip span —
       we move the whole element, clip span and all, so the animation
       still fires correctly when the section enters view. */
    if (sectionTitle) {
      label.appendChild(sectionTitle);
    }

    /* Certifications: compact CIMA summary inside the label,
       full CIMA card hidden but kept in DOM for screen readers. */
    if (cfg.hasFeatured) {
      var cimaFull = section.querySelector('.featured-qual-card');
      if (cimaFull) {
        /* Build compact inline summary */
        var mini = document.createElement('div');
        mini.className = 'gated-cima-mini';
        mini.setAttribute('aria-hidden', 'true');
        mini.innerHTML =
          '<p class="gated-cima-mini-eyebrow">Featured Qualification</p>' +
          '<p class="gated-cima-mini-name">CIMA – UK</p>' +
          '<p class="gated-cima-mini-detail">Strategic Level · In Progress</p>';
        label.appendChild(mini);

        /* Hide the full card visually; keep it in the DOM so keyboard
           and screen-reader users can still reach its links */
        cimaFull.classList.add('gated-featured-hidden');
        cimaFull.setAttribute('aria-hidden', 'true');
      }
    }

    /* Progress bar */
    var progressWrap = document.createElement('div');
    progressWrap.className = 'gated-progress-wrap';
    progressWrap.setAttribute('aria-hidden', 'true');

    var progressFill = document.createElement('div');
    progressFill.className = 'gated-progress-fill';
    progressWrap.appendChild(progressFill);

    /* Numeric counter  e.g. "01 / 06" */
    var counter = document.createElement('span');
    counter.className = 'gated-counter';
    counter.setAttribute('aria-hidden', 'true');
    counter.textContent = '01 / ' + pad(cards.length);

    label.appendChild(progressWrap);
    label.appendChild(counter);

    /* ── Right viewport + scrollable track ────────────────── */
    var viewport = document.createElement('div');
    viewport.className = 'gated-viewport';

    var track = document.createElement('div');
    track.className   = 'gated-track';
    track.setAttribute('data-track', '');

    /* Move cards into track, tagging each for CSS */
    cards.forEach(function (card) {
      card.classList.add('gated-card');
      track.appendChild(card);
    });
    viewport.appendChild(track);

    /* ── Rebuild section-inner ─────────────────────────────── */
    /* Capture the hidden featured card reference before clearing */
    var featuredCard = cfg.hasFeatured
      ? section.querySelector('.featured-qual-card')
      : null;

    sectionInner.innerHTML = '';

    /* Featured card stays first (hidden, for a11y) */
    if (featuredCard) sectionInner.appendChild(featuredCard);

    sectionInner.appendChild(label);
    sectionInner.appendChild(viewport);

    return {
      track:        track,
      viewport:     viewport,
      progressFill: progressFill,
      counter:      counter,
      cards:        cards,
    };
  }


  /* ═══════════════════════════════════════════════════════════
     SCROLLTRIGGER FACTORY
     One trigger per section — pin + horizontal scrub combined.
     ═══════════════════════════════════════════════════════════ */

  function createScrollTrigger(section, els) {
    var track        = els.track;
    var viewport     = els.viewport;
    var progressFill = els.progressFill;
    var counter      = els.counter;
    var cards        = els.cards;
    var n            = cards.length;

    /**
     * Compute the horizontal travel distance fresh each time.
     * invalidateOnRefresh:true calls this on every ScrollTrigger.refresh()
     * so resizes and late font/image loads are handled automatically.
     */
    function distance() {
      return Math.max(0, track.scrollWidth - viewport.offsetWidth);
    }

    gsap.to(track, {
      x:    function () { return -distance(); },
      ease: 'none',                        /* 1:1 scrub — no ease on the tween */
      scrollTrigger: {
        trigger:           section,
        start:             'top top',
        end:               function () { return '+=' + distance(); },
        pin:               true,
        scrub:             1,
        anticipatePin:     1,              /* prevents jump/flicker at pin start */
        invalidateOnRefresh: true,         /* recompute distance() on every refresh */

        onUpdate: function (self) {
          var p = self.progress;

          /* ── Progress fill bar ── */
          progressFill.style.transform = 'scaleX(' + p + ')';

          /* ── Counter (clamp so it never exceeds card count) ── */
          var idx = Math.min(
            Math.floor(p * n + 0.01),   /* +0.01 avoids off-by-one at progress=1.0 */
            n - 1
          );
          counter.textContent = pad(idx + 1) + ' / ' + pad(n);

          /* ── Active card highlight ── */
          cards.forEach(function (card, i) {
            card.classList.toggle('gated-card--active', i === idx);
          });
        },
      },
    });
  }


  /* ═══════════════════════════════════════════════════════════
     EXPERIENCE — single-entry featured card
     Kept from previous horizontal-scroll.js; no pin needed.
     ═══════════════════════════════════════════════════════════ */

  function buildExperienceFeature() {
    var section = document.getElementById('experience');
    if (!section) return;

    var timelineItems = section.querySelectorAll('.timeline-item');

    /* Only apply featured layout when there is exactly one entry.
       If entries are added later, the gated pattern kicks in naturally
       (the section would need to be added to GATED_SECTIONS above). */
    if (timelineItems.length !== 1) return;

    var item     = timelineItems[0];
    var titleEl  = item.querySelector('.timeline-title');
    var subEl    = item.querySelector('.timeline-subtitle');
    var detailEl = item.querySelector('.timeline-detail');
    var dateEl   = item.querySelector('.timeline-date');

    /* Build featured card DOM */
    var wrap = document.createElement('div');
    wrap.className = 'feat-exp-wrap';

    var left = document.createElement('div');
    left.className = 'feat-exp-left';

    var eyebrow = document.createElement('p');
    eyebrow.className   = 'feat-exp-eyebrow';
    eyebrow.textContent = 'Work Experience';

    var title = document.createElement('h3');
    title.className   = 'feat-exp-title';
    title.textContent = titleEl ? titleEl.textContent : '';

    var company = document.createElement('p');
    company.className   = 'feat-exp-company';
    company.textContent = subEl ? subEl.textContent : '';

    var desc = document.createElement('div');
    desc.className = 'feat-exp-desc';
    if (detailEl) desc.innerHTML = detailEl.innerHTML;

    left.appendChild(eyebrow);
    left.appendChild(title);
    left.appendChild(company);
    left.appendChild(desc);

    var right = document.createElement('div');
    right.className = 'feat-exp-right';

    var period = document.createElement('span');
    period.className   = 'feat-exp-period';
    period.textContent = dateEl ? dateEl.textContent : '';

    right.appendChild(period);
    wrap.appendChild(left);
    wrap.appendChild(right);

    /* Reveal-on-enter (matches motion.js data-reveal pattern) */
    wrap.style.cssText =
      'opacity:0;transform:translateY(22px);' +
      'transition:opacity ' + REVEAL_MS + 'ms ' + EASE_PRIMARY +
      ',transform ' + REVEAL_MS + 'ms ' + EASE_PRIMARY + ';';

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          wrap.style.opacity   = '1';
          wrap.style.transform = 'translateY(0)';
          obs.unobserve(wrap);
        }
      });
    }, { threshold: 0.1 });
    obs.observe(wrap);

    /* Replace the existing timeline container */
    var timeline = section.querySelector('.timeline');
    if (timeline) timeline.parentNode.replaceChild(wrap, timeline);
  }


  /* ═══════════════════════════════════════════════════════════
     COPY BUTTONS — contact section (unchanged from v1)
     ═══════════════════════════════════════════════════════════ */

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value       = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
  }

  function makeCopyBtn(text, ariaLabel) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy ' + ariaLabel);
    btn.innerHTML =
      '<span class="copy-icon">&#9113;</span>' +
      '<span class="copy-text">Copy</span>';

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      function feedback() {
        btn.classList.add('copied');
        btn.querySelector('.copy-text').textContent = 'Copied \u2713';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.querySelector('.copy-text').textContent = 'Copy';
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(feedback)
          .catch(function () { fallbackCopy(text); feedback(); });
      } else {
        fallbackCopy(text);
        feedback();
      }
    });

    return btn;
  }

  function initCopyButtons() {
    document.querySelectorAll('.contact-detail').forEach(function (detail) {
      var emailLink = detail.querySelector('a[href^="mailto:"]');
      if (emailLink) {
        var email = emailLink.getAttribute('href').replace('mailto:', '');
        detail.appendChild(makeCopyBtn(email, 'email address'));
        return;
      }
      detail.querySelectorAll('span').forEach(function (s) {
        var t = s.textContent.trim();
        if (/^\+?[\d\s\-().]{7,}$/.test(t)) {
          detail.appendChild(makeCopyBtn(t, 'phone number'));
        }
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     MAIN INIT — uses gsap.matchMedia() for responsive branching
     ═══════════════════════════════════════════════════════════ */

  function init() {
    var mm = gsap.matchMedia();

    /* ──────────────────────────────────────────────────────────
       DESKTOP + MOTION OK
       Full gated pin + horizontal scrub on all qualifying sections
       ────────────────────────────────────────────────────────── */
    mm.add(
      '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
      function () {
        var triggerPromises = [];

        GATED_SECTIONS.forEach(function (cfg) {
          var section = document.getElementById(cfg.id);
          if (!section) return;

          /* Transform DOM to gated layout */
          var els = buildGatedDOM(section, cfg);
          if (!els) return;   /* skip if too few cards */

          /* Defer ScrollTrigger creation until all images inside the
             track are loaded — prevents stale scrollWidth measurements */
          var p = waitForImages(els.track).then(function () {
            createScrollTrigger(section, els);
          });
          triggerPromises.push(p);
        });

        /* After all triggers are registered, do a global refresh so
           GSAP recalculates positions with correct image dimensions */
        Promise.all(triggerPromises).then(function () {
          ScrollTrigger.refresh();
        });

        buildExperienceFeature();
        initCopyButtons();

        /* Refresh when web fonts finish loading (can shift layout) */
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () {
            ScrollTrigger.refresh();
          });
        }

        /* Debounced resize refresh — invalidateOnRefresh:true then
           recomputes distance() automatically on each refresh call */
        var resizeTimer;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function () {
            ScrollTrigger.refresh();
          }, 250);
        }, { passive: true });

        /* Theme change → GSAP positions may shift slightly */
        document.addEventListener('themeChange', function () {
          setTimeout(function () { ScrollTrigger.refresh(); }, 100);
        });

        /* CLEANUP — called by matchMedia when leaving this breakpoint */
        return function () {
          ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
        };
      }
    );


    /* ──────────────────────────────────────────────────────────
       DESKTOP + REDUCED MOTION
       No pin / no scrub. Content is fully visible (sections no
       longer have data-reveal so motion.js won't hide them).
       ────────────────────────────────────────────────────────── */
    mm.add(
      '(min-width: 769px) and (prefers-reduced-motion: reduce)',
      function () {
        /* Ensure gated section cards are fully visible */
        GATED_SECTIONS.forEach(function (cfg) {
          var section = document.getElementById(cfg.id);
          if (!section) return;
          section.querySelectorAll(cfg.cardSel).forEach(function (card) {
            card.style.opacity   = '1';
            card.style.transform = 'none';
          });
        });

        buildExperienceFeature();
        initCopyButtons();
      }
    );


    /* ──────────────────────────────────────────────────────────
       MOBILE (≤ 768px)
       No GSAP pinning. Apply native scroll-snap to the existing
       grid/timeline containers so content is touch-swipeable.
       ────────────────────────────────────────────────────────── */
    mm.add('(max-width: 768px)', function () {
      GATED_SECTIONS.forEach(function (cfg) {
        var section = document.getElementById(cfg.id);
        if (!section) return;

        /* Ensure cards are visible (motion.js may have set opacity:0) */
        section.querySelectorAll(cfg.cardSel).forEach(function (card) {
          card.style.opacity   = '1';
          card.style.transform = 'none';
          card.style.removeProperty('transition');
        });

        /* Apply snap to the EXISTING grid / timeline container.
           These containers are untouched on mobile (DOM is not
           restructured), so the CSS grid/flex layout still works
           for very narrow viewports too. */
        var container = section.querySelector(
          '.projects-grid, .certs-grid, .leadership-grid, .timeline'
        );
        if (!container) return;

        var mobileCards = Array.from(container.querySelectorAll(cfg.cardSel));
        if (mobileCards.length < 2) return;

        Object.assign(container.style, {
          display:                'flex',
          flexWrap:               'nowrap',
          overflowX:              'auto',
          scrollSnapType:         'x mandatory',
          gap:                    '14px',
          paddingBottom:          '16px',
          WebkitOverflowScrolling:'touch',
          scrollbarWidth:         'none',
        });

        mobileCards.forEach(function (card) {
          card.style.scrollSnapAlign = 'start';
          card.style.flexShrink      = '0';
          card.style.width           = '82vw';
          card.style.maxWidth        = '360px';
        });
      });

      buildExperienceFeature();
      initCopyButtons();
    });
  }


  /* ── Kick off after DOM is ready ─────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
