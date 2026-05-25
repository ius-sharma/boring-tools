# BoringTools — Local Setup Guide 🛠️

Some tools work best when run locally. This guide will help you set up and run BoringTools on your machine.

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning the repo)

Check if you have Node.js installed:
```bash
node --version
npm --version
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/boring-tools.git
cd boring-tools
```

Or download the ZIP file and extract it.

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages, including:
- Next.js
- React
- yt-dlp (for YouTube tools)
- And other dependencies

### 3. Install yt-dlp (For YouTube Downloader)

The YouTube downloader tool requires `yt-dlp` to be available on your system.

#### On Windows (using Chocolatey):
```bash
choco install yt-dlp
```

#### On Windows (Manual):
1. Download from: https://github.com/yt-dlp/yt-dlp/releases
2. Extract and add to PATH, or place in your project root

#### On macOS:
```bash
brew install yt-dlp
```

#### On Linux:
```bash
sudo apt install yt-dlp
```

#### Verify Installation:
```bash
yt-dlp --version
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## Using the YouTube Downloader Locally

1. Navigate to `http://localhost:3000/youtube-downloader`
2. Paste any YouTube URL (full link or youtu.be shortlink)
3. Click "Get Video Info" to fetch metadata, thumbnail, captions, and available formats
4. Download video in your preferred quality
5. Download thumbnails and captions as needed

### Why YouTube Downloader Works Better Locally

**Online version limitations:**
- Server-side downloads consume excessive bandwidth
- YouTube API rate limits restrict concurrent requests
- Legal constraints on server-hosted downloads
- File size restrictions on web servers

**Local version advantages:**
- ✅ Full video quality download support
- ✅ Unlimited download speeds (your ISP limit)
- ✅ No server-side rate limits
- ✅ Privacy — files stay on your computer
- ✅ Works offline (after initial fetch)

---

## Troubleshooting

### "yt-dlp not found" Error

**Solution:** Make sure yt-dlp is installed and accessible from command line.

1. Verify installation:
   ```bash
   yt-dlp --version
   ```

2. If not found, install it:
   - Windows: `choco install yt-dlp` or download manually
   - macOS: `brew install yt-dlp`
   - Linux: `sudo apt install yt-dlp`

### Dependencies Installation Fails

**Solution:** Clear npm cache and reinstall:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use

**Solution:** Use a different port:

```bash
npm run dev -- -p 3001
```

Then visit `http://localhost:3001`

### YouTube URL Not Working

**Solution:** Make sure to use valid YouTube URLs:
- ✅ `https://www.youtube.com/watch?v=VIDEO_ID`
- ✅ `https://youtu.be/VIDEO_ID`
- ✅ `https://www.youtube.com/embed/VIDEO_ID`

---

## Environment Variables (Optional)

Create a `.env.local` file in the root directory for any API keys or configurations:

```env
# Add any API keys or environment variables here
```

Currently, the YouTube downloader doesn't require API keys as it uses web scraping.

### DOC to PDF Converter setup

The DOC to PDF Converter uses CloudConvert in deployed environments so it can convert DOC and DOCX files without depending on local Office software.

#### Get a CloudConvert API key

1. Create or sign in to your CloudConvert account at https://cloudconvert.com/
2. Open the CloudConvert dashboard.
3. Go to **API Keys**.
4. Create a new API key and copy it when it is generated.

#### Configure it locally

Add the key to `.env.local`:

```env
CLOUDCONVERT_API_KEY=your_key_here
```

Restart `npm run dev` after saving the file.

#### Configure it in production

Add `CLOUDCONVERT_API_KEY` in your hosting provider's environment variable settings, then redeploy the app.

For Vercel:
1. Open your project in the Vercel dashboard.
2. Go to **Settings** > **Environment Variables**.
3. Add `CLOUDCONVERT_API_KEY` for the environments you use.
4. Redeploy the project.

Keep the key server-side only. Do not paste it into client-side code.

---

## Project Structure

```
boring-tools/
├── app/
│   ├── youtube-downloader/
│   │   └── page.jsx          # YouTube downloader UI
│   ├── api/
│   │   └── youtube-downloader/
│   │       └── route.js       # Backend API
│   ├── components/            # Shared components
│   ├── layout.tsx             # App layout
│   └── page.jsx               # Homepage
├── public/                    # Static files
├── scripts/                   # Utility scripts
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check for code issues |

---

## Need Help?

- **GitHub Issues:** https://github.com/your-username/boring-tools/issues
- **YouTube yt-dlp Docs:** https://github.com/yt-dlp/yt-dlp
- **Next.js Docs:** https://nextjs.org/docs

---

## FAQ

**Q: Can I use this online instead of locally?**  
A: The online version has limitations. Local setup is recommended for full functionality and better download speeds.

**Q: Is it legal to download from YouTube?**  
A: Downloading is only legal for content you have permission to download. Always respect copyright and YouTube's Terms of Service.

**Q: Will my videos be stored on the server?**  
A: No! With local setup, everything stays on your computer. Nothing is uploaded or stored anywhere else.

**Q: Can I run this on a server?**  
A: Yes, but server-side downloads have legal and technical limitations. Local use is recommended.

---

Happy downloading! 🎉
