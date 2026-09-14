/* ── command-palette.js ─────────────────────────────────────────
   Command Palette — Yasindu Mahaarachchi Portfolio
   Activation: Cmd/Ctrl + K
   Navigation: ↑↓ arrows, Enter, Escape
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  function getCommands() {
    var isDark = document.body.classList.contains('dark');
    var toggleLabel = isDark ? 'Switch to Professional Mode' : 'Switch to Depth Mode';
    return [
      { id: 'home',       label: 'Home',                   icon: '⌂', action: function() { scrollToSection('#hero'); } },
      { id: 'about',      label: 'About',                  icon: '◉', action: function() { scrollToSection('#about'); } },
      { id: 'education',  label: 'Education',              icon: '🎓', action: function() { scrollToSection('#education'); } },
      { id: 'experience', label: 'Experience',             icon: '💼', action: function() { scrollToSection('#experience'); } },
      { id: 'skills',     label: 'Skills',                 icon: '◈', action: function() { scrollToSection('#skills'); } },
      { id: 'projects',   label: 'Projects',               icon: '⬡', action: function() { scrollToSection('#projects'); } },
      { id: 'certs',      label: 'Certifications',         icon: '◎', action: function() { scrollToSection('#certifications'); } },
      { id: 'events',     label: 'Events',                 icon: '◇', action: function() { scrollToSection('#events'); } },
      { id: 'contact',    label: 'Contact',                icon: '✉', action: function() { scrollToSection('#contact'); } },
      { id: 'github',     label: 'GitHub Profile',         icon: '⌥', action: function() { window.open('https://github.com/yasindumahaarachchi', '_blank', 'noopener'); } },
      { id: 'linkedin',   label: 'LinkedIn Profile',       icon: 'in', action: function() { window.open('https://linkedin.com/in/yasindumahaarachchi', '_blank', 'noopener'); } },
      { id: 'cv',         label: 'Download CV',            icon: '⬇', action: function() { var a = document.getElementById('hero-cv-btn'); if (a && a.href) { window.open(a.href, '_blank'); } else { window.open('static/assets/cv.pdf', '_blank'); } } },
      { id: 'mode',       label: toggleLabel,              icon: '☯', action: function() { var btn = document.getElementById('yy-toggle'); if (btn) btn.click(); } },
      { id: 'terminal',   label: 'Open Terminal',          icon: '>_', action: function() { openTerminal(); } },
    ];
  }

  function scrollToSection(hash) {
    closePalette();
    var el = document.querySelector(hash);
    if (!el) return;
    setTimeout(function() {
      var nav = document.getElementById('site-nav');
      var navH = nav ? nav.getBoundingClientRect().height : 68;
      var top = el.getBoundingClientRect().top + window.pageYOffset - navH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }, 200);
  }

  function openTerminal() {
    closePalette();
    var termEvent = new CustomEvent('openTerminal');
    document.dispatchEvent(termEvent);
  }

  /* ── Build DOM ─────────────────────────────────────────────── */
  var overlay, dialog, input, list;

  function buildPalette() {
    overlay = document.createElement('div');
    overlay.id = 'cmd-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Command palette');
    overlay.setAttribute('hidden', '');

    dialog = document.createElement('div');
    dialog.id = 'cmd-dialog';

    var header = document.createElement('div');
    header.id = 'cmd-header';

    var icon = document.createElement('span');
    icon.id = 'cmd-search-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '⌕';

    input = document.createElement('input');
    input.id = 'cmd-input';
    input.type = 'text';
    input.placeholder = 'Type a command or search…';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', 'Command search');

    var kbdHint = document.createElement('kbd');
    kbdHint.id = 'cmd-hint';
    kbdHint.textContent = 'ESC';

    header.appendChild(icon);
    header.appendChild(input);
    header.appendChild(kbdHint);

    list = document.createElement('ul');
    list.id = 'cmd-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Commands');

    dialog.appendChild(header);
    dialog.appendChild(list);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePalette();
    });

    // Filter on input
    input.addEventListener('input', function () {
      renderList(input.value.trim());
    });

    // Keyboard nav
    input.addEventListener('keydown', handleKey);
  }

  var activeIndex = -1;

  function renderList(query) {
    list.innerHTML = '';
    activeIndex = -1;

    var commands = getCommands();
    var filtered = commands.filter(function (cmd) {
      if (!query) return true;
      return cmd.label.toLowerCase().includes(query.toLowerCase()) ||
             cmd.id.toLowerCase().includes(query.toLowerCase());
    });

    if (filtered.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'cmd-empty';
      empty.textContent = 'No commands found';
      list.appendChild(empty);
      return;
    }

    filtered.forEach(function (cmd, i) {
      var li = document.createElement('li');
      li.className = 'cmd-item';
      li.setAttribute('role', 'option');
      li.setAttribute('data-index', i);
      li.setAttribute('tabindex', '-1');

      var iconEl = document.createElement('span');
      iconEl.className = 'cmd-item-icon';
      iconEl.setAttribute('aria-hidden', 'true');
      iconEl.textContent = cmd.icon;

      var labelEl = document.createElement('span');
      labelEl.className = 'cmd-item-label';
      labelEl.textContent = cmd.label;

      li.appendChild(iconEl);
      li.appendChild(labelEl);

      li.addEventListener('click', function () {
        cmd.action();
        closePalette();
      });

      li.addEventListener('mouseenter', function () {
        setActive(i);
      });

      list.appendChild(li);
    });

    // Auto-highlight first
    if (filtered.length > 0) setActive(0);
    list._filtered = filtered;
  }

  function setActive(index) {
    var items = list.querySelectorAll('.cmd-item');
    items.forEach(function (el) { el.classList.remove('active'); });
    if (items[index]) {
      items[index].classList.add('active');
      items[index].scrollIntoView({ block: 'nearest' });
    }
    activeIndex = index;
  }

  function handleKey(e) {
    var items = list.querySelectorAll('.cmd-item');
    var count = items.length;
    if (count === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((activeIndex + 1) % count);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((activeIndex - 1 + count) % count);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && list._filtered && list._filtered[activeIndex]) {
        list._filtered[activeIndex].action();
        closePalette();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  }

  /* ── Open / Close ──────────────────────────────────────────── */
  var isOpen = false;

  function openPalette() {
    if (isOpen) return;
    isOpen = true;
    overlay.removeAttribute('hidden');
    requestAnimationFrame(function () {
      overlay.classList.add('open');
    });
    input.value = '';
    renderList('');
    setTimeout(function () { input.focus(); }, 50);
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('open');
    setTimeout(function () {
      overlay.setAttribute('hidden', '');
    }, 280);
    document.body.style.overflow = '';
  }

  /* ── Keyboard shortcut ─────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (isOpen) { closePalette(); } else { openPalette(); }
    }
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closePalette();
    }
  });

  /* ── Init ──────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPalette);
  } else {
    buildPalette();
  }

  // Expose for external use
  window.openCommandPalette = openPalette;

})();
