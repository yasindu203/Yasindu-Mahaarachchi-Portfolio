# Portfolio Content Guide
> **For any AI model or human adding content to this site.**  
> Follow this guide exactly to maintain visual consistency, font theme, and site aesthetics.

---

## Design System (DO NOT DEVIATE)

| Token | Value |
|---|---|
| **Heading font** | `Fjalla One` (bold display, uppercase feel) |
| **Body font** | `Cantarell` (clean, readable) |
| **Accent color** | `var(--accent)` — warm orange/gold |
| **Card style** | Flat, bordered, subtle shadow, rounded corners |
| **Tone** | Professional, data-driven, concise |

Site palette: Light mode = warm cream (#F7F3EC). Dark mode = deep dark. All colors use CSS variables.

---

## Content Directory Structure

```
content/
├── identity.txt          ← Personal info, bio, social links
├── education/            ← One .txt per qualification
├── experience/           ← One .txt per job/role
├── projects/             ← One .txt per project + optional assets folder
├── certifications/       ← One .txt per cert
├── leadership/           ← One .txt per role/org
├── philosophy/           ← One .txt per essay (dark mode)
├── articles/             ← One .txt per article
└── events/               ← One .txt per event (optional)
```

File naming: Use KEBAB-CASE.txt e.g. `machine-learning-cert.txt`
Ordering: Add `Order: 1` field. Lower number = displayed first.

---

## File Format

All files use Key: Value format. Multi-line values use --- delimiters:

```
Key: Single line value
LongKey:
---
Paragraph one.

Paragraph two.
---
```

---

## 1. Projects (content/projects/SLUG.txt)

```
Title: The Geethani Motors Project
Tags: Supply Chain, Inventory Management, Logistics, B2B, SME
Description: One to two sentence summary shown on the card. Keep it concise and impactful.
Metric: Key quantified result e.g. Reduced inventory holding cost by 18%
GitHub: https://github.com/yasindumahaarachchi/repo-name
Live:
Drive:
Dataset:
Status: Completed
Screenshot: dashboard.png
Order: 2

Article:
---
<h2>Overview</h2>
<p>Detailed narrative. Use HTML tags for structure.</p>

<h2>Challenge</h2>
<p>What problem did you solve?</p>

<h2>Approach</h2>
<p>Methods, frameworks, tools used.</p>

<h2>Results</h2>
<p>Quantified outcomes and impact.</p>
---
```

Rules:
- Title: Title Case, concise (max 10 words)
- Tags: Comma-separated, 3-7 tags
- Description: 1-2 sentences, no first person "I", data-driven
- Metric: One impactful quantified stat
- Status: Either "Completed" or "Ongoing"
- Screenshot: Filename only. Place file in content/projects/SLUG/ folder
- Article: Full HTML. Use <h2>, <h3>, <p>, <ul>, <li>, <strong>. NO inline styles.

---

## 2. Education (content/education/SLUG.txt)

```
Institution: University of Moratuwa
Degree: BSc. Engineering (Hons) in Transport Management and Logistics Engineering
Period: 2024 – Present
Detail: Semester 4 Dean's List
Order: 1
```

Rules:
- Period: Use en-dash – not hyphen. Use "Present" for ongoing.
- Detail: Achievements, GPA, honours. One line.

---

## 3. Experience (content/experience/SLUG.txt)

```
Title: Supply Chain Analyst Intern
Company: ABC Logistics (Pvt) Ltd
Period: Jun 2026 – Aug 2026
Location: Colombo, Sri Lanka
Description: Led cross-functional analysis of inventory holding costs, identifying $45k annualised savings.
Tags: Supply Chain, SAP, Inventory, Data Analysis
Order: 1
```

Rules:
- Description: Lead with impact, not duty. Use numbers.

---

## 4. Certifications (content/certifications/SLUG.txt)

```
Title: Machine Learning Specialization
Issuer: DeepLearning.AI & Stanford University
Platform: Coursera
Logo: stanford.png
Description: Completed Andrew Ng's 3-course ML specialization covering supervised learning and neural networks.
Verify: https://coursera.org/verify/XXXXXX
Status: Completed
Order: 3
```

Rules:
- Logo: Filename only. Place PNG in static/assets/logos/
- Verify: Direct verification URL. Leave blank if none.
- Status: "Completed" or "In Progress"

---

## 5. Leadership (content/leadership/SLUG.txt)

```
Organization: IEEE Student Branch — University of Moratuwa
Role: Member
Period: 2024 – Present
Description: Active member contributing to technical workshops and networking events.
Order: 1
```

---

## 6. Philosophy Essays (content/philosophy/SLUG.txt)

```
Title: On Systems Thinking in Supply Chains
Date: 2026-09-01
Summary: A short teaser sentence shown in preview.

Article:
---
<h2>Introduction</h2>
<p>Full essay in HTML. Use same heading/paragraph tags as projects.</p>
---
```

Appears in Dark Mode -> Philosophy tab only.
Tone: reflective, analytical, first-person allowed.
Date: ISO format YYYY-MM-DD

---

## Images & Assets

| Type | Location | Size |
|---|---|---|
| Profile photo | static/assets/profile.jpg | Square, min 400x400px |
| Logo/Favicon | static/assets/logo.png | 64x64px transparent PNG |
| Project screenshots | content/projects/SLUG/image.png | Min 800px wide, 16:9 preferred |
| Cert logos | static/assets/logos/issuer.png | 128x128px, transparent bg |

Format: PNG preferred. JPEG for photos. Under 500 KB each.

---

## Deploy Steps

1. Create or edit the .txt file in content/
2. Add images to the correct folder
3. Build: python3 build.py
4. Preview: python3 -m http.server 8080 (from dist/)
5. Deploy:
   git add -A
   git commit -m "content: add [type] — [name]"
   git push origin main
   git push origin $(git subtree split --prefix dist HEAD):gh-pages --force

---

## Quality Checklist

- [ ] Title is Title Case, concise
- [ ] No first-person "I" in card descriptions (ok in philosophy/journeys)
- [ ] At least one quantified metric or result
- [ ] Status is either "Completed" or "Ongoing"
- [ ] No inline styles in Article HTML
- [ ] No <style> or <script> tags in content files
- [ ] Images optimised (< 500 KB)
- [ ] Order: field set
- [ ] python3 build.py runs without errors

---

## Writing Style

DO:
- "Reduced processing time by 40%"
- "Led cross-functional team of 6"
- Quantified impact metrics
- 1-2 sentence card descriptions (save detail for Article)

DON'T:
- "I worked on making things faster"
- Vague adjectives: "improved", "enhanced" without numbers
- Paragraphs on cards
- Mixing tenses in one entry
