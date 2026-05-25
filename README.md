# BoringTools 🚀

**100 Days. 100 Boring Tools.**

BoringTools is a collection of simple and useful micro-tools built daily to solve everyday problems.

---

## Live Demo

👉 https://boring-tools-nine.vercel.app/

---

## Built So Far

### Day 1: Text Formatter

Quick text cleanup and transformation utility.

## BoringTools — Quick Reference

Lightweight collection of small, browser-first utilities. Built daily to solve practical problems — no signup, no tracking.

Live demo: https://boring-tools-nine.vercel.app/

What you'll find here
- Short summary of the project and links to try tools locally or online.
- Three featured tools to try right now.

Featured tools

- YouTube Title Generator — `/youtube-title-generator` — Generate clickable title ideas from a topic.
- Image Compressor / Resizer — `/image-compressor` — Compress & resize images in the browser.
- Resume Bullet Rewriter — `/resume-bullet-rewriter` — Turn rough notes into resume-ready bullets.


Live tools (36)

1. Text Formatter — `/text-formatter`
2. JSON Formatter — `/json-formatter`
3. Word Counter — `/word-counter`
4. Password Generator — `/password-generator`
5. Age Calculator — `/age-calculator`
6. QR Generator — `/qr-generator`
7. Unit Converter — `/unit-converter`
8. File Name Sanitizer — `/file-name-sanitizer`
9. Image Compressor / Resizer — `/image-compressor`
10. Resume Bullet Rewriter — `/resume-bullet-rewriter`
11. Time Zone Converter — `/time-zone-converter`
12. To-Do List — `/to-do-list`
13. GST Calculator — `/gst-calculator`
14. Truth or Dare Play — `/truth-or-dare-play`
15. Pomodoro Timer — `/pomodoro-timer`
16. Roast My To-Do List — `/roast-my-todo-list`
17. Markdown Previewer — `/markdown-previewer`
18. Video Transcriber — `/video-transcriber`
19. YouTube Title Generator — `/youtube-title-generator`
20. Base Converter — `/base-converter`
21. Aspect Ratio Calculator — `/aspect-ratio-calculator`
22. Distance Between Cities — `/distance-between-cities`
23. Currency Converter — `/currency-converter`
24. LinkedIn Post Formatter — `/linkedin-post-formatter`
25. What Happened Today In History — `/what-happened-today`
26. Math Formula Calculator — `/math-formula-calculator`
27. Science Formulas Calculator — `/science-formulas-calculator`
28. Can I Trust This Website? — `/can-i-trust-this-website` (Day 28)
29. Social Account Analyzer — `/social-account-analyzer` (Day 29)
30. Attendance Calculator — `/attendance-calculator` (Day 30) — Stress-free semester planning. Know exactly how many classes you can skip and still maintain your attendance percentage.
31. YouTube Downloader — `/youtube-downloader` (Day 31) — Download videos, captions, and thumbnails from YouTube. Recommended for local use (see [Setup Guide](/SETUP_GUIDE.md)).
32. DOC to PDF Converter — `/doc-to-pdf-converter` (Day 32) — Upload DOC or DOCX files and convert them into a downloadable PDF.
33. Video to Audio Converter — `/video-to-audio-converter` (Day 33) — Upload a video and extract audio in MP3, M4A, WAV, or FLAC format.
34. Image to PDF Converter — `/image-to-pdf-converter` (Day 34) — Upload one or more images and convert them into a downloadable PDF.
35. PDF Intelligence Tool — `/pdf-intelligence-tool` (Day 35) — Analyze PDFs instantly and extract meaningful information such as summaries, key points, important dates, contacts, links, and document statistics.
36. Document Data Extractor — `/document-data-extractor` (Day 36) — Upload documents or images and automatically extract structured information including contacts, dates, financial details, links, keywords, and raw text.


Upcoming tools

None.

Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and click any tool from the homepage.

### Local vs Online

Most tools work perfectly in your browser. However, some tools like **YouTube Downloader** work better when run locally due to server-side limitations.

The **Video to Audio Converter** is live, but the hosted version accepts uploads up to about 4 MB. Larger files should be converted locally to avoid request-size limits.

**For full YouTube Downloader functionality:**
- See [Setup Guide](/SETUP_GUIDE.md) for step-by-step local installation
- Local setup enables unlimited downloads, full quality support, and no rate limits
- Takes only 2 minutes to set up

Project notes
- This repository contains many small tools under `app/` built with Next.js + Tailwind.
- The homepage lists Live and Upcoming tools; tools marked `Upcoming` are not yet linked from the homepage.

Contributing
- Open an issue or submit a PR. If adding a new tool, add a small `page.jsx` under `app/` and update the homepage registry (`app/page.jsx`).

License & author
- MIT • Ayush Sharma

---

For full change history and per-day tool notes, see the repository history (git log) — this README intentionally stays high-level.
---

## Tech Stack

- Next.js
- Tailwind CSS
- Vercel

---

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

### Optional private env vars

For the Distance Between Cities tool, add your Google Directions key to `/.env.local`:

```bash
GOOGLE_DIRECTIONS_KEY=your_key_here
```

Keep `/.env.local` out of git and set the same variable in your deployment secrets.

For the DOC to PDF Converter, add a CloudConvert API key so high-fidelity DOC/DOCX conversion works reliably in production:

```bash
CLOUDCONVERT_API_KEY=your_key_here
```

How to get the key:
1. Create or sign in to your CloudConvert account at https://cloudconvert.com/
2. Open the CloudConvert dashboard.
3. Go to API Keys.
4. Create a new API key and copy it once it is generated.

Where to configure it:
- Local development: create or update `.env.local` in the project root with `CLOUDCONVERT_API_KEY=...`
- Deployed environments: add `CLOUDCONVERT_API_KEY` in your hosting provider's environment variable settings and redeploy

Keep the key server-side only. The DOC to PDF converter reads it from the server environment so online conversions use the hosted conversion pipeline instead of local Office software.

---

## Goal

Build 100 small tools in 100 days and turn them into a useful ecosystem.

---

## Progress


- Live: **36 tools** (listed on the homepage)
 - Upcoming: **0 tools**

Visit the homepage to browse Live tools and try them in your browser.

## Suggestions

Suggestions submitted from the home page are sent to the Google Sheets-backed intake workflow. For live deployment, configure the spreadsheet credentials in Vercel environment variables and redeploy.

---

## Philosophy

> "Boring problems. Simple tools."

---

## Author

Ayush Sharma