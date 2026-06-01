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
- Featured tools to try right now.

Featured tools

- BMI Calculator — `/bmi-calculator` — Calculate BMI score, category, healthy weight range, and ideal range difference instantly.
- Text to Morse Code — `/text-to-morse-code` — Convert text into Morse code and Morse code back into text, with optional local Morse audio playback.
- YouTube Title Generator — `/youtube-title-generator` — Generate clickable title ideas from a topic.
- Birthday Countdown — `/birthday-countdown` — Track time remaining until your next birthday.
- Age Difference Calculator — `/age-difference-calculator` — Compare two birth dates and calculate the exact age gap.
- Discount Calculator — `/discount-calculator` — Instantly calculate discounts, savings, taxes, and final payable amounts.

Upcoming tools

- Terms & Conditions Simplifier — `/terms-conditions-simplifier` — Simplify legal text into plain language with a summary, obligations, risks, permissions, and reading time.
- Water Intake Calculator — `/water-intake-calculator` — Estimate recommended daily water intake from age, weight, gender, activity, and climate.
- Percentage Calculator — `/percentage-calculator` — Solve common percentage calculations with formulas and breakdowns.
- SIP Calculator — `/sip-calculator` — Estimate future SIP returns with monthly compounding and growth chart.

## Age Difference Calculator

Compare two birth dates and instantly calculate exact age differences with useful statistics and insights.

Features:
- Exact age difference
- Total days/weeks/months

## Water Intake Calculator (Upcoming)

Estimate a recommended daily water target based on age, weight, gender, activity level, and climate, fully in the browser.

Features:
- Age, weight, gender, activity level, and climate inputs
- Recommended daily water intake in liters
- Daily water intake in glasses
- Hourly hydration target for steady pacing
- Water progress visualization with daily target cards
- Hydration tips, activity adjustment, and weather adjustment insights
- Copy results, download report, and reset actions
- 100% client-side processing

## Terms & Conditions Simplifier

Paste terms, privacy policies, agreements, or other legal text and get a plain-language breakdown entirely in the browser.

Features:
- Large legal text input area
- Short summary and important points
- User obligations and potential risks
- Key permissions and estimated reading time
- Copy results and download report
- Clear all and responsive empty/loading/error states

## Text to Morse Code

Convert plain text into Morse code and decode Morse code back into text instantly, fully in the browser.

Features:
- Dual mode conversion: Text to Morse and Morse to Text
- Real-time converted output
- Output character count and word count
- Copy result, download TXT, and clear actions
- Local Morse audio playback with sound on/off toggle
- Mobile-responsive interface

Live tools (42)

1. Text Formatter — `/text-formatter`
2. Text to Morse Code — `/text-to-morse-code` — Convert text into Morse code and decode Morse code back into text, with optional local Morse audio playback.
3. JSON Formatter — `/json-formatter`
4. Word Counter — `/word-counter`
5. Password Generator — `/password-generator`
6. Age Calculator — `/age-calculator`
7. BMI Calculator — `/bmi-calculator` — Calculate BMI score, category, healthy weight range, and ideal range difference instantly.
8. Birthday Countdown — `/birthday-countdown` — Track time remaining until your next birthday.
9. Age Difference Calculator — `/age-difference-calculator` — Compare two birth dates and calculate the exact age gap.
10. QR Generator — `/qr-generator`
11. Unit Converter — `/unit-converter`
12. File Name Sanitizer — `/file-name-sanitizer`
13. Image Compressor / Resizer — `/image-compressor`
14. Resume Bullet Rewriter — `/resume-bullet-rewriter`
15. Time Zone Converter — `/time-zone-converter`
16. To-Do List — `/to-do-list`
17. GST Calculator — `/gst-calculator`
18. Truth Or Dare Play — `/truth-or-dare-play`
19. Pomodoro Timer — `/pomodoro-timer`
20. Roast My To-Do List — `/roast-my-todo-list`
21. Markdown Previewer — `/markdown-previewer`
22. Video Transcriber — `/video-transcriber`
23. YouTube Title Generator — `/youtube-title-generator`
24. Base Converter — `/base-converter`
25. Aspect Ratio Calculator — `/aspect-ratio-calculator`
26. Distance Between Cities — `/distance-between-cities`
27. Currency Converter — `/currency-converter`
28. LinkedIn Post Formatter — `/linkedin-post-formatter`
29. What Happened Today In History — `/what-happened-today`
30. Math Formula Calculator — `/math-formula-calculator`
31. Science Formulas Calculator — `/science-formulas-calculator`
32. QuickLearn — `/concept-explorer` — Type any topic and understand it in under a minute with simple explanations, key concepts, real-world examples, and guided learning paths.
33. Can I Trust This Website? — `/can-i-trust-this-website` (Day 28)
34. Social Account Analyzer — `/social-account-analyzer` (Day 29)
35. Attendance Calculator — `/attendance-calculator` (Day 30) — Stress-free semester planning. Know exactly how many classes you can skip and still maintain your attendance percentage.
36. YouTube Downloader — `/youtube-downloader` (Day 31) — Download videos, captions, and thumbnails from YouTube. Recommended for local use (see [Setup Guide](/SETUP_GUIDE.md)).
37. DOC to PDF Converter — `/doc-to-pdf-converter` (Day 32) — Upload DOC or DOCX files and convert them into a downloadable PDF.
38. Video to Audio Converter — `/video-to-audio-converter` (Day 33) — Upload a video and extract audio in MP3, M4A, WAV, or FLAC format.
39. Image to PDF Converter — `/image-to-pdf-converter` (Day 34) — Upload one or more images and convert them into a downloadable PDF.
40. PDF Intelligence Tool — `/pdf-intelligence-tool` (Day 35) — Analyze PDFs instantly and extract meaningful information such as summaries, key points, important dates, contacts, links, and document statistics.
41. Document Data Extractor — `/document-data-extractor` (Day 36) — Upload documents or images and automatically extract structured information including contacts, dates, financial details, links, keywords, and raw text.
42. Discount Calculator — `/discount-calculator` — Instantly calculate discounts, savings, taxes, and final payable amounts.

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
- The homepage lists Live tools only; the live registry drives featured cards, tool listings, and navigation.

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

- Live: **42 tools** (listed on the homepage)
- Upcoming: **4 tools** (listed on the homepage)

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