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

Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and click any tool from the homepage.

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

---

## Goal

Build 100 small tools in 100 days and turn them into a useful ecosystem.

---

## Progress

- Day 1 ✅ Text Formatter
- Day 2 ✅ JSON Formatter
- Day 3 ✅ Word Counter
- Day 4 ✅ Password Generator
- Day 5 ✅ Age Calculator
- Day 6 ✅ Unit Converter
- Day 7 ✅ QR Generator
- Day 8 ✅ File Name Sanitizer
- Day 9 ✅ Pomodoro Timer
- Day 10 ✅ Image Compressor / Resizer
- Day 11 ✅ Resume Bullet Rewriter
- Day 12 ✅ GST Calculator
- Day 13 ✅ To-Do List

- Day 14 ✅ Time Zone Converter
- Day 15 ✅ Truth or Dare Play
- Day 16 ✅ Roast My To-Do List
- Day 17 ✅ Markdown Previewer

### Live + Upcoming Releases

- Day 18 ✅ Video Transcriber
- Day 19 ✅ Base Converter
- Day 20 ✅ Aspect Ratio Calculator
- Day 21 ✅ Distance Between Cities
- Day 22 ✅ Currency Converter
- Day 23 ✅ YouTube Title Generator
- Day 24 ✅ LinkedIn Post Formatter

> Upcoming tools are in progress and will be released one-by-one. Unreleased tools are not linked from the GitHub home page.

## Suggestions

Suggestions submitted from the home page are sent to the Google Sheets-backed intake workflow. For live deployment, configure the spreadsheet credentials in Vercel environment variables and redeploy.

---

## Philosophy

> "Boring problems. Simple tools."

---

## Author

Ayush Sharma