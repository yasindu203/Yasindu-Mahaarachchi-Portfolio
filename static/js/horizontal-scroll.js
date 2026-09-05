/* ── horizontal-scroll.js ──────────────────────────────────────
   Phase 2: Pinned Horizontal Scroll + Sticky Story + Copy Buttons
   Yasindu Mahaarachchi Portfolio
   ─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var BREAKPOINT    = 900;
  var isMobile      = window.innerWidth <= BREAKPOINT;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Reset motion.js inline styles ─────────────────────────── */
  function resetMotion(el) {
    el.removeAttribute('data-reveal');
    el.removeAttribute('data-stagger');
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
    el.style.removeProperty('transition');
    el.querySelectorAll('[style]').forEach(function (c) {
      c.style.removeProperty('opacity');
      c.style.removeProperty('transform');
      c.style.removeProperty('transition');
    });
  }

  /* ── Build horizontal pinned section ────────────────────────── */
  function buildHorizontal(sectionId, cardSel, titleText) {
    var section = document.getElementById(sectionId);
    if (!section) return;

    var cards = Array.from(section.querySelectorAll(cardSel));
    if (cards.length < 2) return;

    var count = cards.length;
    resetMotion(section);
    cards.forEach(resetMotion);

    section.classList.add('h-scroll-converted');

    var inner = section.querySelector('.section-inner');
    if (!inner) return;

    /* Left label */
    var label = document.createElement('div');
    label.className = 'h-scroll-label';

    var labelTop = document.createElement('span');
    labelTop.className = 'h-scroll-eyebrow';
    labelTop.textContent = 'Scroll to explore';

    var titleEl = document.createElement('h2');
    titleEl.className = 'h-scroll-title';
    titleEl.textContent = titleText;

    var counter = document.createElement('div');
    counter.className = 'h-scroll-counter';
    counter.textContent = '01 / ' + pad(count);

    var pwrap = document.createElement('div');
    pwrap.className = 'h-scroll-progress-wrap';
    var pfill = document.createElement('div');
    pfill.className = 'h-scroll-progress-fill';
    pwrap.appendChild(pfill);

    label.appendChild(labelTop);
    label.appendChild(titleEl);
    label.appendChild(counter);
    label.appendChild(pwrap);

    /* Right viewport + track */
    var viewport = document.createElement('div');
    viewport.className = 'h-scroll-viewport';
    var track = document.createElement('div');
    track.className = 'h-scroll-track';
    cards.forEach(function (c) { track.appendChild(c); });
    viewport.appendChild(track);

    /* Outer */
    var outer = document.createElement('div');
    outer.className = 'h-scroll-outer';
    outer.appendChild(label);
    outer.appendChild(viewport);

    inner.style.cssText = 'max-width:unset;padding:0;';
    inner.innerHTML = '';
    inner.appendChild(outer);

    /* Initial card states */
    cards.forEach(function (c, i) {
      c.classList.toggle('h-inactive', i !== 0);
    });

    /* GSAP */
    gsap.to(track, {
      x: function () {
        return -(Math.max(0, track.scrollWidth - viewport.offsetWidth + 60));
      },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () {
          return '+=' + (Math.max(0, track.scrollWidth - viewport.offsetWidth + 60) + 140);
        },
        pin: true,
        anticipatePin: 1,
        scrub: 1.4,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          pfill.style.transform = 'scaleX(' + self.progress + ')';
          var idx = Math.min(Math.floor(self.progress * count), count - 1);
          counter.textContent = pad(idx + 1) + ' / ' + pad(count);
          cards.forEach(function (c, i) {
            c.classList.toggle('h-inactive', i !== idx);
          });
        }
      }
    });
  }

  /* ── Certifications sticky story ────────────────────────────── */
  function buildCertsStory() {
    var section = document.getElementById('certifications');
    if (!section) return;

    var cards = Array.from(section.querySelectorAll('.cert-card'));
    if (cards.length < 2) return;

    var count = cards.length;
    resetMotion(section);
    cards.forEach(resetMotion);

    section.classList.add('cert-story-converted');

    var inner = section.querySelector('.section-inner');
    if (!inner) return;

    /* Left label */
    var label = document.createElement('div');
    label.className = 'cert-story-label';

    var eyebrow = document.createElement('span');
    eyebrow.className = 'h-scroll-eyebrow';
    eyebrow.textContent = 'Scroll through each';

    var titleEl = document.createElement('h2');
    titleEl.className = 'cert-story-title';
    titleEl.textContent = 'Certifications & Licensing';

    var counter = document.createElement('div');
    counter.className = 'cert-story-counter';
    counter.textContent = '01 / ' + pad(count);

    var pwrap = document.createElement('div');
    pwrap.className = 'cert-story-progress-wrap';
    var pfill = document.createElement('div');
    pfill.className = 'cert-story-progress-fill';
    pwrap.appendChild(pfill);

    label.appendChild(eyebrow);
    label.appendChild(titleEl);
    label.appendChild(counter);
    label.appendChild(pwrap);

    /* Right content */
    var content = document.createElement('div');
    content.className = 'cert-story-content';

    var items = cards.map(function (card, i) {
      var wrap = document.createElement('div');
      wrap.className = 'cert-story-item';
      wrap.appendChild(card);
      content.appendChild(wrap);
      gsap.set(wrap, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 30, position: 'absolute' });
      return wrap;
    });

    var outer = document.createElement('div');
    outer.className = 'cert-story-outer';
    outer.appendChild(label);
    outer.appendChild(content);

    inner.style.cssText = 'max-width:unset;padding:0;';
    inner.innerHTML = '';
    inner.appendChild(outer);

    var STEP_PX = 550;
    var totalDist = count * STEP_PX;
    var step = 1 / count;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=' + (totalDist + 200),
        pin: true,
        anticipatePin: 1,
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          pfill.style.transform = 'scaleX(' + self.progress + ')';
          var idx = Math.min(Math.floor(self.progress * count), count - 1);
          counter.textContent = pad(idx + 1) + ' / ' + pad(count);
        }
      }
    });

    items.forEach(function (item, i) {
      var pos = i * step;
      if (i > 0) {
        tl.fromTo(item,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' },
          pos - 0.01
        );
      }
      if (i < count - 1) {
        tl.to(item,
          { opacity: 0, y: -22, duration: 0.2, ease: 'power2.in' },
          pos + step - 0.25
        );
      }
    });
  }

  /* ── Experience featured card (1 entry) ─────────────────────── */
  function buildExperienceFeature() {
    var section = document.getElementById('experience');
    if (!section) return;

    var timelineItems = section.querySelectorAll('.timeline-item');
    if (timelineItems.length !== 1) return;

    var item = timelineItems[0];
    var titleEl  = item.querySelector('.timeline-title');
    var subEl    = item.querySelector('.timeline-subtitle');
    var detailEl = item.querySelector('.timeline-detail');
    var dateEl   = item.querySelector('.timeline-date');

    var wrap = document.createElement('div');
    wrap.className = 'feat-exp-wrap';

    var left = document.createElement('div');
    left.className = 'feat-exp-left';

    var eyebrow = document.createElement('p');
    eyebrow.className = 'feat-exp-eyebrow';
    eyebrow.textContent = 'Work Experience';

    var title = document.createElement('h3');
    title.className = 'feat-exp-title';
    title.textContent = titleEl ? titleEl.textContent : '';

    var company = document.createElement('p');
    company.className = 'feat-exp-company';
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
    period.className = 'feat-exp-period';
    period.textContent = dateEl ? dateEl.textContent : '';

    right.appendChild(period);
    wrap.appendChild(left);
    wrap.appendChild(right);

    /* Reveal on scroll */
    wrap.style.cssText = 'opacity:0;transform:translateY(22px);transition:opacity 650ms cubic-bezier(0.22,1,0.36,1),transform 650ms cubic-bezier(0.22,1,0.36,1);';
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          wrap.style.opacity = '1';
          wrap.style.transform = 'translateY(0)';
          obs.unobserve(wrap);
        }
      });
    }, { threshold: 0.1 });
    obs.observe(wrap);

    var timeline = section.querySelector('.timeline');
    if (timeline) timeline.parentNode.replaceChild(wrap, timeline);
  }

  /* ── Copy buttons ───────────────────────────────────────────── */
  function makeCopyBtn(text, ariaLabel) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy ' + ariaLabel);
    btn.innerHTML = '<span class="copy-icon">&#9113;</span><span class="copy-text">Copy</span>';

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      function showFeedback() {
        btn.classList.add('copied');
        btn.querySelector('.copy-text').textContent = 'Copied \u2713';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.querySelector('.copy-text').textContent = 'Copy';
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showFeedback).catch(function () {
          fallbackCopy(text);
          showFeedback();
        });
      } else {
        fallbackCopy(text);
        showFeedback();
      }
    });

    return btn;
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
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

  /* ── Mobile fallback ─────────────────────────────────────────── */
  function mobileFallback() {
    /* Ensure all content visible */
    document.querySelectorAll('[data-reveal],[data-stagger]>*').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    /* Horizontal swipe for grids */
    ['.projects-grid', '.leadership-grid', '.certs-grid'].forEach(function (sel) {
      var g = document.querySelector(sel);
      if (!g) return;
      var children = Array.from(g.children);
      if (children.length < 2) return;
      g.style.cssText = 'display:flex;flex-wrap:nowrap;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;padding-bottom:12px;-webkit-overflow-scrolling:touch;';
      children.forEach(function (c) {
        c.style.cssText = 'scroll-snap-align:start;flex-shrink:0;width:82vw;';
      });
    });

    initCopyButtons();
  }

  /* ── Helpers ─────────────────────────────────────────────────── */
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    if (prefersReduced || isMobile) {
      mobileFallback();
      return;
    }

    /* Small delay: let motion.js run first, then override */
    setTimeout(function () {
      buildExperienceFeature();
      buildHorizontal('projects',   '.project-card',    'Projects');
      buildHorizontal('leadership', '.leadership-item',  'Leadership & Volunteering');
      buildCertsStory();
      initCopyButtons();

      /* Refresh after fonts + images load */
      window.addEventListener('load', function () {
        ScrollTrigger.refresh();
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
      }

      /* Recalculate on resize */
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          var nowMobile = window.innerWidth <= BREAKPOINT;
          if (nowMobile !== isMobile) { window.location.reload(); return; }
          ScrollTrigger.refresh();
        }, 350);
      });
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
