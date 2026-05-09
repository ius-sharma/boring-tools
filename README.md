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

Enhancements (UI & Background):
- Sound notifications (optional beep) on session transitions
- Visual progress ring and pulsing countdown for imminent transitions
- Customizable timers and presets (Standard, Long, Short) with settings modal
- Daily statistics (focus sessions, break sessions, total focus minutes) saved to localStorage
- Keyboard shortcuts: Space (Start/Pause), R (Reset), Esc (Close settings)
- Automatic long break after every 4 focus sessions
- Background Service Worker handles timer when tab is inactive so system notifications still fire

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

### Day 11: Resume Bullet Rewriter

Turn rough notes into polished, resume-ready bullets with AI-assisted rewriting.

Features:
- Rewrite messy notes into cleaner resume bullets
- Choose tone presets like Impact-focused, ATS-friendly, Leadership, and Technical
- Select how many bullets to generate
- Copy the rewritten bullets in one click
- Clean responsive layout with side-by-side input and output panels

Route:
- `/resume-bullet-rewriter`

### Day 12: GST Calculator

Calculate GST-inclusive and GST-exclusive totals in seconds.

Features:
- Handle before-GST and including-GST calculations
- Use common GST presets or a custom rate
- Show base amount, GST amount, and total amount clearly
- Keep the UI clean and finance-friendly

Route:
- `/gst-calculator`

### Day 13: To-Do List

Simple, lightweight to-do list manager to track tasks and priorities.

Features:
- Add, edit, and delete tasks
- Mark tasks complete/incomplete
- Simple localStorage persistence
- Filter by all/active/completed
- Clean responsive UI matching project theme

Route:
- `/to-do-list`

### Day 14: Time Zone Converter

Convert meeting times across time zones quickly and accurately.

Features:
- Convert between time zones using common cities and IANA zone names
- Quick presets for UTC, local, and major time zones
- Copy and share converted time with one click
- Clean responsive UI with optional 12/24-hour toggle

Route:
- `/time-zone-converter`

### Day 15: Truth or Dare Play

Playful party game to play with friends and break the ice.

Features:
- Switch between truth, dare, and random modes
- Play new rounds instantly with fresh prompts
- Keep a short history of recent rounds
- Stay inside the same minimal black-and-white layout
- Simple responsive UI matching project theme

Route:
- `/truth-or-dare-play`

### Day 16: Roast My To-Do List

Playful roast with practical next steps for your tasks.

Features:
- Input your to-do list and get a humorous roast
- Receive practical suggestions to tackle each task
- Fun + productivity blend for motivation
- Copy roasted output for sharing
- Clean responsive UI matching project theme

Route:
- `/roast-my-todo-list`

### Day 17: Markdown Previewer

Write markdown and preview instantly with live rendering.

Features:
- Real-time markdown to HTML preview
- Split-pane layout (editor + preview)
- Support for headers, lists, links, code blocks, and more
- Dark/light theme toggle
- Copy rendered HTML output
- Clean responsive UI matching project theme

Route:
- `/markdown-previewer`

### Day 18: Video Transcriber

Transcribe video audio to text quickly and accurately.

Features:
- Upload or provide video URL
- Automatic speech-to-text transcription
- Downloadable transcript and simple timestamping
- Copy transcript to clipboard

Route:
- `/video-transcriber`

### Day 19: Base Converter

Convert between Binary, Decimal, Octal, and Hex instantly.

Features:
- Convert values across bases (2, 8, 10, 16)
- Copy results and example conversions
- Clean responsive UI matching project theme

Route:
- `/base-converter`

### Day 20: Aspect Ratio Calculator

Resize images while preserving aspect ratio with ease.

Features:
- Calculate target dimensions based on original aspect ratio
- Common aspect ratio presets (16:9, 4:3, 1:1)
- Custom width and height inputs
- Real-time preview and copy results
- Clean responsive UI matching project theme

Route:
- `/aspect-ratio-calculator`

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
- Day 21 ⏳ Distance Between Cities — Coming Soon
- Day 22 ⏳ Currency Converter — Coming Soon

> Upcoming tools are in progress and will be released one-by-one. Unreleased tools are not linked from the GitHub home page.

## Suggestions

Suggestions submitted from the home page are sent to the Google Sheets-backed intake workflow. For live deployment, configure the spreadsheet credentials in Vercel environment variables and redeploy.

---

## Philosophy

> "Boring problems. Simple tools."

---

## Author

Ayush Sharma