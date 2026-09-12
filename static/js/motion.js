/* ── motion.js ──────────────────────────────────────────────────
   Centralized Motion System — Yasindu Mahaarachchi Portfolio
   Features:
   · Scroll reveal (IntersectionObserver)
   · Stagger coordination
   · Section title reveal (overflow hidden)
   · Timeline scroll-awareness
   · Magnetic microinteractions (desktop only)
   · Smooth anchor scroll enhancement
   · Nav hide/show on scroll
   · Project card cursor label
   · Skill pill stagger
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  /* 1. SCROLL REVEAL */
  function initReveal() {
    if (prefersReduced) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 650ms cubic-bezier(0.22, 1, 0.36, 1)';
    });
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.dataset.revealDelay || '0';
          setTimeout(function () {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.classList.add('revealed');
          }, parseInt(delay));
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* 2. STAGGER */
  function initStagger() {
    if (prefersReduced) return;
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      var children = Array.from(group.children);
      var baseDelay = parseInt(group.dataset.staggerDelay || '60');
      children.forEach(function (child) {
        child.style.opacity = '0';
        child.style.transform = 'translateY(18px)';
        child.style.transition = 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)';
      });
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            children.forEach(function (child, i) {
              setTimeout(function () {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              }, i * baseDelay);
            });
            observer.unobserve(group);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -32px 0px' });
      observer.observe(group);
    });
  }

  /* 3. SECTION TITLE REVEAL */
  function initTitleReveal() {
    if (prefersReduced) return;
    document.querySelectorAll('.section-title').forEach(function (title) {
      var inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.transform = 'translateY(100%)';
      inner.style.opacity = '0';
      inner.style.transition = 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease';
      while (title.firstChild) { inner.appendChild(title.firstChild); }
      title.style.overflow = 'hidden';
      title.appendChild(inner);
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setTimeout(function () {
              inner.style.transform = 'translateY(0)';
              inner.style.opacity = '1';
            }, 80);
            observer.unobserve(title);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(title);
    });
  }

  /* 4. TIMELINE REVEAL — deferred so gated-scroll.js can mark
     .gated-section before we check item.closest() */
  function initTimelineReveal() {
    if (prefersReduced) return;
    // Wait one rAF so gated-scroll.js has set .gated-section classes
    requestAnimationFrame(function() {
      document.querySelectorAll('.timeline-item').forEach(function (item, i) {
        // Skip items inside gated sections — gated-scroll.js manages those
        if (item.closest('.gated-section')) return;
        item.style.opacity = '0';
        item.style.transform = 'translateX(-12px)';
        item.style.transition = 'opacity 550ms cubic-bezier(0.22, 1, 0.36, 1), transform 550ms cubic-bezier(0.22, 1, 0.36, 1)';
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setTimeout(function () {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
              }, i * 80);
              observer.unobserve(item);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });
        observer.observe(item);
      });
    });
  }

  /* 5. MAGNETIC MICROINTERACTIONS */
  function initMagnetic() {
    if (prefersReduced || isTouch) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var maxMove = parseInt(el.dataset.magneticStrength || '6');
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        el.style.transform = 'translate(' + (dx * maxMove) + 'px, ' + (dy * maxMove) + 'px) translateY(-1px)';
        el.style.transition = 'transform 80ms linear';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
        el.style.transition = 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)';
      });
    });
  }

  /* 6. SMOOTH ANCHOR SCROLL */
  function smoothScrollTo(target, duration) {
    var start = window.pageYOffset;
    var distance = target - start;
    var startTime = performance.now();
    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    function step(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * easeOutExpo(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var navHeight = 0; // Dynamic Island doesn't displace the page flow
        var targetY = target.getBoundingClientRect().top + window.pageYOffset - 110; // Extra padding for the pill
        if (prefersReduced) { window.scrollTo({ top: targetY }); return; }
        smoothScrollTo(targetY, 750);
      });
    });
  }

  /* 7. DYNAMIC ISLAND NAV LOGIC */
  function initIslandNav() {
    /* ── Light mode island (scroll sections) ── */
    var navLinks = document.querySelectorAll('#island-links a');
    var hamburger = document.getElementById('island-hamburger');
    var linksContainer = document.getElementById('island-links');

    if (navLinks.length) {
      // Hamburger toggle for mobile
      if (hamburger && linksContainer) {
        hamburger.addEventListener('click', function(e) {
          e.stopPropagation();
          var isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
          hamburger.setAttribute('aria-expanded', String(!isExpanded));
          linksContainer.classList.toggle('open');
          hamburger.innerHTML = isExpanded ? '&#9776;' : '&times;';
        });
        document.addEventListener('click', function(e) {
          if (!e.target.closest('#island-nav')) {
            hamburger.setAttribute('aria-expanded', 'false');
            linksContainer.classList.remove('open');
            hamburger.innerHTML = '&#9776;';
          }
        });
        navLinks.forEach(function(link) {
          link.addEventListener('click', function() {
            hamburger.setAttribute('aria-expanded', 'false');
            linksContainer.classList.remove('open');
            hamburger.innerHTML = '&#9776;';
          });
        });
      }

      // Active state tracking via IntersectionObserver
      var sections = Array.from(navLinks).map(function(link) {
        var id = link.getAttribute('href').substring(1);
        return document.getElementById(id);
      }).filter(Boolean);

      var lightObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function(link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { threshold: 0, rootMargin: '-20% 0px -70% 0px' });

      sections.forEach(function(s) { lightObserver.observe(s); });
    }

    /* ── Dark mode island (tab switcher) ── */
    var darkLinks = document.querySelectorAll('#island-links-dark a[data-dark-tab]');
    var darkHamburger = document.getElementById('island-hamburger-dark');
    var darkLinksContainer = document.getElementById('island-links-dark');

    if (darkLinks.length) {
      // Wire each link to click the corresponding tab button
      darkLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          var tabId = link.getAttribute('data-dark-tab');
          var tabBtn = document.getElementById('tab-btn-' + tabId);
          if (tabBtn) tabBtn.click();
          // Update active state in island
          darkLinks.forEach(function(l) { l.classList.remove('active'); });
          link.classList.add('active');
          // Close mobile menu
          if (darkHamburger && darkLinksContainer) {
            darkHamburger.setAttribute('aria-expanded', 'false');
            darkLinksContainer.classList.remove('open');
            darkHamburger.innerHTML = '&#9776;';
          }
        });
      });

      // Also sync active state when tab buttons are clicked directly
      document.querySelectorAll('.dark-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var tabId = btn.getAttribute('data-tab');
          darkLinks.forEach(function(l) {
            l.classList.toggle('active', l.getAttribute('data-dark-tab') === tabId);
          });
        });
      });

      // Mobile hamburger for dark island
      if (darkHamburger && darkLinksContainer) {
        darkHamburger.addEventListener('click', function(e) {
          e.stopPropagation();
          var isExpanded = darkHamburger.getAttribute('aria-expanded') === 'true';
          darkHamburger.setAttribute('aria-expanded', String(!isExpanded));
          darkLinksContainer.classList.toggle('open');
          darkHamburger.innerHTML = isExpanded ? '&#9776;' : '&times;';
        });
        document.addEventListener('click', function(e) {
          if (!e.target.closest('#island-nav-dark')) {
            darkHamburger.setAttribute('aria-expanded', 'false');
            darkLinksContainer.classList.remove('open');
            darkHamburger.innerHTML = '&#9776;';
          }
        });
      }
    }
  }

  /* 8. PROJECT CARD CURSOR LABEL */
  function initCursorLabel() {
    if (isTouch || prefersReduced) return;
    var label = document.createElement('div');
    label.className = 'cursor-label';
    label.textContent = 'VIEW';
    label.setAttribute('aria-hidden', 'true');
    document.body.appendChild(label);
    var labelX = 0, labelY = 0;
    var mouseX = 0, mouseY = 0;
    var rafId = null;
    var isVisible = false;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function animateLabel() {
      labelX = lerp(labelX, mouseX, 0.12);
      labelY = lerp(labelY, mouseY, 0.12);
      label.style.left = labelX + 'px';
      label.style.top = labelY + 'px';
      if (isVisible) rafId = requestAnimationFrame(animateLabel);
    }
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        isVisible = true;
        label.classList.add('visible');
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animateLabel);
      });
      card.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      card.addEventListener('mouseleave', function () {
        isVisible = false;
        label.classList.remove('visible');
        cancelAnimationFrame(rafId);
      });
    });
  }

  /* 9. SKILL PILL STAGGER */
  function initSkillStagger() {
    if (prefersReduced) return;
    var skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;
    var pills = Array.from(skillsGrid.querySelectorAll('.skill-pill'));
    pills.forEach(function (pill) {
      pill.style.opacity = '0';
      pill.style.transform = 'translateY(10px) scale(0.95)';
      pill.style.transition = 'opacity 400ms cubic-bezier(0.22, 1, 0.36, 1), transform 400ms cubic-bezier(0.22, 1, 0.36, 1)';
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          pills.forEach(function (pill, i) {
            setTimeout(function () {
              pill.style.opacity = '1';
              pill.style.transform = 'translateY(0) scale(1)';
            }, i * 45);
          });
          observer.unobserve(skillsGrid);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(skillsGrid);
  }

  /* 10. PAGE ENTRY FADE */
  function initPageFade() {
    if (prefersReduced) return;
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 350ms ease';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.style.opacity = '1';
      });
    });
  }

  /* INIT */
  function init() {
    initPageFade();
    initReveal();
    initStagger();
    initTitleReveal();
    initTimelineReveal();
    initMagnetic();
    initSmoothAnchors();
    initIslandNav();
    initCursorLabel();
    initSkillStagger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
