/* ── terminal.js ────────────────────────────────────────────────
   Interactive Terminal Easter Egg — Yasindu Mahaarachchi Portfolio
   Activation: '/' key press, or terminal icon click
   Commands use REAL site data only
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Real Site Data ────────────────────────────────────────── */
  var SITE_DATA = {
    name: 'Yasindu Mahaarachchi',
    tagline: 'Engineering Undergraduate | CIMA Student | Consulting & Supply Chain Aspirant',
    bio: 'Analytical Transport Management and Logistics Engineering undergraduate at University of Moratuwa. Backed by CIMA Strategic Level studies and a growing foundation in Machine Learning and SAP business processes.',
    location: 'Pinnawala, Waga, Sri Lanka',
    email: 'yasindunavanga4970@gmail.com',
    phone: '+94 71 063 1972',
    linkedin: 'https://linkedin.com/in/yasindumahaarachchi',
    github: 'https://github.com/yasindumahaarachchi',
    cv: 'static/assets/cv.pdf',
    projects: [
      { title: 'Algorithmic Analytics & Automation Project', tags: 'Python, Statistics, API Integration, Automation, Quantitative Finance', status: 'Completed' },
      { title: 'Empty Container Optimization Model', tags: 'Supply Chain, Operations Research, Logistics Engineering', status: 'Ongoing' },
      { title: 'Geethani Motors — Automotive Digital Transformation', tags: 'Business Analysis, Digital Transformation', status: 'Completed' },
      { title: 'Ran Aruna Project', tags: 'Project Management, Logistics', status: 'Completed' },
    ],
    experience: [
      { title: 'Freelance Video Editor · Videographer · Graphic Designer', company: 'Self-Employed', period: '2022 – Present' },
    ],
    education: [
      { institution: 'University of Moratuwa', degree: 'BSc. Engineering (Hons) in Transport Management and Logistics Engineering', period: '2024 – Present', detail: 'Semester 4 Dean\'s List' },
      { institution: 'Nalanda College Colombo', degree: 'Advanced Level — Physical Science Stream', period: '2020 – 2022' },
    ],
    certifications: [
      'CIMA – Management Level (Completed), Strategic Level (Reading)',
      'NVIDIA — Fundamentals of Accelerated Data Science',
      'McKinsey Forward Program',
      'Microsoft Certification',
      'Stanford Machine Learning',
      'SAP Certification',
    ],
    leadership: [
      'IEEE Student Branch — University of Moratuwa (Member)',
      'Mathematics Society — University of Moratuwa',
      'Society of Transport Engineering — University of Moratuwa',
      'Rotaract Club — University of Moratuwa',
      'Mathematics Olympiad — Nalanda College',
    ],
    skills: 'Operations Research, Quantitative Methods, Data Analysis, Advanced Excel, Python, Java, R, C#, Video Editing',
  };

  /* ── Command Handlers ──────────────────────────────────────── */
  var COMMANDS = {
    help: function() {
      return [
        '<span class="t-accent">Available commands:</span>',
        '',
        '  <span class="t-cmd">about</span>       — Personal bio and background',
        '  <span class="t-cmd">projects</span>    — View all projects',
        '  <span class="t-cmd">experience</span>  — Work experience',
        '  <span class="t-cmd">education</span>   — Educational background',
        '  <span class="t-cmd">skills</span>      — Technical skills',
        '  <span class="t-cmd">certs</span>       — Certifications',
        '  <span class="t-cmd">leadership</span>  — Leadership & volunteering',
        '  <span class="t-cmd">contact</span>     — Contact information',
        '  <span class="t-cmd">github</span>      — Open GitHub profile',
        '  <span class="t-cmd">linkedin</span>    — Open LinkedIn profile',
        '  <span class="t-cmd">cv</span>          — Download CV',
        '  <span class="t-cmd">clear</span>       — Clear terminal',
        '  <span class="t-cmd">exit</span>        — Close terminal',
        '',
        '<span class="t-muted">Press ↑ to recall previous commands</span>',
      ];
    },
    about: function() {
      return [
        '<span class="t-accent">// ' + SITE_DATA.name + '</span>',
        '',
        SITE_DATA.bio,
        '',
        '<span class="t-label">Location:</span> ' + SITE_DATA.location,
        '<span class="t-label">Status:</span>   Seeking November 2026 internship',
      ];
    },
    projects: function() {
      var lines = ['<span class="t-accent">// Projects [' + SITE_DATA.projects.length + ']</span>', ''];
      SITE_DATA.projects.forEach(function(p, i) {
        lines.push('  <span class="t-index">' + (i+1) + '.</span> <span class="t-bright">' + p.title + '</span>');
        lines.push('     <span class="t-muted">' + p.tags + '</span>');
        lines.push('     <span class="t-label">Status:</span> ' + p.status);
        lines.push('');
      });
      return lines;
    },
    experience: function() {
      var lines = ['<span class="t-accent">// Experience</span>', ''];
      SITE_DATA.experience.forEach(function(e) {
        lines.push('  <span class="t-bright">' + e.title + '</span>');
        lines.push('  <span class="t-label">Company:</span> ' + e.company);
        lines.push('  <span class="t-label">Period:</span>  ' + e.period);
        lines.push('');
      });
      return lines;
    },
    education: function() {
      var lines = ['<span class="t-accent">// Education</span>', ''];
      SITE_DATA.education.forEach(function(e) {
        lines.push('  <span class="t-bright">' + e.institution + '</span>');
        lines.push('  <span class="t-muted">' + e.degree + '</span>');
        lines.push('  <span class="t-label">Period:</span> ' + e.period);
        if (e.detail) lines.push('  <span class="t-label">Note:</span>   ' + e.detail);
        lines.push('');
      });
      return lines;
    },
    skills: function() {
      return [
        '<span class="t-accent">// Skills</span>',
        '',
        SITE_DATA.skills.split(', ').map(function(s) { return '  · ' + s; }).join('\n'),
        '',
      ];
    },
    certs: function() {
      var lines = ['<span class="t-accent">// Certifications [' + SITE_DATA.certifications.length + ']</span>', ''];
      SITE_DATA.certifications.forEach(function(c) {
        lines.push('  · ' + c);
      });
      lines.push('');
      return lines;
    },
    leadership: function() {
      var lines = ['<span class="t-accent">// Leadership & Volunteering</span>', ''];
      SITE_DATA.leadership.forEach(function(l) {
        lines.push('  · ' + l);
      });
      lines.push('');
      return lines;
    },
    contact: function() {
      return [
        '<span class="t-accent">// Contact</span>',
        '',
        '  <span class="t-label">Email:</span>    <a href="mailto:' + SITE_DATA.email + '" class="t-link">' + SITE_DATA.email + '</a>',
        '  <span class="t-label">Phone:</span>    ' + SITE_DATA.phone,
        '  <span class="t-label">LinkedIn:</span> <a href="' + SITE_DATA.linkedin + '" target="_blank" rel="noopener" class="t-link">' + SITE_DATA.linkedin + '</a>',
        '  <span class="t-label">GitHub:</span>   <a href="' + SITE_DATA.github + '" target="_blank" rel="noopener" class="t-link">' + SITE_DATA.github + '</a>',
        '',
      ];
    },
    email: function() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(SITE_DATA.email);
        return [
          '<span class="t-accent">// Email</span>',
          '  ' + SITE_DATA.email + '  <span class="t-accent" style="color:#10B981;">[COPIED TO CLIPBOARD]</span>',
          '',
        ];
      }
      return [
        '<span class="t-accent">// Email</span>',
        '  ' + SITE_DATA.email,
        '',
      ];
    },
    github: function() {
      window.open(SITE_DATA.github, '_blank', 'noopener');
      return ['<span class="t-muted">Opening GitHub profile…</span>'];
    },
    linkedin: function() {
      window.open(SITE_DATA.linkedin, '_blank', 'noopener');
      return ['<span class="t-muted">Opening LinkedIn profile…</span>'];
    },
    cv: function() {
      window.open(SITE_DATA.cv, '_blank');
      return ['<span class="t-muted">Opening CV…</span>'];
    },
    clear: function() { return null; }, // special
    exit: function() { closeTerminal(); return []; },
  };

  var WELCOME = [
    '<span class="t-accent">Yasindu Mahaarachchi — Interactive Terminal</span>',
    '<span class="t-muted">Type <span class="t-cmd">help</span> for available commands, <span class="t-cmd">exit</span> or ESC to close.</span>',
    '',
  ];

  /* ── DOM ───────────────────────────────────────────────────── */
  var overlay, terminal, output, inputEl, cursor;
  var cmdHistory = [];
  var historyIndex = -1;
  var isOpen = false;

  function buildTerminal() {
    overlay = document.createElement('div');
    overlay.id = 'term-overlay';
    overlay.setAttribute('hidden', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Interactive terminal');

    terminal = document.createElement('div');
    terminal.id = 'term-window';

    var header = document.createElement('div');
    header.id = 'term-header';

    var dots = document.createElement('div');
    dots.className = 'term-dots';
    dots.innerHTML = '<span class="term-dot red"></span><span class="term-dot yellow"></span><span class="term-dot green"></span>';

    var title = document.createElement('span');
    title.id = 'term-title';
    title.textContent = 'yasindu@portfolio ~ /terminal';

    var closeBtn = document.createElement('button');
    closeBtn.id = 'term-close';
    closeBtn.setAttribute('aria-label', 'Close terminal');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', closeTerminal);

    header.appendChild(dots);
    header.appendChild(title);
    header.appendChild(closeBtn);

    output = document.createElement('div');
    output.id = 'term-output';
    output.setAttribute('aria-live', 'polite');
    output.setAttribute('aria-label', 'Terminal output');

    var inputRow = document.createElement('div');
    inputRow.id = 'term-input-row';

    var prompt = document.createElement('span');
    prompt.id = 'term-prompt';
    prompt.innerHTML = '<span class="t-accent">~</span> <span class="t-muted">$</span>';

    inputEl = document.createElement('input');
    inputEl.id = 'term-input';
    inputEl.type = 'text';
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('spellcheck', 'false');
    inputEl.setAttribute('autocorrect', 'off');
    inputEl.setAttribute('aria-label', 'Terminal input');

    inputRow.appendChild(prompt);
    inputRow.appendChild(inputEl);

    terminal.appendChild(header);
    terminal.appendChild(output);
    terminal.appendChild(inputRow);
    overlay.appendChild(terminal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeTerminal();
    });

    inputEl.addEventListener('keydown', handleInput);

    // Print welcome
    WELCOME.forEach(function(line) { appendLine(line); });
  }

  function appendLine(html) {
    var line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function appendCommand(cmd) {
    appendLine('<span class="t-prompt"><span class="t-accent">~</span> <span class="t-muted">$</span></span> <span class="t-input">' + escapeHtml(cmd) + '</span>');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function handleInput(e) {
    if (e.key === 'Enter') {
      var cmd = inputEl.value.trim().toLowerCase();
      inputEl.value = '';

      if (!cmd) return;

      appendCommand(cmd);
      cmdHistory.unshift(cmd);
      if (cmdHistory.length > 50) cmdHistory.pop();
      historyIndex = -1;

      if (cmd === 'clear') {
        output.innerHTML = '';
        return;
      }

      if (COMMANDS[cmd]) {
        var result = COMMANDS[cmd]();
        if (result && result.length > 0) {
          result.forEach(function(line) { appendLine(line); });
        }
      } else {
        appendLine('<span class="t-error">Command not found: <span class="t-bright">' + escapeHtml(cmd) + '</span>. Type <span class="t-cmd">help</span> for available commands.</span>');
      }

      appendLine('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        inputEl.value = cmdHistory[historyIndex];
        setTimeout(function() { inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length); }, 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputEl.value = cmdHistory[historyIndex];
      } else {
        historyIndex = -1;
        inputEl.value = '';
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeTerminal();
    }
  }

  /* ── Open / Close ──────────────────────────────────────────── */
  function openTerminal() {
    if (isOpen) return;
    isOpen = true;
    overlay.removeAttribute('hidden');
    requestAnimationFrame(function() {
      overlay.classList.add('open');
    });
    setTimeout(function() { inputEl.focus(); }, 100);
    document.body.style.overflow = 'hidden';
  }

  function closeTerminal() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('open');
    setTimeout(function() {
      overlay.setAttribute('hidden', '');
    }, 300);
    document.body.style.overflow = '';
  }

  /* ── Keyboard activation ───────────────────────────────────── */
  document.addEventListener('keydown', function(e) {
    if (e.key === '/' && !isOpen) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      openTerminal();
    }
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeTerminal();
    }
  });

  /* ── Listen for external open event (from command palette) ── */
  document.addEventListener('openTerminal', openTerminal);

  /* ── Init ──────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildTerminal);
  } else {
    buildTerminal();
  }

  window.openTerminal = openTerminal;

})();
