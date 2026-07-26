/* ═══════════════════════════════════════════════════════════════
   ADMIN PORTAL JS — Yasindu Mahaarachchi
   Handles password auth, PAT storage in sessionStorage,
   GitHub Contents API CRUD operations, file uploads & reordering.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const REPO_OWNER = 'yasindu203';
  const REPO_NAME = 'Yasindu-Mahaarachchi-Portfolio';
  const AUTH_PASS = 'yas@4970';
  const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

  // State
  let patToken = sessionStorage.getItem('ap_pat') || '';
  let isAuthenticated = sessionStorage.getItem('ap_auth') === 'true';

  // DOM Elements
  const passwordModal = document.getElementById('ap-password-modal');
  const patModal = document.getElementById('ap-pat-modal');
  const appContainer = document.getElementById('ap-app');
  const passInput = document.getElementById('ap-pass-input');
  const passSubmit = document.getElementById('ap-pass-submit');
  const passError = document.getElementById('ap-pass-error');
  const patInput = document.getElementById('ap-pat-input');
  const patSubmit = document.getElementById('ap-pat-submit');
  const patError = document.getElementById('ap-pat-error');
  const dashContent = document.getElementById('ap-dash-content');
  const editorContainer = document.getElementById('ap-editor-container');

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    if (!isAuthenticated) {
      showModal(passwordModal);
    } else if (!patToken) {
      showModal(patModal);
    } else {
      unlockApp();
    }
  }

  function showModal(modal) {
    passwordModal.style.display = 'none';
    patModal.style.display = 'none';
    appContainer.style.display = 'none';
    modal.style.display = 'flex';
  }

  function unlockApp() {
    passwordModal.style.display = 'none';
    patModal.style.display = 'none';
    appContainer.style.display = 'flex';
    loadDashboard();
  }

  // ── AUTH HANDLERS ────────────────────────────────────────────
  if (passSubmit) {
    passSubmit.addEventListener('click', function () {
      if (passInput.value === AUTH_PASS) {
        isAuthenticated = true;
        sessionStorage.setItem('ap_auth', 'true');
        passError.style.display = 'none';
        if (!patToken) {
          showModal(patModal);
        } else {
          unlockApp();
        }
      } else {
        passError.textContent = 'Incorrect password.';
        passError.style.display = 'block';
      }
    });
  }

  if (patSubmit) {
    patSubmit.addEventListener('click', async function () {
      const token = patInput.value.trim();
      if (!token) return;

      patError.style.display = 'none';
      patSubmit.textContent = 'Verifying Token...';

      try {
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
          headers: { Authorization: `token ${token}` }
        });
        if (res.ok) {
          patToken = token;
          sessionStorage.setItem('ap_pat', token);
          unlockApp();
        } else {
          patError.textContent = 'Invalid token or insufficient permissions (needs Contents: Read & Write).';
          patError.style.display = 'block';
        }
      } catch (err) {
        patError.textContent = 'Network error verifying token.';
        patError.style.display = 'block';
      } finally {
        patSubmit.textContent = 'Unlock Dashboard →';
      }
    });
  }

  // ── GITHUB API HELPERS ───────────────────────────────────────
  async function ghFetch(path) {
    const res = await fetch(`${API_BASE}/${path}`, {
      headers: { Authorization: `token ${patToken}` }
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return await res.json();
  }

  async function ghPut(path, contentBase64, sha, commitMsg) {
    const body = {
      message: commitMsg || `admin: update ${path}`,
      content: contentBase64
    };
    if (sha) body.sha = sha;

    const res = await fetch(`${API_BASE}/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${patToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to save file to GitHub');
    }
    return await res.json();
  }

  async function ghDelete(path, sha, commitMsg) {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${patToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMsg || `admin: delete ${path}`,
        sha: sha
      })
    });
    if (!res.ok) throw new Error('Failed to delete file from GitHub');
    return await res.json();
  }

  // Base64 Helpers
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function base64ToUtf8(str) {
    return decodeURIComponent(escape(atob(str.replace(/\n/g, ''))));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.slice(result.indexOf(',') + 1);
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Toast Notification
  function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'ap-toast';
    if (isError) toast.style.borderColor = 'var(--ap-danger)';
    toast.innerHTML = `<span>${isError ? '⚠️' : '✅'}</span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ── DASHBOARD LOADING ────────────────────────────────────────
  async function loadDashboard() {
    dashContent.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ap-text-muted);">Loading content from GitHub...</div>';

    try {
      const [identity, education, experience, projects, certs, events, leadership, philosophy, articles] = await Promise.all([
        fetchFile('content/identity.txt').catch(() => null),
        fetchFolder('content/education'),
        fetchFolder('content/experience'),
        fetchFolder('content/projects'),
        fetchFolder('content/certifications'),
        fetchFolder('content/events'),
        fetchFolder('content/leadership'),
        fetchFolder('content/philosophy'),
        fetchFolder('content/articles')
      ]);

      renderDashboard({ identity, education, experience, projects, certs, events, leadership, philosophy, articles });
    } catch (err) {
      dashContent.innerHTML = `<div class="ap-notice" style="border-color:var(--ap-danger);color:var(--ap-danger)">Failed to load content: ${err.message}</div>`;
    }
  }

  async function fetchFile(path) {
    const data = await ghFetch(path);
    const text = base64ToUtf8(data.content);
    const parsed = parseTxt(text);
    parsed._sha = data.sha;
    parsed._path = path;
    return parsed;
  }

  async function fetchFolder(folderPath) {
    try {
      const items = await ghFetch(folderPath);
      if (!Array.isArray(items)) return [];
      const txtFiles = items.filter(f => f.name.endsWith ? f.name.endsWith('.txt') : f.name.slice(-4) === '.txt');
      
      const parsedFiles = await Promise.all(txtFiles.map(async (file) => {
        try {
          const contentData = await ghFetch(file.path);
          const text = base64ToUtf8(contentData.content);
          const parsed = parseTxt(text);
          parsed._sha = file.sha;
          parsed._path = file.path;
          parsed._name = file.name;
          parsed._slug = file.name.replace('.txt', '');
          return parsed;
        } catch {
          return null;
        }
      }));
      const valid = parsedFiles.filter(Boolean);
      // Sort by Order field if present
      valid.sort((a, b) => parseInt(a.order || '99') - parseInt(b.order || '99'));
      return valid;
    } catch {
      return [];
    }
  }

  function parseTxt(text) {
    const fields = {};
    let currentKey = null;
    let currentLines = [];

    text.split('\n').forEach(line => {
      if (line.includes(':') && !line.startsWith(' ') && !line.startsWith('\t')) {
        const colonIndex = line.indexOf(':');
        const candidate = line.slice(0, colonIndex).trim();
        if (candidate && !candidate.includes(' ')) {
          if (currentKey !== null) {
            fields[currentKey] = currentLines.join('\n').trim();
          }
          currentKey = candidate.toLowerCase();
          currentLines = [line.slice(colonIndex + 1).trim()];
          return;
        }
      }
      if (currentKey !== null) {
        currentLines.push(line);
      }
    });
    if (currentKey !== null) {
      fields[currentKey] = currentLines.join('\n').trim();
    }
    return fields;
  }

  // ── RENDER DASHBOARD ─────────────────────────────────────────
  function renderDashboard(data) {
    dashContent.innerHTML = `
      <div class="ap-dash-grid">
        <!-- Identity Card -->
        <div class="ap-dash-card">
          <div class="ap-dash-card-header">
            <h3 class="ap-dash-card-title">👤 Identity, Photo &amp; Skills</h3>
            <button class="ap-btn ap-btn-secondary" id="ap-edit-identity">Edit Profile</button>
          </div>
          <p style="font-size:0.9rem;"><strong>${data.identity?.name || 'Yasindu Mahaarachchi'}</strong></p>
          <p style="font-size:0.8rem;color:var(--ap-text-muted);">${data.identity?.tagline || ''}</p>
        </div>

        <!-- Education Card -->
        <div class="ap-dash-card">
          <div class="ap-dash-card-header">
            <h3 class="ap-dash-card-title">🎓 Education</h3>
            <span class="ap-dash-card-count">${data.education.length}</span>
            <button class="ap-btn ap-btn-primary" id="ap-new-education">+ Add Qualification</button>
          </div>
          <div class="ap-item-list">
            ${data.education.map(e => `
              <div class="ap-item-row">
                <span class="ap-item-name">[Order ${e.order || '99'}] ${e.institution || e._slug}</span>
                <div class="ap-item-actions">
                  <button class="ap-btn-icon" onclick="window.editEducation('${e._slug}')">✏️</button>
                  <button class="ap-btn-icon danger" onclick="window.deleteItem('${e._path}', '${e._sha}')">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Projects Card -->
        <div class="ap-dash-card">
          <div class="ap-dash-card-header">
            <h3 class="ap-dash-card-title">🚀 Projects</h3>
            <span class="ap-dash-card-count">${data.projects.length}</span>
            <button class="ap-btn ap-btn-primary" id="ap-new-project">+ New Project</button>
          </div>
          <div class="ap-item-list">
            ${data.projects.map(p => `
              <div class="ap-item-row">
                <span class="ap-item-name">[Order ${p.order || '99'}] ${p.title || p._slug}</span>
                <div class="ap-item-actions">
                  <button class="ap-btn-icon" onclick="window.editProject('${p._slug}')">✏️</button>
                  <button class="ap-btn-icon danger" onclick="window.deleteItem('${p._path}', '${p._sha}')">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Certifications Card -->
        <div class="ap-dash-card">
          <div class="ap-dash-card-header">
            <h3 class="ap-dash-card-title">📜 Certifications</h3>
            <span class="ap-dash-card-count">${data.certs.length}</span>
            <button class="ap-btn ap-btn-primary" id="ap-new-cert">+ New Cert</button>
          </div>
          <div class="ap-item-list">
            ${data.certs.map(c => `
              <div class="ap-item-row">
                <span class="ap-item-name">[Order ${c.order || '99'}] ${c.title || c._slug}</span>
                <div class="ap-item-actions">
                  <button class="ap-btn-icon" onclick="window.editCert('${c._slug}')">✏️</button>
                  <button class="ap-btn-icon danger" onclick="window.deleteItem('${c._path}', '${c._sha}')">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Events Card -->
        <div class="ap-dash-card">
          <div class="ap-dash-card-header">
            <h3 class="ap-dash-card-title">📅 Events</h3>
            <span class="ap-dash-card-count">${data.events.length}</span>
            <button class="ap-btn ap-btn-primary" id="ap-new-event">+ New Event</button>
          </div>
          <div class="ap-item-list">
            ${data.events.map(e => `
              <div class="ap-item-row">
                <span class="ap-item-name">${e.title || e._slug}</span>
                <div class="ap-item-actions">
                  <button class="ap-btn-icon" onclick="window.editEvent('${e._slug}')">✏️</button>
                  <button class="ap-btn-icon danger" onclick="window.deleteItem('${e._path}', '${e._sha}')">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Philosophy Card -->
        <div class="ap-dash-card">
          <div class="ap-dash-card-header">
            <h3 class="ap-dash-card-title">💡 Philosophy</h3>
            <span class="ap-dash-card-count">${data.philosophy.length}</span>
            <button class="ap-btn ap-btn-primary" id="ap-new-philosophy">+ New Essay</button>
          </div>
          <div class="ap-item-list">
            ${data.philosophy.map(ph => `
              <div class="ap-item-row">
                <span class="ap-item-name">${ph.title || ph._slug}</span>
                <div class="ap-item-actions">
                  <button class="ap-btn-icon" onclick="window.editPhilosophy('${ph._slug}')">✏️</button>
                  <button class="ap-btn-icon danger" onclick="window.deleteItem('${ph._path}', '${ph._sha}')">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Bind Actions
    document.getElementById('ap-edit-identity').onclick = () => openIdentityEditor(data.identity);
    document.getElementById('ap-new-education').onclick = () => openEducationEditor();
    document.getElementById('ap-new-project').onclick = () => openProjectEditor();
    document.getElementById('ap-new-cert').onclick = () => openCertEditor();
    document.getElementById('ap-new-event').onclick = () => openEventEditor();
    document.getElementById('ap-new-philosophy').onclick = () => openPhilosophyEditor();
  }

  // ── IDENTITY & PHOTO EDITOR ──────────────────────────────────
  function openIdentityEditor(identity = {}) {
    editorContainer.style.display = 'block';
    editorContainer.innerHTML = `
      <div class="ap-editor-panel">
        <div class="ap-editor-header">
          <h2 class="ap-editor-title">Edit Identity, Photo &amp; Skills</h2>
          <button class="ap-btn ap-btn-secondary" onclick="document.getElementById('ap-editor-container').style.display='none'">Close</button>
        </div>
        <form id="ap-identity-form">
          <div class="ap-form-group">
            <label class="ap-label">Full Name</label>
            <input class="ap-input" id="id-name" value="${identity.name || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Tagline</label>
            <input class="ap-input" id="id-tagline" value="${identity.tagline || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Bio</label>
            <textarea class="ap-textarea" id="id-bio">${identity.bio || ''}</textarea>
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Email</label>
            <input class="ap-input" id="id-email" value="${identity.email || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Phone</label>
            <input class="ap-input" id="id-phone" value="${identity.phone || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Location</label>
            <input class="ap-input" id="id-location" value="${identity.location || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">LinkedIn</label>
            <input class="ap-input" id="id-linkedin" value="${identity.linkedin || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Skills (comma-separated list)</label>
            <input class="ap-input" id="id-skills" value="${identity.skills || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Formspree Endpoint ID</label>
            <input class="ap-input" id="id-formspree" value="${identity.formspree || ''}" />
          </div>

          <!-- Photo & CV Uploaders -->
          <div style="border-top:1px solid var(--ap-border);padding-top:20px;margin-top:20px;">
            <h3 style="font-size:1rem;color:var(--ap-accent);margin-bottom:12px;">📷 Change Profile Photo</h3>
            <div class="ap-form-group">
              <input type="file" id="id-photo-file" accept="image/*" class="ap-input" />
              <p style="font-size:0.75rem;color:var(--ap-text-muted);">Upload a new photo to replace <code>static/assets/profile.jpg</code>.</p>
            </div>
          </div>

          <div style="border-top:1px solid var(--ap-border);padding-top:20px;margin-top:20px;">
            <h3 style="font-size:1rem;color:var(--ap-accent);margin-bottom:12px;">📄 Upload New CV (PDF)</h3>
            <div class="ap-form-group">
              <input type="file" id="id-cv-file" accept=".pdf" class="ap-input" />
              <p style="font-size:0.75rem;color:var(--ap-text-muted);">Upload a new PDF to replace <code>static/assets/cv.pdf</code>.</p>
            </div>
          </div>

          <button type="submit" class="ap-btn ap-btn-primary ap-btn-full" style="margin-top:24px;">Save All Changes to GitHub</button>
        </form>
      </div>
    `;

    document.getElementById('ap-identity-form').onsubmit = async (e) => {
      e.preventDefault();

      // Check if photo file uploaded
      const photoFileInput = document.getElementById('id-photo-file');
      if (photoFileInput.files && photoFileInput.files[0]) {
        try {
          showToast('Uploading profile photo...');
          const photoBase64 = await fileToBase64(photoFileInput.files[0]);
          let existingSha = null;
          try {
            const existing = await ghFetch('static/assets/profile.jpg');
            existingSha = existing.sha;
          } catch {}
          await ghPut('static/assets/profile.jpg', photoBase64, existingSha, 'admin: update profile photo');
          showToast('Profile photo updated!');
        } catch (err) {
          showToast('Photo upload failed: ' + err.message, true);
        }
      }

      // Check if CV file uploaded
      const cvFileInput = document.getElementById('id-cv-file');
      if (cvFileInput.files && cvFileInput.files[0]) {
        try {
          showToast('Uploading CV PDF...');
          const cvBase64 = await fileToBase64(cvFileInput.files[0]);
          let existingSha = null;
          try {
            const existing = await ghFetch('static/assets/cv.pdf');
            existingSha = existing.sha;
          } catch {}
          await ghPut('static/assets/cv.pdf', cvBase64, existingSha, 'admin: update cv.pdf');
          showToast('CV PDF updated!');
        } catch (err) {
          showToast('CV upload failed: ' + err.message, true);
        }
      }

      // Update identity.txt
      const txt = [
        `Name: ${document.getElementById('id-name').value}`,
        `Tagline: ${document.getElementById('id-tagline').value}`,
        `Bio: ${document.getElementById('id-bio').value}`,
        `Phone: ${document.getElementById('id-phone').value}`,
        `Email: ${document.getElementById('id-email').value}`,
        `LinkedIn: ${document.getElementById('id-linkedin').value}`,
        `GitHub: ${identity.github || ''}`,
        `Location: ${document.getElementById('id-location').value}`,
        `Languages: ${identity.languages || 'English, Sinhala'}`,
        `Skills: ${document.getElementById('id-skills').value}`,
        `CV: static/assets/cv.pdf`,
        `Photo: static/assets/profile.jpg`,
        `Formspree: ${document.getElementById('id-formspree').value}`
      ].join('\n');

      try {
        await ghPut('content/identity.txt', utf8ToBase64(txt), identity._sha, 'admin: update identity.txt');
        showToast('Identity & profile updated! Rebuild triggered.');
        editorContainer.style.display = 'none';
        loadDashboard();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  }

  // ── EDUCATION EDITOR ─────────────────────────────────────────
  function openEducationEditor(edu = {}) {
    editorContainer.style.display = 'block';
    const isNew = !edu._slug;
    editorContainer.innerHTML = `
      <div class="ap-editor-panel">
        <div class="ap-editor-header">
          <h2 class="ap-editor-title">${isNew ? 'Add Educational Qualification' : 'Edit Educational Qualification'}</h2>
          <button class="ap-btn ap-btn-secondary" onclick="document.getElementById('ap-editor-container').style.display='none'">Close</button>
        </div>
        <form id="ap-edu-form">
          ${isNew ? `
            <div class="ap-form-group">
              <label class="ap-label">Slug (filename, e.g. university-of-moratuwa)</label>
              <input class="ap-input" id="edu-slug" required placeholder="university-of-moratuwa" />
            </div>
          ` : ''}
          <div class="ap-form-group">
            <label class="ap-label">Institution Name</label>
            <input class="ap-input" id="edu-institution" value="${edu.institution || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Degree / Stream Title</label>
            <input class="ap-input" id="edu-degree" value="${edu.degree || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Period (e.g., 2024 – Present)</label>
            <input class="ap-input" id="edu-period" value="${edu.period || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Detail / Extra Points</label>
            <textarea class="ap-textarea" id="edu-detail">${edu.detail || ''}</textarea>
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Display Order (e.g. 1 for top, 2 for second)</label>
            <input type="number" class="ap-input" id="edu-order" value="${edu.order || '1'}" min="1" max="99" required />
          </div>
          <button type="submit" class="ap-btn ap-btn-primary ap-btn-full">Save Education Entry</button>
        </form>
      </div>
    `;

    document.getElementById('ap-edu-form').onsubmit = async (e) => {
      e.preventDefault();
      const slug = isNew ? document.getElementById('edu-slug').value.trim() : edu._slug;
      const path = `content/education/${slug}.txt`;

      const txt = [
        `Institution: ${document.getElementById('edu-institution').value}`,
        `Degree: ${document.getElementById('edu-degree').value}`,
        `Period: ${document.getElementById('edu-period').value}`,
        `Detail: ${document.getElementById('edu-detail').value}`,
        `Order: ${document.getElementById('edu-order').value}`
      ].join('\n');

      try {
        await ghPut(path, utf8ToBase64(txt), edu._sha, `admin: save education ${slug}`);
        showToast('Education entry saved!');
        editorContainer.style.display = 'none';
        loadDashboard();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  }

  // ── PROJECT EDITOR ───────────────────────────────────────────
  function openProjectEditor(project = {}) {
    editorContainer.style.display = 'block';
    const isNew = !project._slug;
    editorContainer.innerHTML = `
      <div class="ap-editor-panel">
        <div class="ap-editor-header">
          <h2 class="ap-editor-title">${isNew ? 'Create New Project' : 'Edit Project'}</h2>
          <button class="ap-btn ap-btn-secondary" onclick="document.getElementById('ap-editor-container').style.display='none'">Close</button>
        </div>
        <form id="ap-project-form">
          ${isNew ? `
            <div class="ap-form-group">
              <label class="ap-label">Project Slug (filename, e.g. algorithmic-analytics)</label>
              <input class="ap-input" id="proj-slug" required placeholder="algorithmic-analytics" />
            </div>
          ` : ''}
          <div class="ap-form-group">
            <label class="ap-label">Title</label>
            <input class="ap-input" id="proj-title" value="${project.title || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Tags (comma-separated)</label>
            <input class="ap-input" id="proj-tags" value="${project.tags || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Status</label>
            <select class="ap-select" id="proj-status">
              <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Ongoing" ${project.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
            </select>
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Description</label>
            <textarea class="ap-textarea" id="proj-desc" required>${project.description || ''}</textarea>
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Metric / Impact Highlight</label>
            <input class="ap-input" id="proj-metric" value="${project.metric || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">GitHub Link</label>
            <input class="ap-input" id="proj-github" value="${project.github || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Drive Link</label>
            <input class="ap-input" id="proj-drive" value="${project.drive || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Live Demo Link</label>
            <input class="ap-input" id="proj-live" value="${project.live || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Display Order (e.g. 1 for top)</label>
            <input type="number" class="ap-input" id="proj-order" value="${project.order || '1'}" min="1" max="99" />
          </div>
          <button type="submit" class="ap-btn ap-btn-primary ap-btn-full">Save Project</button>
        </form>
      </div>
    `;

    document.getElementById('ap-project-form').onsubmit = async (e) => {
      e.preventDefault();
      const slug = isNew ? document.getElementById('proj-slug').value.trim() : project._slug;
      const path = `content/projects/${slug}.txt`;

      const txt = [
        `Title: ${document.getElementById('proj-title').value}`,
        `Tags: ${document.getElementById('proj-tags').value}`,
        `Description: ${document.getElementById('proj-desc').value}`,
        `Metric: ${document.getElementById('proj-metric').value}`,
        `GitHub: ${document.getElementById('proj-github').value}`,
        `Drive: ${document.getElementById('proj-drive').value}`,
        `Live: ${document.getElementById('proj-live').value}`,
        `Status: ${document.getElementById('proj-status').value}`,
        `Order: ${document.getElementById('proj-order').value}`,
        `Screenshot: ${project.screenshot || ''}`
      ].join('\n');

      try {
        await ghPut(path, utf8ToBase64(txt), project._sha, `admin: save project ${slug}`);
        showToast('Project saved!');
        editorContainer.style.display = 'none';
        loadDashboard();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  }

  // ── CERT EDITOR ──────────────────────────────────────────────
  function openCertEditor(cert = {}) {
    editorContainer.style.display = 'block';
    const isNew = !cert._slug;
    editorContainer.innerHTML = `
      <div class="ap-editor-panel">
        <div class="ap-editor-header">
          <h2 class="ap-editor-title">${isNew ? 'Create Certification' : 'Edit Certification'}</h2>
          <button class="ap-btn ap-btn-secondary" onclick="document.getElementById('ap-editor-container').style.display='none'">Close</button>
        </div>
        <form id="ap-cert-form">
          ${isNew ? `
            <div class="ap-form-group">
              <label class="ap-label">Slug (filename)</label>
              <input class="ap-input" id="cert-slug" required placeholder="mckinsey-forward" />
            </div>
          ` : ''}
          <div class="ap-form-group">
            <label class="ap-label">Title</label>
            <input class="ap-input" id="cert-title" value="${cert.title || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Issuer</label>
            <input class="ap-input" id="cert-issuer" value="${cert.issuer || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Platform</label>
            <input class="ap-input" id="cert-platform" value="${cert.platform || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Description</label>
            <textarea class="ap-textarea" id="cert-desc">${cert.description || ''}</textarea>
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Verification Link</label>
            <input class="ap-input" id="cert-verify" value="${cert.verify || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Logo Filename (in content/logos/)</label>
            <input class="ap-input" id="cert-logo" value="${cert.logo || ''}" placeholder="mckinsey.png" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Display Order (e.g. 1 for top)</label>
            <input type="number" class="ap-input" id="cert-order" value="${cert.order || '1'}" min="1" max="99" />
          </div>
          <button type="submit" class="ap-btn ap-btn-primary ap-btn-full">Save Certification</button>
        </form>
      </div>
    `;

    document.getElementById('ap-cert-form').onsubmit = async (e) => {
      e.preventDefault();
      const slug = isNew ? document.getElementById('cert-slug').value.trim() : cert._slug;
      const path = `content/certifications/${slug}.txt`;

      const txt = [
        `Title: ${document.getElementById('cert-title').value}`,
        `Issuer: ${document.getElementById('cert-issuer').value}`,
        `Platform: ${document.getElementById('cert-platform').value}`,
        `Description: ${document.getElementById('cert-desc').value}`,
        `Verify: ${document.getElementById('cert-verify').value}`,
        `Logo: ${document.getElementById('cert-logo').value}`,
        `Order: ${document.getElementById('cert-order').value}`
      ].join('\n');

      try {
        await ghPut(path, utf8ToBase64(txt), cert._sha, `admin: save cert ${slug}`);
        showToast('Certification saved!');
        editorContainer.style.display = 'none';
        loadDashboard();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  }

  // ── EVENT EDITOR ─────────────────────────────────────────────
  function openEventEditor(event = {}) {
    editorContainer.style.display = 'block';
    const isNew = !event._slug;
    editorContainer.innerHTML = `
      <div class="ap-editor-panel">
        <div class="ap-editor-header">
          <h2 class="ap-editor-title">${isNew ? 'Create Event' : 'Edit Event'}</h2>
          <button class="ap-btn ap-btn-secondary" onclick="document.getElementById('ap-editor-container').style.display='none'">Close</button>
        </div>
        <form id="ap-event-form">
          ${isNew ? `
            <div class="ap-form-group">
              <label class="ap-label">Slug (filename)</label>
              <input class="ap-input" id="event-slug" required placeholder="hackathon-2025" />
            </div>
          ` : ''}
          <div class="ap-form-group">
            <label class="ap-label">Event Title</label>
            <input class="ap-input" id="event-title" value="${event.title || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Type (e.g. Competition / Workshop / Conference)</label>
            <input class="ap-input" id="event-type" value="${event.type || 'Competition'}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Organizer</label>
            <input class="ap-input" id="event-organizer" value="${event.organizer || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Date (e.g., July 2025)</label>
            <input class="ap-input" id="event-date" value="${event.date || ''}" />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Description</label>
            <textarea class="ap-textarea" id="event-desc">${event.description || ''}</textarea>
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Link</label>
            <input class="ap-input" id="event-link" value="${event.link || ''}" />
          </div>
          <button type="submit" class="ap-btn ap-btn-primary ap-btn-full">Save Event</button>
        </form>
      </div>
    `;

    document.getElementById('ap-event-form').onsubmit = async (e) => {
      e.preventDefault();
      const slug = isNew ? document.getElementById('event-slug').value.trim() : event._slug;
      const path = `content/events/${slug}.txt`;

      const txt = [
        `Title: ${document.getElementById('event-title').value}`,
        `Type: ${document.getElementById('event-type').value}`,
        `Organizer: ${document.getElementById('event-organizer').value}`,
        `Date: ${document.getElementById('event-date').value}`,
        `Description: ${document.getElementById('event-desc').value}`,
        `Link: ${document.getElementById('event-link').value}`
      ].join('\n');

      try {
        await ghPut(path, utf8ToBase64(txt), event._sha, `admin: save event ${slug}`);
        showToast('Event saved!');
        editorContainer.style.display = 'none';
        loadDashboard();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  }

  // ── PHILOSOPHY EDITOR ────────────────────────────────────────
  function openPhilosophyEditor(phil = {}) {
    editorContainer.style.display = 'block';
    const isNew = !phil._slug;
    editorContainer.innerHTML = `
      <div class="ap-editor-panel">
        <div class="ap-editor-header">
          <h2 class="ap-editor-title">${isNew ? 'Create Philosophy Essay' : 'Edit Essay'}</h2>
          <button class="ap-btn ap-btn-secondary" onclick="document.getElementById('ap-editor-container').style.display='none'">Close</button>
        </div>
        <form id="ap-phil-form">
          ${isNew ? `
            <div class="ap-form-group">
              <label class="ap-label">Slug (filename)</label>
              <input class="ap-input" id="phil-slug" required placeholder="on-systems-thinking" />
            </div>
          ` : ''}
          <div class="ap-form-group">
            <label class="ap-label">Title</label>
            <input class="ap-input" id="phil-title" value="${phil.title || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Date (e.g. July 2025)</label>
            <input class="ap-input" id="phil-date" value="${phil.date || ''}" required />
          </div>
          <div class="ap-form-group">
            <label class="ap-label">Body Text (Separated by blank lines)</label>
            <textarea class="ap-textarea" id="phil-body" style="min-height:220px;" required>${phil.body || ''}</textarea>
          </div>
          <button type="submit" class="ap-btn ap-btn-primary ap-btn-full">Save Essay</button>
        </form>
      </div>
    `;

    document.getElementById('ap-phil-form').onsubmit = async (e) => {
      e.preventDefault();
      const slug = isNew ? document.getElementById('phil-slug').value.trim() : phil._slug;
      const path = `content/philosophy/${slug}.txt`;

      const txt = [
        `Title: ${document.getElementById('phil-title').value}`,
        `Date: ${document.getElementById('phil-date').value}`,
        `Body: ${document.getElementById('phil-body').value}`
      ].join('\n');

      try {
        await ghPut(path, utf8ToBase64(txt), phil._sha, `admin: save philosophy ${slug}`);
        showToast('Essay saved!');
        editorContainer.style.display = 'none';
        loadDashboard();
      } catch (err) {
        showToast(err.message, true);
      }
    };
  }

  // ── GLOBAL DELETE & EDIT HOOKS ───────────────────────────────
  window.deleteItem = async function (path, sha) {
    if (!confirm(`Are you sure you want to delete ${path}?`)) return;
    try {
      await ghDelete(path, sha, `admin: delete ${path}`);
      showToast('Item deleted!');
      loadDashboard();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  window.editEducation = async (slug) => {
    const edu = await fetchFile(`content/education/${slug}.txt`);
    openEducationEditor(edu);
  };

  window.editProject = async (slug) => {
    const proj = await fetchFile(`content/projects/${slug}.txt`);
    openProjectEditor(proj);
  };

  window.editCert = async (slug) => {
    const cert = await fetchFile(`content/certifications/${slug}.txt`);
    openCertEditor(cert);
  };

  window.editEvent = async (slug) => {
    const ev = await fetchFile(`content/events/${slug}.txt`);
    openEventEditor(ev);
  };

  window.editPhilosophy = async (slug) => {
    const ph = await fetchFile(`content/philosophy/${slug}.txt`);
    openPhilosophyEditor(ph);
  };

  // Start app
  init();
})();
