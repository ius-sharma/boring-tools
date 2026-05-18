const { Innertube, Platform } = require('youtubei.js');
const { generate } = require('youtube-po-token-generator');

Platform.shim.eval = async (data) => {
  return new Function(data.output)();
};

(async () => {
  console.log('Generating PoToken...');
  const { visitorData, poToken } = await generate();
  console.log('visitorData:', visitorData?.substring(0, 30) + '...');
  console.log('poToken:', poToken?.substring(0, 30) + '...');
  
  const yt = await Innertube.create({
    lang: 'en',
    location: 'US',
    retrieve_player: true,
    visitor_data: visitorData,
    po_token: poToken,
  });
  
  const info = await yt.getInfo('dQw4w9WgXcQ');
  console.log('\nTitle:', info.basic_info.title);
  
  const fmts = [...(info.streaming_data?.formats || []), ...(info.streaming_data?.adaptive_formats || [])];
  const fmt = fmts.find(f => f.itag === 18);
  
  if (fmt) {
    console.log('Format:', fmt.quality_label, 'URL present:', !!fmt.url);
    
    const url = fmt.url || await fmt.decipher(yt.session?.player);
    console.log('Deciphered URL:', !!url);
    
    // Test fetch
    const res = await fetch(url);
    console.log('Fetch status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Length:', res.headers.get('content-length'));
    
    if (res.status === 200) {
      console.log('SUCCESS! Download works!');
    }
  }
  
  // Also try yt.download
  console.log('\nTrying yt.download...');
  try {
    const stream = await yt.download('dQw4w9WgXcQ', {
      type: 'video+audio',
      quality: '360p',
    });
    const reader = stream.getReader();
    const { value } = await reader.read();
    console.log('First chunk:', value?.length, 'bytes');
    reader.releaseLock();
    console.log('yt.download WORKS!');
  } catch(e) {
    console.log('yt.download error:', e.message);
  }
  
})().catch(e => console.error('FATAL:', e.message));
