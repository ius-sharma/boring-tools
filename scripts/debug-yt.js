// Deep search ytInitialData for small channel data patterns

async function debug() {
  const res = await fetch("https://www.youtube.com/@ocnayush", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();
  const ytMatch = html.match(/var\s+ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s);
  if (!ytMatch) { console.log("No ytInitialData"); return; }
  
  const jsonStr = ytMatch[1];
  
  // Search for ANY subscriber-related text
  const patterns = [
    /subscriber[^"]{0,80}/gi,
    /"videoCount"[^,]{0,100}/g,
    /"videosCountText[^}]{0,200}/g,
    /"subscriberCount[^}]{0,300}/g,
  ];
  
  for (const p of patterns) {
    const matches = jsonStr.match(p);
    if (matches) {
      console.log(`\n=== Pattern: ${p} ===`);
      matches.slice(0, 5).forEach((m, i) => console.log(`  [${i}]`, m.substring(0, 250)));
    } else {
      console.log(`\nPattern ${p}: NO MATCHES`);
    }
  }

  // Parse the JSON and look for header/metadata
  const data = JSON.parse(jsonStr);
  
  // Check header section
  const header = data?.header;
  if (header) {
    console.log("\n=== Header keys ===");
    console.log(Object.keys(header));
    
    // pageHeaderRenderer
    const phr = header?.pageHeaderRenderer;
    if (phr) {
      console.log("\npageHeaderRenderer keys:", Object.keys(phr));
      // Look for content
      const content = phr?.content;
      if (content) {
        console.log("content keys:", Object.keys(content));
        const phvm = content?.pageHeaderViewModel;
        if (phvm) {
          console.log("pageHeaderViewModel keys:", Object.keys(phvm));
          const metadata = phvm?.metadata;
          if (metadata) {
            console.log("\nmetadata:", JSON.stringify(metadata).substring(0, 500));
          }
        }
      }
    }
    
    // c4TabbedHeaderRenderer
    const c4 = header?.c4TabbedHeaderRenderer;
    if (c4) {
      console.log("\nc4TabbedHeaderRenderer found!");
      console.log("subscriberCountText:", JSON.stringify(c4.subscriberCountText));
      console.log("videosCountText:", JSON.stringify(c4.videosCountText));
    }
  }

  // Check metadata
  const metadata = data?.metadata;
  if (metadata) {
    console.log("\n=== Metadata ===");
    console.log(JSON.stringify(metadata).substring(0, 1000));
  }

  // Check microformat
  const mf = data?.microformat;
  if (mf) {
    console.log("\n=== Microformat ===");
    console.log(JSON.stringify(mf).substring(0, 1000));
  }
}

debug().catch(console.error);
