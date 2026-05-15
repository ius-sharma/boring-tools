# Instagram Reels Transcription Setup Guide

This guide explains how to set up the Video Transcriber tool to support Instagram Reels, video posts, and TV videos transcription.

## Prerequisites

The Video Transcriber now supports Instagram content transcription using the following technologies:

1. **yt-dlp** - For downloading audio from Instagram videos
2. **Groq API** - For AI-powered audio transcription using Whisper

## Installation Steps

### 1. Install yt-dlp

yt-dlp is required to extract audio from Instagram videos. Choose one of the following methods:

#### Option A: Using pip (Recommended)
```bash
pip install yt-dlp
```

#### Option B: Using npm
```bash
npm install -g yt-dlp
```

#### Option C: Using winget (Windows)
```bash
winget install yt-dlp
```

#### Option D: Using Homebrew (macOS)
```bash
brew install yt-dlp
```

**Verify installation:**
```bash
yt-dlp --version
```

### 2. Set up Groq API Key

The tool uses Groq's Whisper API for transcribing audio. You need to:

1. Sign up at [Groq Console](https://console.groq.com)
2. Create an API key
3. Add it to your `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Supported Instagram Content

The updated Video Transcriber now supports:

- **Instagram Reels** - `https://www.instagram.com/reel/XXXXX/`
- **Instagram Video Posts** - `https://www.instagram.com/p/XXXXX/`
- **Instagram TV (IGTV)** - `https://www.instagram.com/tv/XXXXX/`

## How It Works

1. **URL Detection** - The tool identifies the Instagram URL type (reel, post, or TV)
2. **Audio Extraction** - yt-dlp downloads the audio from the video
3. **Transcription** - Groq's Whisper API converts audio to text
4. **Display** - The transcript is shown in the UI with copy/download options

## Requirements for Success

- **Public Content** - The Instagram content must be publicly accessible (not private)
- **Audio** - The video must contain audio for transcription to work
- **Network** - Stable internet connection for downloading and API calls
- **yt-dlp** - Must be installed and accessible from PATH or via environment variable

## Troubleshooting

### Error: "yt-dlp is not installed"

**Solution:** Install yt-dlp using one of the methods above and ensure it's in your system PATH.

Alternatively, set the `YT_DLP_PATH` environment variable:
```env
YT_DLP_PATH=/path/to/yt-dlp
```

### Error: "Groq API key not configured"

**Solution:** Add your Groq API key to `.env.local`:
```env
GROQ_API_KEY=your_key_here
```

### Error: "Instagram API is not granting access"

**Possible causes:**
- The content is private or deleted
- Instagram is blocking the request (rate limiting)
- The URL is invalid

**Solutions:**
- Verify the content is publicly accessible
- Wait a few minutes and try again
- Check that the URL is correct

### Error: "Failed to find audio file"

**Possible causes:**
- The video has no audio
- yt-dlp couldn't download the video
- Temporary directory permissions issue

**Solutions:**
- Ensure the video contains audio
- Check yt-dlp is working: `yt-dlp -g "https://www.instagram.com/reel/XXXXX/"`
- Verify temp directory permissions

## Performance Notes

- **First request** may take longer (30-60 seconds) as yt-dlp downloads the audio
- **Audio quality** is set to 192kbps for balance between quality and speed
- **Transcription time** depends on video length (typically 1-3 minutes per video)

## Advanced Configuration

### Custom yt-dlp Path

If yt-dlp is installed in a non-standard location:

```env
YT_DLP_PATH=/custom/path/to/yt-dlp
```

### Groq Model Selection

The tool uses `whisper-large-v3-turbo` model. To use a different model, modify the API call in `route.js`:

```javascript
formData.append("model", "whisper-large-v3");  // For higher accuracy
```

## Security & Privacy

- **No uploads** - Videos are processed locally and not uploaded to external servers
- **Temporary files** - Audio files are automatically deleted after transcription
- **API keys** - Keep your Groq API key secure and never commit it to version control
- **Rate limiting** - Respect Instagram's rate limits to avoid being blocked

## Limitations

- **Private content** - Cannot transcribe private Instagram accounts
- **Archived content** - Archived stories/posts may not be accessible
- **Very long videos** - Extremely long videos may timeout
- **Audio-only** - Transcription quality depends on audio quality in the video

## Support & Updates

For issues or feature requests, please check:
- [yt-dlp GitHub Issues](https://github.com/yt-dlp/yt-dlp/issues)
- [Groq Documentation](https://console.groq.com/docs)
- [boring-tools GitHub Issues](https://github.com/ius-sharma/boring-tools/issues)

## Related Tools

- **yt-dlp** - Video/audio downloader: https://github.com/yt-dlp/yt-dlp
- **Groq API** - Fast AI inference: https://groq.com
- **Whisper** - Audio transcription model: https://openai.com/research/whisper
