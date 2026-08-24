# 🚀 BoringTools

> **100 Days. 101 Tools. 0% Bullshit.**  
> The internet's most comprehensive collection of privacy-first, browser-based micro-utilities. No signups. No tracking. No excuses.

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Tools](https://img.shields.io/badge/Tools-101-orange?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🎯 Live Demo

**🌐 Try Now:** [boringtoolsai.com](https://www.boringtoolsai.com/)

<video width="100%" controls>
  <source src="public/readme-video.mp4" type="video/mp4">
</video>

---

## 📊 Quick Stats

| Metric | Count |
|--------|-------|
| **Total Tools** | 101 |
| **Days to Build** | 100 |
| **Total Commits** | 295+ |
| **Bundle Size** | <150KB (initial) |
| **Server Calls** | 0 (100% client-side) |
| **Privacy Score** | 100% |

---

## 💡 Why BoringTools?

Most online tools are bloated with ads, trackers, and login walls. **BoringTools** flips that model:

### 🔒 Privacy First
Every calculation, conversion, and AI operation happens **100% in your browser** using WebAssembly (WASM), Web Workers, and modern browser APIs. Your data **never leaves your device**.

###  Instant Access
No authentication. No paywalls. No "Sign up with Google" popups. Just open the URL and get shit done.

### 🎨 Unified Design System
Built with **Next.js 14 App Router** + **Tailwind CSS**, ensuring lightning-fast load times, responsive layouts, and keyboard accessibility across all 101 tools.

### 🧠 Smart Tools
From AI-powered playlist analyzers to client-side background removers using ONNX Runtime — these aren't just calculators, they're **engineering experiments**.

---

## 🏗️ Architecture & Technical Deep Dive

*For the engineers who want to know how the magic happens:*

### 1️⃣ **Client-Side DOC to PDF Conversion (LibreOffice WASM)**
**Challenge:** Converting documents without a backend server.  
**Solution:** Integrated LibreOffice WASM (~250MB) with scoped COOP/COEP headers in `next.config.ts` to enable `SharedArrayBuffer` for the WASM worker without breaking other tools.  
**Result:** Full document conversion in-browser with zero server dependency.

### 2️ **Browser-Based AI (ONNX Runtime Web)**
**Challenge:** Running ML models without API costs or privacy leaks.  
**Solution:** Deployed lightweight ONNX models using Web Workers for non-blocking UI. Background removal, text extraction, and image processing run entirely client-side.  
**Result:** Zero API calls, infinite scalability, 100% privacy.

### 3️⃣ **Performance at Scale (101 Tools, 1 Codebase)**
**Challenge:** Managing 101 distinct tools without bloating the bundle.  
**Solution:** 
- **Dynamic Imports** (`next/dynamic`) for route-based code splitting
- **Lazy Loading** for heavy components
- **Tree Shaking** to eliminate dead code
- **Shared Component Library** for UI consistency  
**Result:** Initial JS bundle <150KB despite 101 tools.

### 4️⃣ **Client-Side Encryption (Web Crypto API)**
**Challenge:** Secure storage without backend databases.  
**Solution:** AES-GCM encryption via Web Crypto API for the Digital Time Capsule tool. Keys derived from user passwords using PBKDF2. Data stored in IndexedDB.  
**Result:** Military-grade encryption with zero server infrastructure.

### 5️⃣ **Real-Time Canvas Manipulation**
**Challenge:** High-performance image processing in the browser.  
**Solution:** HTML5 Canvas API with pixel-level manipulation for ASCII art generator, GIF maker, and image shaders. Used `ImageData` and typed arrays for O(n) performance.  
**Result:** Smooth 60fps image processing even on mid-range devices.

---

## 🛠️ Tech Stack

```typescript
// Frontend Framework
Next.js 14 (App Router) + React 18 + TypeScript

// Styling & Animation
Tailwind CSS + Framer Motion

// AI / ML
WebLLM + ONNX Runtime Web + Groq API (selective fallbacks)

// Browser APIs
Web Workers | Web Crypto API | IndexedDB | Canvas API | 
Web Audio API | File System Access API | MediaRecorder API

// Build & Deploy
Vercel (Edge Network) + GitHub Actions (CI/CD)

// Testing & Quality
ESLint + Prettier + TypeScript Strict Mode
```

---

##  Featured Tools (Technical Highlights)

| Tool | Tech Stack | What Makes It Special |
|------|-----------|----------------------|
| **🎵 Playlist IQ** | Next.js + Groq API + YouTube Data API | Parses playlist metadata, calculates watch time across 5 playback speeds, generates AI-powered learning roadmaps with concept extraction |
| **🔒 Digital Time Capsule** | Web Crypto API + IndexedDB | End-to-end encrypted storage with AES-GCM, offline calendar alerts, Google Sheets sync |
| **🖼️ ASCII Terminal Art** | Canvas API + Pixel Shaders | Real-time image-to-text conversion with custom shaders (brightness, edge detection, gamma) + multi-format export (.txt, .svg, .png) |
| **📄 DOC to PDF** | LibreOffice WASM + COOP/COEP Headers | Full document conversion in-browser with scoped security headers for SharedArrayBuffer |
| **🎬 Background Remover** | ONNX Runtime Web + Web Workers | Client-side AI model for instant background removal with custom backdrop options |
| **🎮 Reaction Time Tester** | Web Audio API + Canvas | 5 game modes with anti-cheat, PNG export, synthesized audio feedback, local storage tracking |

---

##  Complete Tools Directory

<details>
<summary><b>📝 Text & Document Tools (1-40)</b></summary>

1. **Text Formatter** — `/text-formatter`
2. **Text to Morse Code** — `/text-to-morse-code`
3. **JSON Formatter** — `/json-formatter`
4. **Word Counter** — `/word-counter`
5. **Password Generator** — `/password-generator`
6. **Can I Trust This Website?** — `/can-i-trust-this-website`
7. **News Accuracy Checker** — `/news-accuracy-checker`
8. **Link Intelligence** — `/link-intelligence`
20. **QR Generator** — `/qr-generator`
22. **File Name Sanitizer** — `/file-name-sanitizer`
26. **PDF Intelligence Tool** — `/pdf-intelligence-tool`
27. **Terms & Conditions Simplifier** — `/terms-conditions-simplifier`
28. **Document Data Extractor** — `/document-data-extractor`
29. **Resume Bullet Rewriter** — `/resume-bullet-rewriter`
30. **Resignation Letter Generator** — `/resignation-letter-generator`
38. **Markdown Previewer** — `/markdown-previewer`
39. **Video Transcriber** — `/video-transcriber`
41. **LinkedIn Post Formatter** — `/linkedin-post-formatter`

</details>

<details>
<summary><b>🧮 Calculators & Converters (9-34)</b></summary>

9. **Age Calculator** — `/age-calculator`
10. **BMI Calculator** — `/bmi-calculator`
11. **Water Intake Calculator** — `/water-intake-calculator`
14. **Freelancer Pricing Calculator** — `/freelancer-pricing-calculator`
15. **Discount Calculator** — `/discount-calculator`
17. **Time Cost Calculator** — `/time-cost-calculator`
18. **SIP Calculator** — `/sip-calculator`
19. **EMI Calculator** — `/emi-calculator`
21. **Unit Converter** — `/unit-converter`
25. **DOC to PDF Converter** — `/doc-to-pdf-converter`
31. **Time Zone Converter** — `/time-zone-converter`
32. **Days Between Dates** — `/days-between-dates`
34. **GST Calculator** — `/gst-calculator`
43. **Math Formula Calculator** — `/math-formula-calculator`
44. **Science Formulas Calculator** — `/science-formulas-calculator`
46. **Base Converter** — `/base-converter`
47. **Aspect Ratio Calculator** — `/aspect-ratio-calculator`
49. **Currency Converter** — `/currency-converter`
50. **Percentage Calculator** — `/percentage-calculator`

</details>

<details>
<summary><b>🎨 Creative & Media Tools (95-101)</b></summary>

95. **Browser-Based Background Remover** — `/background-remover`
96. **Audio Waveform Trimmer** — `/audio-waveform-trimmer`
97. **Image to ASCII Art** — `/image-to-ascii`
98. **Text to Handwriting** — `/text-to-handwriting`
99. **GIF Maker from Images** — `/gif-maker`
100. **Geography Quiz & Map Explorer** — `/geography-quiz`
101. **Digital Time Capsule** — `/digital-time-capsule`

</details>

<details>
<summary><b>🚀 AI-Powered Tools (55, 84-93)</b></summary>

55. **Playlist IQ** — `/youtube-playlist-analyzer`
84. **Placement Readiness Score** — `/placement-readiness-score`
85. **Study Material Finder** — `/study-material-finder`
87. **Cinematic AI Prompt Architect** — `/cinematic-ai-prompt-architect`
88. **Fake Data Generator** — `/fake-data-generator`
89. **Movie & Series Recommendation** — `/movie-series-recommendation`
90. **Cash Runway Calculator** — `/cash-runway-calculator`
91. **AI Agent Visualizer** — `/ai-agent-visualizer`
92. **Logo Meaning Explorer** — `/logo-meaning-explorer`
93. **Startup Name Analyzer** — `/startup-name-analyzer`

</details>

<details>
<summary><b> Space & History Tools (74-83)</b></summary>

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
<summary><b>📋 Productivity & Life Tools (12-73)</b></summary>

12. **Birthday Countdown** — `/birthday-countdown`
13. **Age Difference Calculator** — `/age-difference-calculator`
16. **Purchase Intelligence** — `/purchase-intelligence`
23. **Image Compressor** — `/image-compressor`
24. **Image to PDF Converter** — `/image-to-pdf-converter`
33. **To-Do List** — `/to-do-list`
35. **Truth or Dare Play** — `/truth-or-dare-play`
36. **Pomodoro Timer** — `/pomodoro-timer`
37. **Roast My To-Do List** — `/roast-my-todo-list`
40. **YouTube Title Generator** — `/youtube-title-generator`
42. **What Happened Today In History** — `/what-happened-today`
45. **QuickLearn** — `/concept-explorer`
48. **Distance Between Cities** — `/distance-between-cities`
51. **Social Account Analyzer** — `/social-account-analyzer`
52. **Attendance Calculator** — `/attendance-calculator`
53. **CGPA Target Planner** — `/cgpa-target-planner`
54. **YouTube Downloader** — `/youtube-downloader`
56. **Video to Audio Converter** — `/video-to-audio-converter`
57. **Typing Speed Tester** — `/typing-speed-tester`
58. **Calorie Calculator** — `/calorie-calculator`
59. **Hook Generator** — `/hook-generator`
60. **Sleep Cycle Calculator** — `/sleep-cycle-calculator`
61. **Color Palette Generator** — `/color-palette-generator`
62. **Invoice Generator** — `/invoice-generator`
63. **Should I Reply?** — `/should-i-reply`
64. **Subscription Tracker** — `/subscription-tracker`
65. **Personal Admin Dashboard** — `/personal-admin-dashboard`
66. **Email Decoder** — `/email-decoder`
67. **Learning OS** — `/learning-os`
68. **Leverage Finder** — `/leverage-finder`
69. **Clipboard History Manager** — `/clipboard-history-manager`
70. **Digital Declutter Assistant** — `/digital-declutter-assistant`
71. **Second Mind** — `/second-mind`
72. **Fear Decomposer** — `/fear-decomposer`
73. **Perspective Switcher** — `/perspective-switcher`

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

##  Project Milestones

- ✅ **Day 1:** First tool deployed
- ✅ **Day 30:** 30 tools milestone
- ✅ **Day 60:** 60 tools + AI integration
- ✅ **Day 100:** **101 tools shipped** 
- ✅ **295+ Commits:** Continuous improvement
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
| **Tools per KB** | 0.67 tools/KB |

---

## 🤝 Contributing

BoringTools is **open-source** and community-driven:

### Ways to Contribute:
- 🐛 **Report Bugs:** [Open an issue](https://github.com/ius-sharma/boring-tools/issues)
-  **Suggest Tools:** Use the suggestion form on the homepage
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
[![Instagram](https://img.shields.io/badge/Instagram-ius.ayush-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/ius.ayush)
[![YouTube](https://img.shields.io/badge/YouTube-@ocnayush-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com/@ocnayush)

---

<p align="center">
  <strong>Build → Fail → Learn → Improve → Repeat.</strong><br>
  <em>Thanks for stopping by. (BTW, Cristiano is the GOAT 🐐)</em>
</p>
