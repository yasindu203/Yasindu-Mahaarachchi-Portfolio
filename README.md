# Yasindu Mahaarachchi — Portfolio

A dual-mode personal portfolio site. Toggle between **Professional** (light, single-scroll) and **Depth** (dark, tabbed) modes using the yin-yang button.

---

## How to update content

All content lives in the `content/` folder. You never need to touch any code.

### Add a new project

1. Go to `content/projects/` on GitHub
2. Click **Add file → Create new file**
3. Name it `your-project-name.txt` (use lowercase, hyphens for spaces)
4. Fill in this format:

```
Title: My Project Name
Tags: Python, Excel, Data Analysis
Description: What the project does and why it matters.
Metric: Key result, e.g. 30% efficiency improvement
GitHub: https://github.com/yourusername/repo
Drive: https://drive.google.com/...
Live: https://...
Status: Completed
Screenshot: screenshot.png
```

5. Click **Commit changes** — the site rebuilds automatically in ~90 seconds.

To add a screenshot: create a folder with the **same name** as your `.txt` file (e.g. `content/projects/your-project-name/`) and upload `screenshot.png` into it.

---

### Add a certification

Go to `content/certifications/` and create `cert-name.txt`:

```
Title: Certificate Name
Issuer: Issuing Organisation
Platform: Platform Name
Description: Short description. Date completed.
Verify: https://verification-link.com
Logo: logo-filename.png
```

To add a logo: upload the logo file to `content/logos/` with the filename you referenced above.

---

### Add an event

Go to `content/events/` and create `event-name.txt`:

```
Title: Event Name
Type: Competition   (or: Hackathon / Workshop / Conference / Seminar)
Organizer: Organising body
Date: Month Year
Description: What happened / your role.
Link: https://...
```

---

### Add a Philosophy essay (dark mode)

Go to `content/philosophy/` and create `essay-title.txt`:

```
Title: Essay Title
Date: Month Year
Body: Your essay text here.

Paragraphs separated by blank lines render as separate paragraphs.
```

---

### Add a Journey entry

Go to `content/journeys/cima/` (or `content/journeys/engineering-frontiers/`) and create `entry-name.txt`:

```
Title: Entry Title
Date: Month Year
Body: Your journal entry here.

New paragraphs work the same way.
```

---

### Update your identity / bio / contact

Edit `content/identity.txt` directly on GitHub. Change any field value and commit.

---

### Add your Formspree contact form endpoint

1. Go to [formspree.io](https://formspree.io) and sign up free
2. Create a new form → copy the endpoint ID (looks like `xabcdefg`)
3. Edit `content/identity.txt` and replace `YOUR_FORMSPREE_ID` with your ID

---

## First-time GitHub Pages setup

After your first push to `main`:

1. Go to your repository → **Settings → Pages**
2. Set **Source** to: `Deploy from a branch`
3. Set **Branch** to: `gh-pages` / `/ (root)`
4. Click **Save**

Your site will be live at `https://yourusername.github.io/repository-name/`

---

## Local preview

```bash
python3 build.py
# then open dist/index.html in your browser
```

No dependencies needed — uses Python standard library only.

---

## Replace the profile photo

Drop your photo into `static/assets/` named `profile.jpg` and commit. The build will pick it up automatically.
