# Link Intelligence Tool

Link Intelligence is a 100% client-side privacy and security laboratory for the "Boring Tools" ecosystem. It helps users deconstruct URLs, detect tracking parameters, evaluate security risk factors, decode redirect chains, detect brand impersonation, and generate clean shareable links — all without exposing any data to servers.

---

## Features

### 1. Interactive URL Explorer (Hover Highlights)
- Color-coded visual URL breakdown with **Protocol**, **Subdomain**, **Domain**, **Path**, **Parameters**, and **Fragment** blocks.
- Hovering over any block highlights the corresponding section in the raw URL rendered on a dark terminal-style bar.
- Hovering over the raw URL highlights the corresponding visual block.

### 2. Parameter Workshop (Live Toggles)
- Every query parameter is displayed in a table with a checkbox toggle.
- Unchecking a parameter removes it from the cleaned URL in real-time.
- Parameters flagged as trackers are highlighted in red.
- The cleaned URL, QR code, and markdown link update dynamically.

### 3. Recursive Redirect Chain Decoder
- Detects parameters containing percent-encoded URLs (e.g. `redirect_to=https%3A%2F%2F...`).
- Recursively decodes up to 3 layers deep.
- Renders a visual "hop chain" with dots and connectors showing the full redirect path from initial click to final target.

### 4. Brand Impersonation / Typosquatting Detection
- Maintains a client-side dictionary of 30+ high-value brand targets (PayPal, Google, Apple, Amazon, Netflix, etc.).
- Runs a **Levenshtein distance** check against the registered domain.
- Flags domains within edit-distance ≤ 2 OR domains that contain brand names (e.g. `paypal-security.com`, `arnazon.com`, `goog1e.com`).
- Surfaces a prominent "Brand Impersonation Alert" banner in the score card.

### 5. Clean URL QR Code Generator
- Auto-generates a QR code of the cleaned URL using the project's `qrcode` npm package.
- Allows users to scan the tracker-free URL onto mobile devices.
- Includes a download button for the QR code image.

### 6. Bulk URL Extraction & Cleaner
- Toggle between **Single Link** and **Bulk Cleaner** modes.
- Paste raw emails, chat transcripts, or logs.
- Automatically extracts all URLs, analyzes each one, strips trackers, and displays:
  - Original vs. cleaned URL
  - Number of trackers removed
  - Safety score with color-coded badge
- "Copy All Clean URLs" button for one-click batch export.

### 7. Risk Signal Expansion
- **High-Risk TLD Detection**: Alerts on abuse-prone domain extensions (`.zip`, `.mov`, `.top`, `.tk`, `.cf`, `.ml`, `.ga`, `.gq`, etc.).
- **URL Shortener Detection**: Identifies link-masking services (`bit.ly`, `t.co`, `tinyurl.com`, `goo.gl`, etc.) and warns that the real destination is hidden.

### 8. Custom Parameter Stripping Rules
- Users can add custom parameter key names they always want stripped from URLs.
- Rules are persisted in `window.localStorage` across sessions.
- Custom rules are applied alongside the built-in tracker dictionary.
- Manage rules via a dedicated ⚙ Rules panel.

### 9. Safety Indicators (10 Checks)
| # | Check | Risk Levels |
|---|-------|-------------|
| 1 | Connection Security (HTTPS vs HTTP) | Safe / Risk |
| 2 | Authority Spoofing (@) | Safe / Risk |
| 3 | IDN Homograph (Punycode/Cyrillic) | Safe / Risk |
| 4 | Brand Impersonation (Levenshtein) | Safe / Risk |
| 5 | Subdomain Depth | Safe / Caution / Risk |
| 6 | Open Redirect Parameters | Safe / Caution / Risk |
| 7 | URL Length | Safe / Caution / Risk |
| 8 | Parameter Encoding (Base64) | Safe / Caution |
| 9 | High-Risk TLD | Safe / Risk |
| 10 | URL Shortener | Safe / Caution |

### 10. Tracker Database (45+ Keys)
Covers UTM parameters, click IDs (Facebook, Google, Microsoft, Yahoo, Twitter, TikTok, LinkedIn, Snapchat), marketing CRMs (HubSpot, Mailchimp, Klaviyo, Marketo, SendGrid, Adobe), affiliate tags (Amazon, generic), and misc telemetry.

### 11. Export Options
- **Copy Clean URL**: One-click copy of the tracker-stripped URL.
- **Copy Markdown Link**: `[Link](clean-url)` format ready for sharing.
- **Download QR Code**: PNG image of the clean URL QR code.
- **Copy Full Report**: Formatted text report with all findings.

---

## Architecture

- **Runtime**: 100% client-side JavaScript. No network requests are made for analysis.
- **Parsing**: Uses the browser-native `URL` and `URLSearchParams` APIs with automatic protocol prefixing.
- **String Matching**: Levenshtein distance algorithm implemented in pure JS for brand comparison.
- **Recursive Decoding**: Multi-pass `decodeURIComponent` with URL extraction regex for redirect chain tracing.
- **Persistence**: Custom rules stored in `window.localStorage` under key `link-intel-custom-rules`.
- **QR Generation**: Uses the `qrcode` npm package (already a project dependency).
