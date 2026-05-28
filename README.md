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
- Birthday Countdown — `/birthday-countdown` — Track time remaining until your next birthday.
- Age Difference Calculator — `/age-difference-calculator` — Compare two birth dates and calculate the exact age gap.

## Age Difference Calculator

Compare two birth dates and instantly calculate exact age differences with useful statistics and insights.

Features:
- Exact age difference
- Total days/weeks/months
- Older person detection
- Fun insights
- Downloadable report

Live tools (37)

1. Text Formatter — `/text-formatter`
2. JSON Formatter — `/json-formatter`
3. Word Counter — `/word-counter`
4. Password Generator — `/password-generator`
5. Age Calculator — `/age-calculator`
6. Birthday Countdown — `/birthday-countdown` — Track time remaining until your next birthday.
7. Age Difference Calculator — `/age-difference-calculator` — Compare two birth dates and calculate the exact age gap.
8. QR Generator — `/qr-generator`
9. Unit Converter — `/unit-converter`
10. File Name Sanitizer — `/file-name-sanitizer`
11. Image Compressor / Resizer — `/image-compressor`
12. Resume Bullet Rewriter — `/resume-bullet-rewriter`
13. Time Zone Converter — `/time-zone-converter`
14. To-Do List — `/to-do-list`
15. GST Calculator — `/gst-calculator`
16. Truth Or Dare Play — `/truth-or-dare-play`
17. Pomodoro Timer — `/pomodoro-timer`
18. Roast My To-Do List — `/roast-my-todo-list`
19. Markdown Previewer — `/markdown-previewer`
20. Video Transcriber — `/video-transcriber`
21. YouTube Title Generator — `/youtube-title-generator`
22. Base Converter — `/base-converter`
23. Aspect Ratio Calculator — `/aspect-ratio-calculator`
24. Distance Between Cities — `/distance-between-cities`
25. Currency Converter — `/currency-converter`
26. LinkedIn Post Formatter — `/linkedin-post-formatter`
27. What Happened Today In History — `/what-happened-today`
28. Math Formula Calculator — `/math-formula-calculator`
29. Science Formulas Calculator — `/science-formulas-calculator`
30. Can I Trust This Website? — `/can-i-trust-this-website` (Day 28)
31. Social Account Analyzer — `/social-account-analyzer` (Day 29)
32. Attendance Calculator — `/attendance-calculator` (Day 30) — Stress-free semester planning. Know exactly how many classes you can skip and still maintain your attendance percentage.
33. YouTube Downloader — `/youtube-downloader` (Day 31) — Download videos, captions, and thumbnails from YouTube. Recommended for local use (see [Setup Guide](/SETUP_GUIDE.md)).
34. DOC to PDF Converter — `/doc-to-pdf-converter` (Day 32) — Upload DOC or DOCX files and convert them into a downloadable PDF.
35. Video to Audio Converter — `/video-to-audio-converter` (Day 33) — Upload a video and extract audio in MP3, M4A, WAV, or FLAC format.
36. Image to PDF Converter — `/image-to-pdf-converter` (Day 34) — Upload one or more images and convert them into a downloadable PDF.
37. PDF Intelligence Tool — `/pdf-intelligence-tool` (Day 35) — Analyze PDFs instantly and extract meaningful information such as summaries, key points, important dates, contacts, links, and document statistics.
38. Document Data Extractor — `/document-data-extractor` (Day 36) — Upload documents or images and automatically extract structured information including contacts, dates, financial details, links, keywords, and raw text.


Upcoming tools

- Discount Calculator — `/discount-calculator` — Instantly calculate discounts, savings, taxes, and final payable amounts.

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

Boring Tools is open source and welcomes community contributions.

Users can:
- Suggest tools
- Report bugs
- Submit pull requests
- Improve documentation

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

Keep project structure clean and maintain consistency with existing project architecture.

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

---

## Goal

Build 100 small tools in 100 days and turn them into a useful ecosystem.

---

## Progress

- Live: **38 tools** (listed on the homepage)
- Upcoming: **1 tool** (listed on the homepage)

Visit the homepage to browse Live tools and try them in your browser.

## FAQ

Added searchable FAQ section with collapsible questions and tool request functionality.

## Suggestions

Suggestions submitted from the home page are sent to the Google Sheets-backed intake workflow. For live deployment, configure the spreadsheet credentials in Vercel environment variables and redeploy.

---

## Philosophy

> "Boring problems. Simple tools."

---

## Author

Ayush Sharma