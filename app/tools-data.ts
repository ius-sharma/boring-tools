export interface Tool {
  id: string;
  name: string;
  href: string;
  category: string;
  description: string;
  status: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export const tools: Tool[] = [
  { id: "text-formatter", name: "Text Formatter", href: "/text-formatter", category: "Text", description: "Clean and transform text instantly.", status: "Live" },
  { id: "text-to-morse-code", name: "Text to Morse Code", href: "/text-to-morse-code", category: "Text", description: "Convert text to Morse Code and Morse back to text instantly.", status: "Live", isNew: true, isFeatured: true },
  { id: "json-formatter", name: "JSON Formatter", href: "/json-formatter", category: "Developer", description: "Format and validate JSON in one click.", status: "Live" },
  { id: "word-counter", name: "Word Counter", href: "/word-counter", category: "Text", description: "Count words and characters quickly.", status: "Live" },
  { id: "password-generator", name: "Password Generator", href: "/password-generator", category: "Security", description: "Generate secure passwords with options.", status: "Live" },
  { id: "can-i-trust-this-website", name: "Can I Trust This Website?", href: "/can-i-trust-this-website", category: "Security", description: "Check website trust signals before you share anything sensitive.", status: "Live", isNew: true },
  { id: "news-accuracy-checker", name: "News Accuracy Checker", href: "/news-accuracy-checker", category: "Security", description: "Analyze news articles for clickbait, emotional formatting, and source citations. Uses AI to audit claims and identify potential bias or misleading info.", status: "Live", isNew: true },
  { id: "link-intelligence", name: "Link Intelligence", href: "/link-intelligence", category: "Security", description: "Deconstruct URLs to analyze parameters, identify trackers, check safety indicators, and clean tracking tags.", status: "Live", isNew: true, isFeatured: true },
  { id: "age-calculator", name: "Age Calculator", href: "/age-calculator", category: "Utility", description: "Calculate age from date of birth.", status: "Live" },
  { id: "bmi-calculator", name: "BMI Calculator", href: "/bmi-calculator", category: "Health", description: "Calculate BMI score, category, healthy weight range, and ideal range difference instantly.", status: "Live", isNew: true, isFeatured: true },
  { id: "water-intake-calculator", name: "Water Intake Calculator", href: "/water-intake-calculator", category: "Health", description: "Estimate daily water intake from age, weight, activity, and climate.", status: "Live", isNew: true, isFeatured: true },
  { id: "birthday-countdown", name: "Birthday Countdown", href: "/birthday-countdown", category: "Time & Date", description: "Track time remaining until your next birthday.", status: "Live", isNew: true, isFeatured: true },
  { id: "age-difference-calculator", name: "Age Difference Calculator", href: "/age-difference-calculator", category: "Time & Date", description: "Compare two birth dates and calculate the exact age gap.", status: "Live", isNew: true, isFeatured: true },
  { id: "discount-calculator", name: "Discount Calculator", href: "/discount-calculator", category: "Finance", description: "Calculate discounts, savings, taxes, and final payable amounts.", status: "Live", isNew: true, isFeatured: true },
  { id: "purchase-intelligence", name: "Purchase Intelligence", href: "/purchase-intelligence", category: "Finance", description: "Evaluate purchases objectively to avoid buyer's remorse and make smarter spending decisions.", status: "Live", isNew: true, isFeatured: true },
  { id: "time-cost-calculator", name: "Time Cost Calculator", href: "/time-cost-calculator", category: "Finance", description: "Calculate the real cost of purchases in terms of work hours, working days, and savings required.", status: "Live", isNew: true, isFeatured: true },
  { id: "sip-calculator", name: "SIP Calculator", href: "/sip-calculator", category: "Finance", description: "Estimate future SIP returns with monthly compounding and growth charts.", status: "Live", isNew: true, isFeatured: true },
  { id: "emi-calculator", name: "EMI Calculator", href: "/emi-calculator", category: "Finance", description: "Calculate monthly loan EMIs, interest details, and view interactive repayment breakdowns.", status: "Live", isNew: true, isFeatured: true },
  { id: "qr-generator", name: "QR Generator", href: "/qr-generator", category: "Developer", description: "Generate downloadable QR from text.", status: "Live" },
  { id: "unit-converter", name: "Unit Converter", href: "/unit-converter", category: "Utility", description: "Convert length, weight, temperature.", status: "Live" },
  { id: "file-name-sanitizer", name: "File Name Sanitizer", href: "/file-name-sanitizer", category: "Utility", description: "Clean unsafe or messy filenames.", status: "Live" },
  { id: "image-compressor", name: "Image Compressor / Resizer", href: "/image-compressor", category: "Media", description: "Compress and resize images quickly.", status: "Live", isNew: true, isFeatured: true },
  { id: "image-to-pdf-converter", name: "Image to PDF Converter", href: "/image-to-pdf-converter", category: "Media", description: "Upload one or more images and convert them into a downloadable PDF.", status: "Live", isNew: true },
  { id: "doc-to-pdf-converter", name: "DOC to PDF Converter", href: "/doc-to-pdf-converter", category: "Documents", description: "Upload DOC or DOCX files and convert them into a downloadable PDF.", status: "Live", isNew: true },
  { id: "pdf-intelligence-tool", name: "PDF Intelligence Tool", href: "/pdf-intelligence-tool", category: "Documents", description: "Upload PDFs and extract summaries, key points, contacts, links, and document stats.", status: "Live", isNew: true },
  { id: "terms-conditions-simplifier", name: "Terms & Conditions Simplifier", href: "/terms-conditions-simplifier", category: "Documents", description: "Simplify legal text into plain language with a summary, obligations, risks, and permissions.", status: "Live", isNew: true },
  { id: "document-data-extractor", name: "Document Data Extractor", href: "/document-data-extractor", category: "Documents", description: "Upload documents or images and extract contacts, dates, financial data, links, keywords, and raw text.", status: "Live", isNew: true, isFeatured: true },
  { id: "resume-bullet-rewriter", name: "Resume Bullet Rewriter", href: "/resume-bullet-rewriter", category: "Career", description: "Turn rough notes into strong resume bullets.", status: "Live", isNew: true, isFeatured: true },
  { id: "resignation-letter-generator", name: "Resignation Letter Generator", href: "/resignation-letter-generator", category: "Career", description: "Generate professional resignation letters in seconds.", status: "Live", isNew: true },
  { id: "time-zone-converter", name: "Time Zone Converter", href: "/time-zone-converter", category: "Time & Date", description: "Convert meeting times across time zones.", status: "Live", isNew: true },
  { id: "days-between-dates", name: "Days Between Dates", href: "/days-between-dates", category: "Time & Date", description: "Calculate the number of days between two dates.", status: "Live", isNew: true },
  { id: "to-do-list", name: "To-Do List", href: "/to-do-list", category: "Productivity", description: "Track tasks locally with saved progress.", status: "Live", isNew: true },
  { id: "gst-calculator", name: "GST Calculator", href: "/gst-calculator", category: "Finance", description: "Calculate GST-inclusive and exclusive totals.", status: "Live", isNew: true },
  { id: "truth-or-dare-play", name: "Truth or Dare Play", href: "/truth-or-dare-play", category: "Fun", description: "Spin up a clean truth-or-dare game quickly.", status: "Live", isNew: true },
  { id: "pomodoro-timer", name: "Pomodoro Timer", href: "/pomodoro-timer", category: "Productivity", description: "Focus sessions with timer cycles.", status: "Live" },
  { id: "roast-my-todo-list", name: "Roast My To-Do List", href: "/roast-my-todo-list", category: "Fun + Productivity", description: "Playful roast with practical next steps.", status: "Live", isNew: true },
  { id: "markdown-previewer", name: "Markdown Previewer", href: "/markdown-previewer", category: "Developer", description: "Write markdown and preview instantly.", status: "Live", isNew: true },
  { id: "video-transcriber", name: "Video Transcriber", href: "/video-transcriber", category: "Media", description: "Transcribe video audio to text quickly and accurately.", status: "Live", isNew: true },
  { id: "youtube-title-generator", name: "YouTube Title Generator", href: "/youtube-title-generator", category: "Media", description: "Generate clickable title ideas for your next video.", status: "Live", isNew: true, isFeatured: true },
  { id: "linkedin-post-formatter", name: "LinkedIn Post Formatter", href: "/linkedin-post-formatter", category: "Professional", description: "Create engaging LinkedIn posts tailored to your audience.", status: "Live", isNew: true },
  { id: "what-happened-today", name: "What Happened Today In History", href: "/what-happened-today", category: "Learning", description: "Discover major historical events that happened on this day.", status: "Live", isNew: true },
  { id: "math-formula-calculator", name: "Math Formula Calculator", href: "/math-formula-calculator", category: "Education", description: "Calculate algebra, geometry, trigonometry, and statistics formulas.", status: "Live", isNew: true },
  { id: "science-formulas-calculator", name: "Science Formulas Calculator", href: "/science-formulas-calculator", category: "Education", description: "Physics, chemistry, and biology formulas with step-by-step solutions.", status: "Live", isNew: true },
  { id: "concept-explorer", name: "QuickLearn", href: "/concept-explorer", category: "Learning", description: "Explore any topic with quick explanations, examples, and guided next steps.", status: "Live", isNew: true },
  { id: "base-converter", name: "Base Converter", href: "/base-converter", category: "Developer", description: "Convert Binary, Decimal, Octal, and Hex instantly.", status: "Live" },
  { id: "aspect-ratio-calculator", name: "Aspect Ratio Calculator", href: "/aspect-ratio-calculator", category: "Developer", description: "Resize images while preserving aspect ratio.", status: "Live", isNew: true },
  { id: "distance-between-cities", name: "Distance Between Cities", href: "/distance-between-cities", category: "Utility", description: "Compute straight-line distance and travel estimates.", status: "Live", isNew: true },
  { id: "currency-converter", name: "Currency Converter", href: "/currency-converter", category: "Finance", description: "Quick currency conversions with optional historical rates.", status: "Live", isNew: true },
  { id: "percentage-calculator", name: "Percentage Calculator", href: "/percentage-calculator", category: "Finance", description: "Solve common percentage questions instantly.", status: "Live", isNew: true },
  { id: "social-account-analyzer", name: "Social Account Analyzer", href: "/social-account-analyzer", category: "Creator Tools", description: "Check Instagram or YouTube account health — spam followers, consistency & growth.", status: "Live", isNew: true },
  { id: "attendance-calculator", name: "Attendance Calculator", href: "/attendance-calculator", category: "Education", description: "Stress-free semester planning. Know exactly how many classes you can skip and still maintain your attendance percentage. Plan strategically, skip smartly.", status: "Live", isNew: true },
  { id: "cgpa-target-planner", name: "CGPA Target Planner", href: "/cgpa-target-planner", category: "Education", description: "Calculate the required SGPA for your remaining semesters to reach your target CGPA, simulate scenarios, and plan your academic roadmap.", status: "Live", isNew: true },
  { id: "youtube-downloader", name: "YouTube Downloader", href: "/youtube-downloader", category: "Media", description: "Download videos, captions, and thumbnails from YouTube. Best used locally for full functionality.", status: "Live", isNew: true },
  { id: "video-to-audio-converter", name: "Video to Audio Converter", href: "/video-to-audio-converter", category: "Media", description: "Upload a video and extract audio in MP3, M4A, WAV, or FLAC format.", status: "Live", isNew: true, isFeatured: true },
  { id: "typing-speed-tester", name: "Typing Speed Tester", href: "/typing-speed-tester", category: "Productivity", description: "Measure your typing speed and accuracy in real-time.", status: "Live", isNew: true, isFeatured: true },
  { id: "calorie-calculator", name: "Calorie Calculator", href: "/calorie-calculator", category: "Health", description: "Estimate daily calorie needs, BMR, TDEE, and macro targets based on your profile.", status: "Live", isNew: true, isFeatured: true },
  { id: "hook-generator", name: "Hook Generator", href: "/hook-generator", category: "Creator Tools", description: "Generate punchy, attention-grabbing opening lines for social media and content.", status: "Live", isNew: true, isFeatured: true },
  { id: "sleep-cycle-calculator", name: "Sleep Cycle Calculator", href: "/sleep-cycle-calculator", category: "Health", description: "Time your sleep with natural 90-minute cycles to wake up refreshed.", status: "Live", isNew: true, isFeatured: true },
  { id: "color-palette-generator", name: "Color Palette Generator", href: "/color-palette-generator", category: "Creator Tools", description: "Generate beautiful color harmonies, lock colors, explore shades, and export palettes.", status: "Live", isNew: true, isFeatured: true },
  { id: "invoice-generator", name: "Invoice Generator", href: "/invoice-generator", category: "Finance", description: "Generate professional invoices instantly.", status: "Live", isNew: true },
  { id: "should-i-reply", name: "Should I Reply?", href: "/should-i-reply", category: "Productivity", description: "Evaluate if, when, and how you should reply to a message based on relationship, tone, and context.", status: "Live", isNew: true, isFeatured: true },
  { id: "subscription-tracker", name: "Subscription Tracker", href: "/subscription-tracker", category: "Finance", description: "Track recurring subscriptions, view monthly/yearly breakdowns, renewal schedules, and spending insights.", status: "Live", isNew: true, isFeatured: true },
  { id: "personal-admin-dashboard", name: "Personal Admin Dashboard", href: "/personal-admin-dashboard", category: "Productivity", description: "Manage passport, license, insurance, documents, and reminders all in one place, stored completely offline.", status: "Live", isNew: true, isFeatured: true },
  { id: "email-decoder", name: "Email Decoder", href: "/email-decoder", category: "Productivity", description: "Understand subtext, tone, key points, and recommended responses for any email.", status: "Live", isNew: true, isFeatured: true },
  { id: "learning-os", name: "Learning OS", href: "/learning-os", category: "Productivity", description: "Organize learning goals, track breakdown topics, and generate daily/weekly study targets.", status: "Live", isNew: true, isFeatured: true },
  { id: "leverage-finder", name: "Leverage Finder", href: "/leverage-finder", category: "Productivity", description: "Identify high-leverage actions and avoid low-value distractions to achieve your goals efficiently.", status: "Live", isNew: true, isFeatured: true },
  { id: "clipboard-history-manager", name: "Clipboard History Manager", href: "/clipboard-history-manager", category: "Productivity", description: "Store and manage multiple copied texts in one place offline.", status: "Live", isNew: true, isFeatured: true },
  { id: "digital-declutter-assistant", name: "Digital Declutter Assistant", href: "/digital-declutter-assistant", category: "Productivity", description: "Analyze your local files to find duplicates, similar names, large/old items, and unorganized folders 100% locally.", status: "Live", isNew: true, isFeatured: true },
  { id: "second-mind", name: "Second Mind", href: "/second-mind", category: "Productivity", description: "Analyze situations from four distinct cognitive perspectives to overcome mental blocks.", status: "Live", isNew: true, isFeatured: true },
  { id: "fear-decomposer", name: "Fear Decomposer", href: "/fear-decomposer", category: "Productivity", description: "Deconstruct fears and obstacles into real vs. imagined risks, controllable/uncontrollable factors, worst case scenario, and a first step.", status: "Live", isNew: true, isFeatured: true },
  { id: "perspective-switcher", name: "Perspective Switcher", href: "/perspective-switcher", category: "Productivity", description: "Reframe your dilemmas and view problems from five distinct personal and objective viewpoints.", status: "Live", isNew: true, isFeatured: true },
  { id: "history-repeats", name: "History Repeats", href: "/history-repeats", category: "Learning", description: "Compare modern situations to historical events, revealing patterns, similarities, differences, and key lessons.", status: "Live", isNew: true, isFeatured: true },
  { id: "historical-perspective", name: "Historical Perspective", href: "/historical-perspective", category: "Learning", description: "Analyze modern trends and situations through the lens of history, comparing patterns, timelines, and outcomes 100% locally.", status: "Live", isNew: true, isFeatured: true },
  { id: "before-after", name: "Before & After", href: "/before-after", category: "Learning", description: "Explore how life changed before and after major inventions, scientific discoveries, and historical breakthroughs.", status: "Live", isNew: true, isFeatured: true },
  { id: "empire-simulator", name: "Empire Simulator", href: "/empire-simulator", category: "Learning", description: "Build and manage a fictional empire to simulate growth, random historical events, and collapse risks.", status: "Live", isNew: true, isFeatured: true },
  { id: "timeline-comparison", name: "Timeline Comparison", href: "/timeline-comparison", category: "Learning", description: "Visually compare two historical civilizations, empires, inventions, technologies, or events side-by-side across time.", status: "Live", isNew: true, isFeatured: true },
  { id: "if-this-never-happened", name: "If This Never Happened", href: "/if-this-never-happened", category: "Learning", description: "Explore alternate history by simulating how the world would look today if a major event or invention never occurred.", status: "Live", isNew: true, isFeatured: true },
  { id: "your-weight-on-other-planets", name: "Your Weight on Other Planets", href: "/your-weight-on-other-planets", category: "Learning", description: "Calculate your weight, jump height, and lifting capacity across different planets and moons in our Solar System.", status: "Live", isNew: true, isFeatured: true },
  { id: "cosmic-calendar", name: "Cosmic Calendar", href: "/cosmic-calendar", category: "Learning", description: "Understand the scale of time by compressing the history of the universe into a calendar year and comparing it to your life.", status: "Live", isNew: true, isFeatured: true },
  { id: "cosmic-address", name: "Cosmic Address", href: "/cosmic-address", category: "Learning", description: "Trace your exact location in the universe, zooming out from yourself to the edge of the observable universe with interactive visualizations.", status: "Live", isNew: true, isFeatured: true },
  { id: "time-on-other-planets", name: "Time on Other Planets", href: "/time-on-other-planets", category: "Learning", description: "Compare planetary years, days, birthdays, and age across the Solar System with orbital maps and comparisons.", status: "Live", isNew: true, isFeatured: true },
  { id: "placement-readiness-score", name: "Placement Readiness Score", href: "/placement-readiness-score", category: "Career", description: "Evaluate your placement preparation with an offline placement readiness assessment including resume, DSA, projects, aptitude and communication skills.", status: "Live", isNew: true, isFeatured: true },
  { id: "study-material-finder", name: "Study Material Finder", href: "/study-material-finder", category: "Education", description: "Enter any topic and instantly get the best GitHub repos, YouTube playlists, documentation, and practice resources — all in one place.", status: "Live", isNew: true, isFeatured: true }
];

export const liveToolIds = new Set(
  tools.filter(t => t.status === "Live").map(t => t.id)
);

export const featuredToolIds = ["attendance-calculator", "perspective-switcher", "placement-readiness-score"];

export const availableTools = tools.filter((t) => liveToolIds.has(t.id));
