// Test Invidious API for video info + formats + downloads
(async () => {
  const videoId = 'dQw4w9WgXcQ';
  
  // Get Invidious instances
  const listRes = await fetch('https://api.invidious.io/instances.json?sort_by=type,users', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const instances = await listRes.json();
  const hosts = instances
    .filter(item => item?.[1]?.api === true && item?.[1]?.type === 'https')
    .map(item => item[0])
    .slice(0, 20);
  
  console.log('Found', hosts.length, 'Invidious instances');
  
  // Try each host
  for (const host of hosts.slice(0, 5)) {
    console.log(`\n--- ${host} ---`);
    try {
      const url = `https://${host}/api/v1/videos/${videoId}?local=true`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        console.log('FAIL:', res.status);
        continue;
      }
      const data = await res.json();
      
      console.log('Title:', data.title);
      console.log('Author:', data.author);
      console.log('Duration:', data.lengthSeconds, 'sec');
      console.log('Description:', data.description?.substring(0, 80));
      
      // Thumbnails
      if (data.videoThumbnails?.length) {
        const best = data.videoThumbnails.sort((a, b) => (b.width || 0) - (a.width || 0))[0];
        console.log('Best thumb:', best.quality, best.width + 'x' + best.height, best.url?.substring(0, 80));
      }
      
      // Formats
      const videoFormats = (data.formatStreams || []);
      const adaptiveFormats = (data.adaptiveFormats || []).filter(f => f.type?.startsWith('video/'));
      console.log('Format streams:', videoFormats.length, 'Adaptive video:', adaptiveFormats.length);
      
      videoFormats.forEach(f => {
        console.log(`  ${f.qualityLabel || f.quality} (${f.container}) url:${f.url ? 'YES' : 'NO'}`);
      });
      
      // Test download URL
      if (videoFormats[0]?.url) {
        const dlRes = await fetch(videoFormats[0].url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        console.log('Download test:', dlRes.status, dlRes.headers.get('content-type'));
      }
      
      console.log('SUCCESS!');
      break;
    } catch (e) {
      console.log('ERROR:', e.message);
    }
  }
  
})().catch(e => console.error('FATAL:', e.message));
