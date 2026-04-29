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

Features:
- Convert text to UPPERCASE
- Convert text to lowercase
- Capitalize each word
- Clean extra spaces
- Copy formatted output

Route:
- `/text-formatter`

### Day 2: JSON Formatter

Fast JSON validation and formatting utility.

Features:
- Pretty print JSON
- Minify JSON
- Detect invalid JSON
- Copy formatted output

Route:
- `/json-formatter`

### Day 3: Word Counter

Instant writing stats for input text.

Features:
- Word count
- Character count
- Characters without spaces
- Sentence count

Route:
- `/word-counter`

### Day 4: Password Generator

Generate secure passwords with custom options.

Features:
- Adjustable password length
- Uppercase letters
- Lowercase letters
- Numbers
- Symbols
- Copy generated password

Route:
- `/password-generator`

### Day 5: Age Calculator

Calculate exact age from date of birth.

Features:
- Exact age in years, months, and days
- Simple date picker input
- Input validation for empty and future dates

Route:
- `/age-calculator`

### Day 6: Unit Converter

Convert common units instantly with a cleaner UI.

Features:
- Convert Length, Weight, and Temperature
- Swap input/output units quickly
- Precision control for output value
- One-click copy for converted result
- Improved responsive layout and themed custom dropdowns

Route:
- `/unit-converter`

### Day 7: QR Generator

Generate downloadable QR codes instantly from text or links.

Features:
- Generate QR code from plain text or URL
- Input validation with user-friendly error handling
- Instant preview of generated QR code
- One-click PNG download
- Clean responsive UI matching project theme

Route:
- `/qr-generator`

### Day 8: File Name Sanitizer

Sanitize and standardize file names for safer sharing and storage.

Features:
- Clean unsafe characters from file names
- Support kebab-case, snake_case, and readable naming styles
- Preserve file extensions safely
- Handle reserved Windows file names automatically
- Batch preview and one-click copy for sanitized output

Route:
- `/file-name-sanitizer`

### Day 9: Pomodoro Timer

Boost productivity with time-based work and break cycles.

Features:
- 25-minute focused work sessions
- 5-minute break periods
- Start, Pause, and Reset controls
- Automatic session cycling
- Browser notifications when focus or break sessions finish
- Session counter to track productivity

Route:
- `/pomodoro-timer`

### Day 10: Image Compressor / Resizer

Compress and resize images with a clean, browser-based workflow.

Features:
- Drop or browse image uploads
- Resize by max width and height
- Adjust output quality
- Export in JPEG, WebP, or PNG formats
- See file size savings after processing

Route:
- `/image-compressor`

---

## UI/UX Updates

- Unified card-based UI across all tools
- Theme switcher (Light/Dark) with saved preference
- Persistent top controls for quick navigation
- Home button on tool pages for one-click return
- Responsive layout for desktop, tablet, and mobile
- Enhanced home discovery: fast search, quick filters, and custom category dropdown
- Suggestion intake panel now captures ideas and syncs them to Google Sheets

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

### Upcoming Releases

- Day 10 ⏳ Resume Bullet Rewriter — Coming Soon
- Day 11 ⏳ Resume Bullet Rewriter — Coming Soon
- Day 12 ⏳ Roast My To-Do List — Coming Soon
- Day 13 ⏳ Markdown Previewer — Coming Soon

> Coming soon: these tools are in progress and will be released one-by-one. Unreleased tools are not linked from the GitHub home page.

## Suggestions

Suggestions submitted from the home page are sent to the Google Sheets-backed intake workflow. For live deployment, configure the spreadsheet credentials in Vercel environment variables and redeploy.

---

## Philosophy

> "Boring problems. Simple tools."

---

## Author

Ayush Sharma