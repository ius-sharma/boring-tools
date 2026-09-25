<p align="center">
  <a href="https://www.boringtoolsai.com/">
    <img src="public/banner.png" alt="BoringTools Banner" width="100%" />
  </a>
</p>

# 🚀 BoringTools

> **Micro-tools for everyday tasks.**  
> A comprehensive collection of fast, browser-first utilities with zero forced signups, zero tracking, and no clutter.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20SSR-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Tools](https://img.shields.io/badge/Tools-104-orange?style=for-the-badge)](https://www.boringtoolsai.com/)
[![Commits](https://img.shields.io/badge/Commits-350+-blueviolet?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🎯 Live Demo

**🌐 Try Now:** [boringtoolsai.com](https://www.boringtoolsai.com/)

[![BoringTools Demo](https://img.youtube.com/vi/xoq-7yGdHl4/0.jpg)](https://youtu.be/xoq-7yGdHl4)

---

## 📊 Quick Stats

| Metric | Details |
|--------|---------|
| **Total Tools** | 104 |
| **Days to Build** | 100+ |
| **Total Commits** | 350+ |
| **Bundle Size** | <150KB (initial) |
| **Architecture** | Browser-First (WASM/Client) + Stateless Cloud AI |
| **Tracking Policy** | 0 Trackers · No forced signups |

---

## 💡 Why BoringTools?

Most online tools are bloated with ads, trackers, and login walls. **BoringTools** flips that model:

### 🔒 Privacy First
Most calculators, converters, and media utilities run **entirely in your browser** using WebAssembly (WASM), Web Workers, and modern browser APIs where your data never leaves your device. For utilities that require external cloud models or web scraping, requests are processed statelessly with zero data retention or tracking.

### ⚡ Instant Access
No authentication required for utilities. No paywalls. No "Sign up with Google" popups. Just open the URL and get shit done.

### 🎨 Unified Design System
Built with **Next.js 16 App Router** + **Tailwind CSS v4**, ensuring lightning-fast load times, responsive layouts, and keyboard accessibility across all 104 tools.

### 🧠 Smart Tools
From AI-powered playlist analyzers to client-side background removers using ONNX Runtime and FFmpeg WASM audio-video extractors — these aren't just calculators, they're **engineering experiments**.

---

## 🏗️ Architecture & Technical Deep Dive

*For the engineers who want to know how the magic happens:*

### 1️⃣ **Client-Side DOC to PDF Conversion (LibreOffice WASM)**
**Challenge:** Converting documents without a backend server.  
**Solution:** Integrated LibreOffice WASM (~250MB) with scoped COOP/COEP headers in `next.config.ts` to enable `SharedArrayBuffer` for the WASM worker without breaking other tools.  
**Result:** Full document conversion in-browser with zero server dependency.

### 2️⃣ **Browser-Based AI (ONNX Runtime Web & Background Removal)**
**Challenge:** Running ML models without API costs or privacy leaks.  
**Solution:** Deployed lightweight ONNX models and `@imgly/background-removal` using Web Workers for non-blocking UI. Background removal, text extraction, and image processing run entirely client-side.  
**Result:** Zero API calls, infinite scalability, 100% privacy.

### 3️⃣ **Performance at Scale (104 Tools, 1 Codebase)**
**Challenge:** Managing 104 distinct tools without bloating the bundle.  
**Solution:** 
- **Dynamic Imports** (`next/dynamic`) for route-based code splitting
- **Lazy Loading** for heavy components
- **Tree Shaking** to eliminate dead code
- **Shared Component Library** for UI consistency  
**Result:** Initial JS bundle <150KB despite 104 tools.

### 4️⃣ **Client-Side Encryption (Web Crypto API)**
**Challenge:** Secure storage without backend databases.  
**Solution:** AES-GCM encryption via Web Crypto API for the Digital Time Capsule tool. Keys derived from user passwords using PBKDF2. Data stored in IndexedDB.  
**Result:** Military-grade encryption with zero server infrastructure.

### 5️⃣ **Real-Time Canvas Manipulation & Font Synthesis**
**Challenge:** High-performance image processing and handwriting generation in the browser.  
**Solution:** HTML5 Canvas API with pixel-level manipulation for ASCII art generator, GIF maker, and 24 offline handwriting `.woff2` font engines. Used `ImageData` and typed arrays for O(n) performance.  
**Result:** Smooth 60fps image and text processing even on mid-range devices.

### 6️⃣ **Client-Side Media Trimming & Conversion (FFmpeg WASM)**
**Challenge:** Converting video to audio and trimming media without sending user files to a cloud server.  
**Solution:** Embedded `@ffmpeg/ffmpeg` multi-threaded WebAssembly engine with direct memory buffer streaming.  
**Result:** Instant MP3/WAV/FLAC extraction and waveform slicing directly in your browser.

---

## 🛠️ Tech Stack

```typescript
// Frontend Framework
Next.js 16 (App Router) + React 19 + TypeScript 5

// Styling & Animation
Tailwind CSS v4 + Framer Motion

// AI / ML & Media Processing
ONNX Runtime Web + WebLLM + @imgly/background-removal + FFmpeg WASM + Tesseract.js + Groq API

// Backend, Auth & Caching
Supabase (SSR & Auth) + Upstash Redis (Rate Limiting)

// Browser APIs & WASM
LibreOffice WASM | Web Workers | Web Crypto API | IndexedDB | Canvas API | 
Web Audio API | File System Access API | MediaRecorder API

// Build & Deploy
Vercel (Edge Network) + GitHub Actions (CI/CD) + Vercel Analytics

// Testing & Quality
ESLint 9 + TypeScript Strict Mode
```

---

## 🌟 Featured Tools (Technical Highlights)

| Tool | Tech Stack | What Makes It Special |
|------|-----------|----------------------|
| **🎵 Playlist IQ** | Next.js + Groq API + YouTube Data API | Parses playlist metadata, calculates watch time across 5 playback speeds, generates AI-powered learning roadmaps with concept extraction |
| **🔒 Digital Time Capsule** | Web Crypto API + IndexedDB | End-to-end encrypted storage with AES-GCM, offline calendar alerts, Google Sheets sync |
| **🖼️ ASCII Terminal Art** | Canvas API + Pixel Shaders | Real-time image-to-text conversion with custom shaders (brightness, edge detection, gamma) + multi-format export (.txt, .svg, .png) |
| **📄 DOC to PDF** | LibreOffice WASM + COOP/COEP Headers | Full document conversion in-browser with scoped security headers for SharedArrayBuffer |
| **🎬 Background Remover** | ONNX Runtime Web + Web Workers | Client-side AI model for instant background removal with custom backdrop options |
| **✍️ Text to Handwriting** | Canvas API + 24 Local Fonts + PDFKit | Turns typed notes into realistic handwritten notebook pages with ruled lines, ink colors, and PDF/PNG export |
| **🎧 Audio Waveform Trimmer** | FFmpeg WASM + Web Audio API | Live interactive visual waveform slicing and client-side conversion to MP3, WAV, or FLAC |
| **🎮 Reaction Time Tester** | Web Audio API + Canvas | 5 game modes with anti-cheat, PNG export, synthesized audio feedback, local storage tracking |

---

## 📚 Complete Tools Directory

<details>
<summary><b>📝 Text & Document Tools (1-14)</b></summary>

1. **Text Formatter** — `/text-formatter`
2. **Text to Morse Code** — `/text-to-morse-code`
3. **Word Counter** — `/word-counter`
4. **Text to Handwriting Image Converter** — `/text-to-handwriting`
5. **DOC to PDF Converter** — `/doc-to-pdf-converter`
6. **PDF Merger** — `/pdf-merger`
7. **PDF Intelligence Tool** — `/pdf-intelligence-tool`
8. **Terms & Conditions Simplifier** — `/terms-conditions-simplifier`
9. **Document Data Extractor** — `/document-data-extractor`
10. **Resume Bullet Rewriter** — `/resume-bullet-rewriter`
11. **Resignation Letter Generator** — `/resignation-letter-generator`
12. **Markdown Previewer** — `/markdown-previewer`
13. **LinkedIn Post Formatter** — `/linkedin-post-formatter`
14. **Lorem Ipsum Generator** — `/lorem-generator`

</details>

<details>
<summary><b>🧮 Calculators & Converters (15-39)</b></summary>

15. **Age Calculator** — `/age-calculator`
16. **BMI Calculator** — `/bmi-calculator`
17. **Water Intake Calculator** — `/water-intake-calculator`
18. **Calorie Calculator** — `/calorie-calculator`
19. **Sleep Cycle Calculator** — `/sleep-cycle-calculator`
20. **Freelancer Pricing Calculator** — `/freelancer-pricing-calculator`
21. **Discount Calculator** — `/discount-calculator`
22. **Time Cost Calculator** — `/time-cost-calculator`
23. **SIP Calculator** — `/sip-calculator`
24. **EMI Calculator** — `/emi-calculator`
25. **Unit Converter** — `/unit-converter`
26. **Time Zone Converter** — `/time-zone-converter`
27. **Days Between Dates** — `/days-between-dates`
28. **Birthday Countdown** — `/birthday-countdown`
29. **Age Difference Calculator** — `/age-difference-calculator`
30. **GST Calculator** — `/gst-calculator`
31. **Math Formula Calculator** — `/math-formula-calculator`
32. **Science Formulas Calculator** — `/science-formulas-calculator`
33. **Base Converter** — `/base-converter`
34. **Aspect Ratio Calculator** — `/aspect-ratio-calculator`
35. **Currency Converter** — `/currency-converter`
36. **Percentage Calculator** — `/percentage-calculator`
37. **Distance Between Cities** — `/distance-between-cities`
38. **Cash Runway Calculator** — `/cash-runway-calculator`
39. **Live Crypto Price Tracker** — `/crypto-profit-calculator`

</details>

<details>
<summary><b>🎨 Creative & Media Tools (40-52)</b></summary>

40. **Browser-Based Background Remover** — `/background-remover`
41. **Audio Waveform Trimmer & Converter** — `/audio-waveform-trimmer`
42. **Image to ASCII / Terminal Art Generator** — `/image-to-ascii`
43. **GIF Maker from Images** — `/gif-maker`
44. **Image Compressor / Resizer** — `/image-compressor`
45. **Image to PDF Converter** — `/image-to-pdf-converter`
46. **Video to Audio Converter** — `/video-to-audio-converter`
47. **Video Transcriber** — `/video-transcriber`
48. **YouTube Title Generator** — `/youtube-title-generator`
49. **YouTube Downloader** — `/youtube-downloader`
50. **Color Palette Generator** — `/color-palette-generator`
51. **Cinematic AI Prompt Architect** — `/cinematic-ai-prompt-architect`
52. **Logo Meaning Explorer** — `/logo-meaning-explorer`

</details>

<details>
<summary><b>💻 Developer & Security Tools (53-61)</b></summary>

53. **JSON Formatter** — `/json-formatter`
54. **QR Generator** — `/qr-generator`
55. **Fake Data Generator** — `/fake-data-generator`
56. **Password Generator** — `/password-generator`
57. **Can I Trust This Website?** — `/can-i-trust-this-website`
58. **News Accuracy Checker** — `/news-accuracy-checker`
59. **Link Intelligence** — `/link-intelligence`
60. **File Name Sanitizer** — `/file-name-sanitizer`
61. **AI Agent Visualizer** — `/ai-agent-visualizer`

</details>

<details>
<summary><b>🚀 AI-Powered & Career Tools (62-68)</b></summary>

62. **Playlist IQ** — `/youtube-playlist-analyzer`
63. **Placement Readiness Score** — `/placement-readiness-score`
64. **Study Material Finder** — `/study-material-finder`
65. **Startup Name Analyzer** — `/startup-name-analyzer`
66. **Social Account Analyzer** — `/social-account-analyzer`
67. **Hook Generator** — `/hook-generator`
68. **Invoice Generator** — `/invoice-generator`

</details>

<details>
<summary><b>🌌 Space, History & Education Tools (69-83)</b></summary>

69. **Geography Quiz & Map Explorer** — `/geography-quiz`
70. **QuickLearn** — `/concept-explorer`
71. **What Happened Today In History** — `/what-happened-today`
72. **Attendance Calculator** — `/attendance-calculator`
73. **CGPA Target Planner** — `/cgpa-target-planner`
74. **History Repeats** — `/history-repeats`
75. **Historical Perspective** — `/historical-perspective`
76. **Before & After** — `/before-after`
77. **Empire Simulator** — `/empire-simulator`
78. **Timeline Comparison** — `/timeline-comparison`
79. **If This Never Happened** — `/if-this-never-happened`
80. **Your Weight on Other Planets** — `/your-weight-on-other-planets`
81. **Cosmic Calendar** — `/cosmic-calendar`
82. **Cosmic Address** — `/cosmic-address`
83. **Time on Other Planets** — `/time-on-other-planets`

</details>

<details>
<summary><b>📋 Productivity, Mental Models & Fun (84-104)</b></summary>

84. **To-Do List** — `/to-do-list`
85. **Pomodoro Timer** — `/pomodoro-timer`
86. **Roast My To-Do List** — `/roast-my-todo-list`
87. **Typing Speed Tester** — `/typing-speed-tester`
88. **Reaction Time & Mouse Accuracy Tester** — `/reaction-time-tester`
89. **Digital Time Capsule – Future Self Message** — `/digital-time-capsule`
90. **Should I Reply?** — `/should-i-reply`
91. **Subscription Tracker** — `/subscription-tracker`
92. **Personal Admin Dashboard** — `/personal-admin-dashboard`
93. **Email Decoder** — `/email-decoder`
94. **Learning OS** — `/learning-os`
95. **Leverage Finder** — `/leverage-finder`
96. **Clipboard History Manager** — `/clipboard-history-manager`
97. **Digital Declutter Assistant** — `/digital-declutter-assistant`
98. **Second Mind** — `/second-mind`
99. **Fear Decomposer** — `/fear-decomposer`
100. **Perspective Switcher** — `/perspective-switcher`
101. **Purchase Intelligence** — `/purchase-intelligence`
102. **Movie & Series Recommendation** — `/movie-series-recommendation`
103. **Truth or Dare Play** — `/truth-or-dare-play`
104. **SUIII Counter** — `/suiii-counter`

</details>

> 💡 **Can't find what you need?** Suggest a new tool directly from the [homepage](https://www.boringtoolsai.com/) or [open an issue](https://github.com/ius-sharma/boring-tools/issues).

---

## 💻 Local Development

Get the entire ecosystem running locally in <60 seconds:

```bash
# 1. Clone the repo
git clone https://github.com/ius-sharma/boring-tools.git

# 2. Navigate to project
cd boring-tools

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev

# 5. Open browser
# Visit http://localhost:3000
```

### 🐳 Docker Support (Coming Soon)
```bash
docker build -t boring-tools .
docker run -p 3000:3000 boring-tools
```

---

## 🎯 Project Milestones

- ✅ **Day 1:** First tool deployed
- ✅ **Day 30:** 30 tools milestone
- ✅ **Day 60:** 60 tools + AI integration
- ✅ **Day 100:** **101 tools shipped**
- ✅ **Day 100+:** **104 tools shipped & Next.js 16 + React 19 upgrade**
- ✅ **350+ Commits:** Continuous engineering & refinement
- ✅ **Zero Critical CVEs:** Security audited via GitHub Actions
- ✅ **100% Client-Side:** Zero server dependencies for core features

---

## 📈 Performance Metrics

| Metric | Score |
|--------|-------|
| **Lighthouse Performance** | 95/100 |
| **First Contentful Paint** | <0.8s |
| **Time to Interactive** | <1.2s |
| **Total Bundle Size** | ~150KB (gzipped) |
| **Tools per KB** | 0.69 tools/KB |

---

## 🤝 Contributing

BoringTools is **open-source** and community-driven:

### Ways to Contribute:
- 🐛 **Report Bugs:** [Open an issue](https://github.com/ius-sharma/boring-tools/issues)
- 💡 **Suggest Tools:** Use the suggestion form on the homepage
- 🔧 **Fix Issues:** Pick a [good first issue](https://github.com/ius-sharma/boring-tools/contribute)
- 📚 **Improve Docs:** Update README, add examples, fix typos
- 🎨 **Design:** Improve UI/UX, add animations, refine design system

### Development Guidelines:
See [CONTRIBUTING.md](CONTRIBUTING.md) for architecture patterns, code style, and PR workflow.

---

## 📄 License

MIT License © 2026 [Ayush Sharma](https://github.com/ius-sharma)

Built with ❤️, ☕, and an unhealthy obsession with browser APIs.

---

## 👨‍💻 Connect with the Creator

[![GitHub](https://img.shields.io/badge/GitHub-ius--sharma-181717?style=for-the-badge&logo=github)](https://github.com/ius-sharma)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ayush%20Sharma-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/ayush-sharma-833163320)
[![Instagram](https://img.shields.io/badge/Instagram-ocn.ayush07-E4405F?style=for-the-badge&logo=instagram)](https://www.instagram.com/ocn.ayush07/)
[![YouTube](https://img.shields.io/badge/YouTube-@ocnayush-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com/@ocnayush)

---

<p align="center">
  <strong>Build → Fail → Learn → Improve → Repeat.</strong><br>
  <em>Thanks for stopping by. (BTW, Cristiano is the GOAT 🐐)</em>
</p>
