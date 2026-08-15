#!/usr/bin/env python3
"""
Portfolio Build Script — Yasindu Mahaarachchi
============================================================
Reads content/*.txt files → generates dist/index.html

Usage:
  python3 build.py

Content file format (Key: Value, multi-line Body supported):
  Title: My Entry
  Date: 2025
  Body: Multi-line text starts here
  and continues on subsequent lines
  until a new Key: is found.
============================================================
"""

import os
import shutil
import html as html_mod
from pathlib import Path
from datetime import datetime

ROOT    = Path(__file__).parent
CONTENT = ROOT / 'content'
STATIC  = ROOT / 'static'
DIST    = ROOT / 'dist'


# ╔══════════════════════════════════════════════════════════════╗
# ║  CONTENT PARSER                                              ║
# ╚══════════════════════════════════════════════════════════════╝

def parse_txt(filepath: Path) -> dict:
    """Parse a labeled .txt file.
    Format: "Key: value" lines. Multi-line values continue until
    the next "SingleWordKey:" line. Keys are lowercased.
    """
    fields: dict[str, str] = {}
    current_key: str | None = None
    current_lines: list[str] = []

    with open(filepath, encoding='utf-8') as f:
        for raw in f:
            line = raw.rstrip('\n')
            # A new field starts when the line has "Word:" at the start
            # (no leading whitespace, key has no spaces)
            if ':' in line and not line.startswith((' ', '\t')):
                colon = line.index(':')
                key_candidate = line[:colon].strip()
                if key_candidate and ' ' not in key_candidate and key_candidate.isidentifier():
                    if current_key is not None:
                        fields[current_key] = '\n'.join(current_lines).strip()
                    current_key = key_candidate.lower()
                    current_lines = [line[colon + 1:].strip()]
                    continue
            if current_key is not None:
                current_lines.append(line)

    if current_key is not None:
        fields[current_key] = '\n'.join(current_lines).strip()

    return fields


def load_folder(folder: Path) -> list[dict]:
    """Load and sort all .txt files from a folder."""
    items = []
    if not folder.exists():
        return items
    for f in sorted(folder.glob('*.txt')):
        data = parse_txt(f)
        data['_slug'] = f.stem
        items.append(data)
    # Allow explicit ordering via "Order:" field
    items.sort(key=lambda x: int(x.get('order', '99')))
    return items


# ╔══════════════════════════════════════════════════════════════╗
# ║  HTML HELPERS                                                ║
# ╚══════════════════════════════════════════════════════════════╝

def h(text) -> str:
    """HTML-escape a value safely."""
    return html_mod.escape(str(text)) if text else ''


def nl2p(text: str) -> str:
    """Convert double-newline paragraphs to <p> tags."""
    if not text:
        return ''
    paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    return ''.join(f'<p>{h(para)}</p>' for para in paras)


def tag_pills(tags_str: str) -> str:
    if not tags_str:
        return ''
    pills = ''.join(
        f'<span class="pill">{h(t.strip())}</span>'
        for t in tags_str.split(',') if t.strip()
    )
    return f'<div class="pills">{pills}</div>'


def ext_link(url: str, label: str, icon: str = '↗') -> str:
    if not url or url.strip() in ('#', ''):
        return ''
    return (
        f'<a href="{h(url)}" target="_blank" rel="noopener noreferrer" '
        f'class="ext-link">{icon} {h(label)}</a>'
    )


# ╔══════════════════════════════════════════════════════════════╗
# ║  LIGHT MODE SECTION GENERATORS                               ║
# ╚══════════════════════════════════════════════════════════════╝

def gen_hero(identity: dict) -> str:
    name    = identity.get('name', 'Yasindu Mahaarachchi')
    tagline = identity.get('tagline', '')
    bio     = identity.get('bio', '')
    email   = identity.get('email', '')
    linkedin = identity.get('linkedin', '')
    github  = identity.get('github', '')
    cv      = identity.get('cv', '#')
    photo   = identity.get('photo', 'static/assets/profile.jpg')

    first_name = name.split()[0] if name else name

    socials = ''
    if email:
        socials += f'<a href="mailto:{h(email)}" class="social-link" title="Email" aria-label="Email">✉</a>'
    if linkedin:
        url = linkedin if linkedin.startswith('http') else f'https://{linkedin}'
        socials += f'<a href="{h(url)}" target="_blank" rel="noopener" class="social-link" title="LinkedIn" aria-label="LinkedIn">in</a>'
    if github:
        url = github if github.startswith('http') else f'https://{github}'
        socials += f'<a href="{h(url)}" target="_blank" rel="noopener" class="social-link" title="GitHub" aria-label="GitHub">&#9679;</a>'

    return f"""
  <section class="hero" id="hero" aria-label="Introduction">
    <div class="hero-content">
      <p class="hero-eyebrow">Hello, I'm</p>
      <h1 class="hero-name">{h(name)}</h1>
      <p class="hero-tagline">{h(tagline)}</p>
      <p class="hero-bio">{h(bio)}</p>
      <div class="hero-actions">
        <a href="{h(cv)}" class="btn btn-primary" id="hero-cv-btn">⬇ Download CV</a>
        <a href="#contact" class="btn btn-outline" id="hero-contact-btn">✉ Get in Touch</a>
      </div>
      <div class="hero-socials" aria-label="Social links">{socials}</div>
    </div>
    <div class="hero-photo-wrap">
      <img src="{h(photo)}" alt="Portrait of {h(name)}" class="hero-photo" width="420" height="525" />
    </div>
  </section>"""


def gen_about(identity: dict) -> str:
    bio      = identity.get('bio', '')
    langs    = identity.get('languages', '')
    location = identity.get('location', '')

    meta_html = ''
    if location:
        meta_html += f'''
        <div class="meta-item">
          <span class="meta-label">Location</span>
          <span class="meta-value">{h(location)}</span>
        </div>'''
    if langs:
        meta_html += f'''
        <div class="meta-item">
          <span class="meta-label">Languages</span>
          <span class="meta-value">{h(langs)}</span>
        </div>'''

    return f"""
  <section class="section" id="about" aria-label="About Me">
    <div class="section-inner">
      <h2 class="section-title">About Me</h2>
      <div class="about-grid">
        <div class="about-text"><p>{h(bio)}</p></div>
        <div class="about-meta">{meta_html}</div>
      </div>
    </div>
  </section>"""


def gen_education(education: list) -> str:
    items = ''
    for edu in education:
        detail = f'<p class="timeline-detail">{h(edu["detail"])}</p>' if edu.get('detail') else ''
        items += f"""
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          <div class="timeline-header">
            <h3 class="timeline-title">{h(edu.get("institution", ""))}</h3>
            <span class="timeline-date">{h(edu.get("period", ""))}</span>
          </div>
          <p class="timeline-subtitle">{h(edu.get("degree", ""))}</p>
          {detail}
        </div>
      </div>"""

    return f"""
  <section class="section" id="education" aria-label="Educational Qualifications">
    <div class="section-inner">
      <h2 class="section-title">Educational Qualifications</h2>
      <div class="timeline">{items}</div>
    </div>
  </section>"""


def gen_professional_quals() -> str:
    return """
  <section class="section" id="professional" aria-label="Professional Qualifications">
    <div class="section-inner">
      <h2 class="section-title">Professional Qualifications</h2>
      <div class="qual-card">
        <div class="qual-header">
          <img src="assets/logos/cima.png"
               alt="CIMA logo"
               class="qual-logo"
               onerror="this.style.display='none'" />
          <div>
            <h3 class="qual-name">Chartered Institute of Management Accountants (CIMA – UK)</h3>
            <p class="qual-sub">Management Accounting Qualification · 2025 – Present</p>
          </div>
        </div>
        <div class="cima-progress">
          <div class="cima-level">
            <span class="cima-level-name">Strategic Level</span>
            <span class="badge badge-ongoing">Currently Reading</span>
            <span class="cima-detail">SCS — Strategic Case Study · In Progress</span>
          </div>
          <div class="cima-level">
            <span class="cima-level-name">Management Level</span>
            <span class="badge badge-completed">Completed</span>
            <span class="cima-detail">Management Case Study · Score: 111 Marks</span>
          </div>
        </div>
      </div>
    </div>
  </section>"""


def gen_experience(experience: list) -> str:
    items = ''
    for exp in experience:
        desc_html = ''
        if exp.get('description'):
            lines = exp['description'].split('\n')
            desc_html = '<p class="timeline-detail">' + '<br>'.join(h(l) for l in lines) + '</p>'
        items += f"""
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          <div class="timeline-header">
            <h3 class="timeline-title">{h(exp.get("title", ""))}</h3>
            <span class="timeline-date">{h(exp.get("period", ""))}</span>
          </div>
          <p class="timeline-subtitle">{h(exp.get("company", ""))}</p>
          {desc_html}
        </div>
      </div>"""

    return f"""
  <section class="section" id="experience" aria-label="Experience">
    <div class="section-inner">
      <h2 class="section-title">Experience</h2>
      <div class="timeline">{items}</div>
    </div>
  </section>"""


def gen_skills(identity: dict) -> str:
    skills_str = identity.get('skills', '')
    if not skills_str:
        return ''
    pills = ''.join(
        f'<span class="skill-pill">{h(s.strip())}</span>'
        for s in skills_str.split(',') if s.strip()
    )
    return f"""
  <section class="section" id="skills" aria-label="Skills">
    <div class="section-inner">
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">{pills}</div>
    </div>
  </section>"""


def gen_projects(projects: list) -> str:
    cards = ''
    for proj in projects:
        slug   = proj.get('_slug', '')
        status = proj.get('status', 'Completed').strip()
        badge  = 'badge-completed' if status.lower() == 'completed' else 'badge-ongoing'

        screenshot_html = ''
        sc = proj.get('screenshot', '').strip()
        if sc:
            screenshot_html = (
                f'<img src="assets/projects/{h(slug)}/{h(sc)}" '
                f'alt="{h(proj.get("title", ""))} screenshot" class="project-screenshot" />'
            )

        links = (
            ext_link(proj.get('github', ''), 'GitHub', '⌥') +
            ext_link(proj.get('live', ''),   'Live App', '↗') +
            ext_link(proj.get('drive', ''),  'Project File', '📁') +
            ext_link(proj.get('dataset', ''), 'Dataset', '📊')
        )
        links_html = f'<div class="project-links">{links}</div>' if links else ''

        metric_html = ''
        if proj.get('metric'):
            metric_html = f'<p class="project-metric">→ {h(proj["metric"])}</p>'

        cards += f"""
      <div class="project-card" id="project-{h(slug)}">
        {screenshot_html}
        <div class="project-body">
          <div class="project-header">
            <h3 class="project-title">{h(proj.get("title", ""))}</h3>
            <span class="badge {badge}">{h(status)}</span>
          </div>
          {tag_pills(proj.get("tags", ""))}
          <p class="project-desc">{h(proj.get("description", ""))}</p>
          {f'<div class="project-article" style="margin-top: 15px;">{proj.get("article", "")}</div>' if proj.get("article") else ""}
          {metric_html}
          {links_html}
        </div>
      </div>"""

    return f"""
  <section class="section" id="projects" aria-label="Projects">
    <div class="section-inner">
      <h2 class="section-title">Projects</h2>
      <div class="projects-grid">{cards}</div>
    </div>
  </section>"""


def gen_certifications(certifications: list) -> str:
    cards = ''
    for cert in certifications:
        slug = cert.get('_slug', '')
        logo = cert.get('logo', '').strip()
        logo_html = ''
        if logo:
            logo_html = (
                f'<img src="assets/logos/{h(logo)}" '
                f'alt="{h(cert.get("issuer", ""))} logo" '
                f'class="cert-logo" onerror="this.style.display=\'none\'" />'
            )

        verify = cert.get('verify', '').strip()
        verify_html = ''
        if verify:
            verify_html = f'<a href="{h(verify)}" target="_blank" rel="noopener" class="verify-link">Verify ↗</a>'

        issuer   = cert.get('issuer', '')
        platform = cert.get('platform', '')
        issuer_line = ' · '.join(filter(None, [issuer, platform]))

        cards += f"""
      <div class="cert-card" id="cert-{h(slug)}">
        <div class="cert-logo-wrap">{logo_html}</div>
        <div class="cert-body">
          <h3 class="cert-title">{h(cert.get("title", ""))}</h3>
          <p class="cert-issuer">{h(issuer_line)}</p>
          <p class="cert-desc">{h(cert.get("description", ""))}</p>
          {verify_html}
        </div>
      </div>"""

    return f"""
  <section class="section" id="certifications" aria-label="Certifications">
    <div class="section-inner">
      <h2 class="section-title">Certifications &amp; Licensing</h2>
      <div class="certs-grid">{cards}</div>
    </div>
  </section>"""


def gen_events(events: list) -> str:
    if not events:
        return ''

    competition_types = {'competition', 'hackathon', 'case study', 'case-study'}
    workshop_types    = {'workshop', 'seminar', 'conference', 'workshop/seminar'}

    competitions = [e for e in events if e.get('type', '').lower() in competition_types]
    workshops    = [e for e in events if e.get('type', '').lower() in workshop_types]
    other        = [e for e in events if e not in competitions and e not in workshops]

    def render_group(title: str, group: list) -> str:
        if not group:
            return ''
        items = ''
        for ev in group:
            link_html = ''
            if ev.get('link', '').strip():
                link_html = f' <a href="{h(ev["link"])}" target="_blank" rel="noopener" class="event-link" aria-label="More info">↗</a>'
            org_html  = f'<p class="event-organizer">{h(ev["organizer"])}</p>' if ev.get('organizer') else ''
            desc_html = f'<p class="event-desc">{h(ev["description"])}</p>'    if ev.get('description') else ''
            items += f"""
          <div class="event-item">
            <div class="event-meta">
              <span class="event-type">{h(ev.get("type", ""))}</span>
              <span class="event-date">{h(ev.get("date", ""))}</span>
            </div>
            <div class="event-body">
              <h4 class="event-title">{h(ev.get("title", ""))}{link_html}</h4>
              {org_html}{desc_html}
            </div>
          </div>"""
        return f'<div class="events-group"><h3 class="events-group-title">{title}</h3>{items}</div>'

    groups = (
        render_group('Competitions &amp; Case Studies', competitions) +
        render_group('Workshops &amp; Conferences', workshops) +
        render_group('Other', other)
    )

    return f"""
  <section class="section" id="events" aria-label="Events">
    <div class="section-inner">
      <h2 class="section-title">Events</h2>
      <div class="events-grid">{groups}</div>
    </div>
  </section>"""


def gen_leadership(leadership: list) -> str:
    items = ''
    for item in leadership:
        date_html = f'<span class="leadership-date">{h(item["period"])}</span>' if item.get('period') else ''
        desc_html = f'<p class="leadership-desc">{h(item["description"])}</p>' if item.get('description') else ''
        items += f"""
      <div class="leadership-item">
        <div class="leadership-role">
          <h3 class="leadership-org">{h(item.get("organization", ""))}</h3>
          <span class="leadership-position">{h(item.get("role", ""))}</span>
          {date_html}
        </div>
        {desc_html}
      </div>"""

    return f"""
  <section class="section" id="leadership" aria-label="Leadership and Volunteering">
    <div class="section-inner">
      <h2 class="section-title">Leadership &amp; Volunteering</h2>
      <div class="leadership-grid">{items}</div>
    </div>
  </section>"""


def gen_contact(identity: dict) -> str:
    email     = identity.get('email', '')
    phone     = identity.get('phone', '')
    linkedin  = identity.get('linkedin', '')
    location  = identity.get('location', '')
    formspree = identity.get('formspree', 'YOUR_FORMSPREE_ID').strip()

    details = ''
    if email:
        details += f'''
        <div class="contact-detail">
          <span class="contact-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </span>
          <a href="mailto:{h(email)}">{h(email)}</a>
        </div>'''
    if phone:
        details += f'''
        <div class="contact-detail">
          <span class="contact-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </span>
          <span>{h(phone)}</span>
        </div>'''
    if linkedin:
        url = linkedin if linkedin.startswith('http') else f'https://{linkedin}'
        details += f'''
        <div class="contact-detail">
          <span class="contact-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </span>
          <a href="{h(url)}" target="_blank" rel="noopener">{h(linkedin)}</a>
        </div>'''
    if location:
        details += f'''
        <div class="contact-detail">
          <span class="contact-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </span>
          <span>{h(location)}</span>
        </div>'''

    return f"""
  <section class="section" id="contact" aria-label="Contact">
    <div class="section-inner">
      <h2 class="section-title">Get in Touch</h2>
      <div class="contact-grid">
        <div class="contact-form-wrap">
          <form action="https://formspree.io/f/{h(formspree)}"
                method="POST"
                class="contact-form"
                id="contact-form">
            <div class="form-group">
              <label for="cf-name">Name</label>
              <input type="text" id="cf-name" name="name"
                     placeholder="Your name" required autocomplete="name" />
            </div>
            <div class="form-group">
              <label for="cf-email">Email</label>
              <input type="email" id="cf-email" name="email"
                     placeholder="your@email.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="cf-message">Message</label>
              <textarea id="cf-message" name="message" rows="5"
                        placeholder="Your message…" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-full"
                    id="contact-submit">Send Message →</button>
          </form>
        </div>
        <div class="contact-info">{details}</div>
      </div>
    </div>
  </section>"""


# ╔══════════════════════════════════════════════════════════════╗
# ║  DARK MODE SECTION GENERATORS                                ║
# ╚══════════════════════════════════════════════════════════════╝

def gen_dark_philosophy(philosophy: list) -> str:
    if not philosophy:
        return '<div class="dark-empty"><p>Reflections coming soon.</p></div>'

    cards = ''
    for phil in philosophy:
        body_html = nl2p(phil.get('body', ''))
        cards += f"""
        <article class="dark-article">
          <header class="dark-article-header">
            <h2 class="dark-article-title">{h(phil.get("title", ""))}</h2>
            <span class="dark-article-date mono">{h(phil.get("date", ""))}</span>
          </header>
          <div class="dark-article-body">{body_html}</div>
        </article>"""

    return f'<div class="dark-articles">{cards}</div>'


def gen_dark_journeys(journeys_dir: Path) -> str:
    if not journeys_dir.exists():
        return '<div class="dark-empty"><p>Journey entries coming soon.</p></div>'

    folders = sorted([d for d in journeys_dir.iterdir() if d.is_dir()])
    if not folders:
        return '<div class="dark-empty"><p>Journey entries coming soon.</p></div>'

    subnav  = ''
    panels  = ''

    for i, folder in enumerate(folders):
        slug    = folder.name
        display = slug.replace('-', ' ').title()
        active  = 'active' if i == 0 else ''

        entries = load_folder(folder)
        entries_html = ''
        for entry in entries:
            body_html = nl2p(entry.get('body', ''))
            entries_html += f"""
            <article class="journey-entry">
              <div class="journey-entry-header">
                <h3 class="journey-entry-title">{h(entry.get("title", ""))}</h3>
                <span class="journey-entry-date mono">{h(entry.get("date", ""))}</span>
              </div>
              <div class="journey-entry-body">{body_html}</div>
            </article>"""

        if not entries_html:
            entries_html = '<p class="dark-empty-small">Entries coming soon.</p>'

        subnav += (
            f'<button class="journey-subnav-btn {active}" '
            f'data-journey="{h(slug)}" id="journey-btn-{h(slug)}">{h(display)}</button>'
        )
        panels += (
            f'<div class="journey-panel {active}" id="journey-{h(slug)}">'
            f'{entries_html}</div>'
        )

    return f"""
    <div class="journeys-wrap">
      <nav class="journey-subnav" aria-label="Journey navigation">{subnav}</nav>
      <div class="journey-panels">{panels}</div>
    </div>"""


def gen_dark_articles(articles: list) -> str:
    if not articles:
        return '<div class="dark-empty"><p>Articles &amp; media coming soon.</p></div>'

    cards = ''
    for art in articles:
        body  = art.get('body', '')
        preview_text = (body[:250].rsplit(' ', 1)[0] + '…') if len(body) > 250 else body
        link_html = ''
        if art.get('link', '').strip():
            link_html = f'<a href="{h(art["link"])}" target="_blank" rel="noopener" class="dark-read-more">Read more ↗</a>'

        cards += f"""
        <article class="dark-article">
          <header class="dark-article-header">
            <h2 class="dark-article-title">{h(art.get("title", ""))}</h2>
            <span class="dark-article-date mono">{h(art.get("date", ""))}</span>
          </header>
          <p class="dark-article-preview">{h(preview_text)}</p>
          {link_html}
        </article>"""

    return f'<div class="dark-articles">{cards}</div>'


# ╔══════════════════════════════════════════════════════════════╗
# ║  PAGE ASSEMBLY                                               ║
# ╚══════════════════════════════════════════════════════════════╝

def build_html(identity, education, experience, projects,
               certifications, events, leadership,
               philosophy, articles, journeys_dir) -> str:

    name    = identity.get('name', 'Yasindu Mahaarachchi')
    tagline = identity.get('tagline', '')
    first   = name.split()[0] if name else name
    year    = datetime.now().year

    light_sections = '\n'.join([
        gen_hero(identity),
        gen_about(identity),
        gen_education(education),
        gen_professional_quals(),
        gen_experience(experience),
        gen_skills(identity),
        gen_projects(projects),
        gen_certifications(certifications),
        gen_events(events),
        gen_leadership(leadership),
        gen_contact(identity),
    ])

    dark_phil     = gen_dark_philosophy(philosophy)
    dark_journeys = gen_dark_journeys(journeys_dir)
    dark_articles = gen_dark_articles(articles)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{h(name)}</title>
  <meta name="description" content="{h(tagline)} · Personal portfolio of {h(name)}, Transport Management and Logistics Engineering undergraduate at University of Moratuwa and CIMA Finalist." />
  <meta property="og:title"       content="{h(name)}" />
  <meta property="og:description" content="{h(tagline)}" />
  <meta property="og:type"        content="website" />
  <meta name="theme-color" content="#F7F3EC" />
  <link rel="icon" type="image/png" href="static/assets/favicon.png" />
  <link rel="apple-touch-icon" href="static/assets/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Work+Sans:ital,wght@0,300..800;1,300..800&family=Inter:wght@300..700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="static/css/style.css" />
</head>
<body class="light">

<!-- ── YIN-YANG TOGGLE ───────────────────────────────────────── -->
<button class="yy-toggle" id="yy-toggle"
        aria-label="Switch between Professional and Depth mode"
        title="Toggle mode">
  <svg class="yy-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
       role="img" aria-hidden="true">
    <!-- Dark half -->
    <circle cx="50" cy="50" r="48" class="yy-dark" />
    <!-- Light half -->
    <path d="M50,2 A48,48,0,0,1,50,98 A24,24,0,0,1,50,50 A24,24,0,0,0,50,2Z"
          class="yy-light" />
    <!-- Small circles -->
    <circle cx="50" cy="26" r="11.5" class="yy-light" />
    <circle cx="50" cy="74" r="11.5" class="yy-dark" />
    <!-- Dots -->
    <circle cx="50" cy="26" r="4.5" class="yy-dark" />
    <circle cx="50" cy="74" r="4.5" class="yy-light" />
  </svg>
</button>

<!-- ═══════════════════════════════════════════════════════════
     LIGHT MODE  (The Professional — single scroll page)
     ═══════════════════════════════════════════════════════════ -->
<div class="light-mode-content">

  <nav class="site-nav" id="site-nav" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
      <a class="nav-logo" href="#hero" aria-label="{h(name)} — home">
        <img src="static/assets/logo.png" alt="Logo" class="header-logo-img" width="30" height="30" />
        <span>{h(name)}</span>
      </a>
      <button class="nav-hamburger" id="nav-hamburger"
              aria-label="Toggle navigation menu" aria-expanded="false">☰</button>
      <ul class="nav-links" id="nav-links" role="list">
        <li><a href="#about">About</a></li>
        <li><a href="#education">Education</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#certifications">Certifications</a></li>
        <li><a href="#events">Events</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main id="main-content">{light_sections}</main>

  <footer class="site-footer" role="contentinfo">
    <div class="footer-inner">
      <p class="footer-copy">© {year} {h(name)}.</p>
      <div class="footer-links"><a href="#hero">Back to top ↑</a></div>
    </div>
  </footer>

</div><!-- /.light-mode-content -->

<!-- ═══════════════════════════════════════════════════════════
     DARK MODE  (The Depth — tabbed interface)
     ═══════════════════════════════════════════════════════════ -->
<div class="dark-mode-content">

  <nav class="dark-nav" id="dark-nav" role="navigation" aria-label="Depth navigation">
    <div class="nav-inner">
      <span class="dark-nav-logo">
        <img src="static/assets/logo.png" alt="Logo" class="header-logo-img" width="28" height="28" />
        <span>{h(name)}</span>
      </span>
      <div class="dark-tabs" id="dark-tabs" role="tablist" aria-label="Depth sections">
        <button class="dark-tab active" data-tab="philosophy"
                id="tab-btn-philosophy" role="tab" aria-selected="true"
                aria-controls="tab-philosophy">Philosophy</button>
        <button class="dark-tab" data-tab="journeys"
                id="tab-btn-journeys" role="tab" aria-selected="false"
                aria-controls="tab-journeys">Journeys</button>
        <button class="dark-tab" data-tab="articles"
                id="tab-btn-articles" role="tab" aria-selected="false"
                aria-controls="tab-articles">Articles</button>
      </div>
    </div>
  </nav>

  <main class="dark-main" id="dark-main-content">

    <div class="dark-panel active" id="tab-philosophy"
         role="tabpanel" aria-labelledby="tab-btn-philosophy">
      <div class="dark-panel-inner">
        <h1 class="dark-section-title">Philosophy</h1>
        {dark_phil}
      </div>
    </div>

    <div class="dark-panel" id="tab-journeys"
         role="tabpanel" aria-labelledby="tab-btn-journeys" hidden>
      <div class="dark-panel-inner">
        <h1 class="dark-section-title">Journeys</h1>
        {dark_journeys}
      </div>
    </div>

    <div class="dark-panel" id="tab-articles"
         role="tabpanel" aria-labelledby="tab-btn-articles" hidden>
      <div class="dark-panel-inner">
        <h1 class="dark-section-title">Articles &amp; Media</h1>
        {dark_articles}
      </div>
    </div>

  </main>

  <footer class="dark-footer" role="contentinfo">
    <div class="footer-inner">
      <p>© {year} {h(name).upper()}</p>
    </div>
  </footer>

</div><!-- /.dark-mode-content -->

<style>
  /* Inline SVG colour tie-ins using CSS vars */
  .yy-dark  {{ fill: var(--text); }}
  .yy-light {{ fill: var(--bg);   }}
</style>

<script src="static/js/toggle.js"></script>
<script src="static/js/tabs.js"></script>
</body>
</html>"""


# ╔══════════════════════════════════════════════════════════════╗
# ║  ASSET COPYING                                               ║
# ╚══════════════════════════════════════════════════════════════╝

def copy_assets():
    # Copy static/ → dist/static/
    if STATIC.exists():
        shutil.copytree(STATIC, DIST / 'static', dirs_exist_ok=True)

    assets_dest = DIST / 'assets'
    assets_dest.mkdir(exist_ok=True)

    # Copy logos
    logos_src = CONTENT / 'logos'
    if logos_src.exists():
        shutil.copytree(logos_src, assets_dest / 'logos', dirs_exist_ok=True)

    # Copy project media folders
    proj_src = CONTENT / 'projects'
    if proj_src.exists():
        for proj_dir in proj_src.iterdir():
            if proj_dir.is_dir():
                dest = assets_dest / 'projects' / proj_dir.name
                shutil.copytree(proj_dir, dest, dirs_exist_ok=True)

    # Copy cert-specific media folders
    cert_src = CONTENT / 'certifications'
    if cert_src.exists():
        for cert_dir in cert_src.iterdir():
            if cert_dir.is_dir():
                dest = assets_dest / 'certifications' / cert_dir.name
                shutil.copytree(cert_dir, dest, dirs_exist_ok=True)

    # Copy hidden admin portal HTML
    admin_portal = ROOT / 'workspace-portal-9740.html'
    if admin_portal.exists():
        shutil.copy(admin_portal, DIST / 'workspace-portal-9740.html')


# ╔══════════════════════════════════════════════════════════════╗
# ║  MAIN                                                        ║
# ╚══════════════════════════════════════════════════════════════╝

def main():
    print('🏗  Building portfolio…')

    # Load content
    identity      = parse_txt(CONTENT / 'identity.txt') if (CONTENT / 'identity.txt').exists() else {}
    education     = load_folder(CONTENT / 'education')
    experience    = load_folder(CONTENT / 'experience')
    projects      = load_folder(CONTENT / 'projects')
    certifications = load_folder(CONTENT / 'certifications')
    events        = load_folder(CONTENT / 'events')
    leadership    = load_folder(CONTENT / 'leadership')
    philosophy    = load_folder(CONTENT / 'philosophy')
    articles      = load_folder(CONTENT / 'articles')

    print(f'  ✓ Loaded {len(education)} education entries')
    print(f'  ✓ Loaded {len(experience)} experience entries')
    print(f'  ✓ Loaded {len(projects)} projects')
    print(f'  ✓ Loaded {len(certifications)} certifications')
    print(f'  ✓ Loaded {len(events)} events')
    print(f'  ✓ Loaded {len(leadership)} leadership entries')
    print(f'  ✓ Loaded {len(philosophy)} philosophy essays')
    print(f'  ✓ Loaded {len(articles)} articles')

    # Generate HTML
    html_out = build_html(
        identity, education, experience, projects,
        certifications, events, leadership,
        philosophy, articles,
        CONTENT / 'journeys'
    )

    # Write output
    DIST.mkdir(exist_ok=True)
    out_path = DIST / 'index.html'
    out_path.write_text(html_out, encoding='utf-8')
    print(f'  ✓ Generated {out_path}  ({len(html_out):,} bytes)')

    # Copy assets
    copy_assets()
    print('  ✓ Copied static assets')
    print()
    print('✅ Build complete!  Open dist/index.html in your browser.')


if __name__ == '__main__':
    main()
