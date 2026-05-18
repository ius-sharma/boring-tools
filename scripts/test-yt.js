// Test regex patterns for ytInitialPlayerResponse
(async () => {
  const videoId = 'dQw4w9WgXcQ';
  
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  const html = await res.text();
  
  // Try different regex patterns
  const patterns = [
    { name: 'strict', regex: /var\s+ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|<\/script)/s },
    { name: 'lenient', regex: /ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|<\/script)/s },
    { name: 'very-lenient', regex: /ytInitialPlayerResponse\s*=\s*(\{.+?\});/s },
  ];
  
  for (const p of patterns) {
    const m = html.match(p.regex);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const fmts = data?.streamingData?.formats?.length || 0;
        const adaptive = data?.streamingData?.adaptiveFormats?.length || 0;
        console.log(`${p.name}: MATCH, formats:${fmts} adaptive:${adaptive}`);
      } catch {
        console.log(`${p.name}: MATCH but JSON parse failed`);
      }
    } else {
      console.log(`${p.name}: NO MATCH`);
    }
  }
  
  // Also check: what does the page actually contain around ytInitialPlayerResponse
  const idx = html.indexOf('ytInitialPlayerResponse');
  if (idx >= 0) {
    const around = html.substring(idx - 20, idx + 40);
    console.log('\nContext around ytInitialPlayerResponse:', JSON.stringify(around));
  }
  
})();
