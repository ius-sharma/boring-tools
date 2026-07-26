"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

// --- INLINED GIFENC LIBRARY ---
var X={signature:"GIF",version:"89a",trailer:59,extensionIntroducer:33,applicationExtensionLabel:255,graphicControlExtensionLabel:249,imageSeparator:44,signatureSize:3,versionSize:3,globalColorTableFlagMask:128,colorResolutionMask:112,sortFlagMask:8,globalColorTableSizeMask:7,applicationIdentifierSize:8,applicationAuthCodeSize:3,disposalMethodMask:28,userInputFlagMask:2,transparentColorFlagMask:1,localColorTableFlagMask:128,interlaceFlagMask:64,idSortFlagMask:32,localColorTableSizeMask:7};function F(t=256){let e=0,s=new Uint8Array(t);return{get buffer(){return s.buffer},reset(){e=0},bytesView(){return s.subarray(0,e)},bytes(){return s.slice(0,e)},writeByte(r){n(e+1),s[e]=r,e++},writeBytes(r,o=0,i=r.length){n(e+i);for(let c=0;c<i;c++)s[e++]=r[c+o]},writeBytesView(r,o=0,i=r.byteLength){n(e+i),s.set(r.subarray(o,o+i),e),e+=i}};function n(r){var o=s.length;if(o>=r)return;var i=1024*1024;r=Math.max(r,o*(o<i?2:1.125)>>>0),o!=0&&(r=Math.max(r,256));let c=s;s=new Uint8Array(r),e>0&&s.set(c.subarray(0,e),0)}}var O=12,J=5003,lt=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535];function at(t,e,s,n,r=F(512),o=new Uint8Array(256),i=new Int32Array(J),c=new Int32Array(J)){let x=i.length,a=Math.max(2,n);o.fill(0),c.fill(0),i.fill(-1);let l=0,f=0,g=a+1,h=g,b=!1,w=h,_=(1<<w)-1,u=1<<g-1,k=u+1,B=u+2,p=0,A=s[0],z=0;for(let y=x;y<65536;y*=2)++z;z=8-z,r.writeByte(a),I(u);let d=s.length;for(let y=1;y<d;y++){t:{let m=s[y],v=(m<<O)+A,M=m<<z^A;if(i[M]===v){A=c[M];break t}let V=M===0?1:x-M;for(;i[M]>=0;)if(M-=V,M<0&&(M+=x),i[M]===v){A=c[M];break t}I(A),A=m,B<1<<O?(c[M]=B++,i[M]=v):(i.fill(-1),B=u+2,b=!0,I(u))}}return I(A),I(k),r.writeByte(0),r.bytesView();function I(y){for(l&=lt[f],f>0?l|=y<<f:l=y,f+=w;f>=8;)o[p++]=l&255,p>=254&&(r.writeByte(p),r.writeBytesView(o,0,p),p=0),l>>=8,f-=8;if((B>_||b)&&(b?(w=h,_=(1<<w)-1,b=!1):(++w,_=w===O?1<<w:(1<<w)-1)),y==k){for(;f>0;)o[p++]=l&255,p>=254&&(r.writeByte(p),r.writeBytesView(o,0,p),p=0),l>>=8,f-=8;p>0&&(r.writeByte(p),r.writeBytesView(o,0,p),p=0)}}}var $=at;function D(t,e,s){return t<<8&63488|e<<2&992|s>>3}function G(t,e,s,n){return t>>4|e&240|(s&240)<<4|(n&240)<<8}function j(t,e,s){return t>>4<<8|e&240|s>>4}function R(t,e,s){return t<e?e:t>s?s:t}function T(t){return t*t}function tt(t,e,s){var n=0,r=1e100;let o=t[e],i=o.cnt,c=o.ac,x=o.rc,a=o.gc,l=o.bc;for(var f=o.fw;f!=0;f=t[f].fw){let h=t[f],b=h.cnt,w=i*b/(i+b);if(!(w>=r)){var g=0;s&&(g+=w*T(h.ac-c),g>=r)||(g+=w*T(h.rc-x),!(g>=r)&&(g+=w*T(h.gc-a),!(g>=r)&&(g+=w*T(h.bc-l),!(g>=r)&&(r=g,n=f))))}}o.err=r,o.nn=n}function Q(){return{ac:0,rc:0,gc:0,bc:0,cnt:0,nn:0,fw:0,bk:0,tm:0,mtm:0,err:0}}function ut(t,e){let s=e==="rgb444"?4096:65536,n=new Array(s),r=t.length;if(e==="rgba4444")for(let o=0;o<r;++o){let i=t[o],c=i>>24&255,x=i>>16&255,a=i>>8&255,l=i&255,f=G(l,a,x,c),g=f in n?n[f]:n[f]=Q();g.rc+=l,g.gc+=a,g.bc+=x,g.ac+=c,g.cnt++}else if(e==="rgb444")for(let o=0;o<r;++o){let i=t[o],c=i>>16&255,x=i>>8&255,a=i&255,l=j(a,x,c),f=l in n?n[l]:n[l]=Q();f.rc+=a,f.gc+=x,f.bc+=c,f.cnt++}else for(let o=0;o<r;++o){let i=t[o],c=i>>16&255,x=i>>8&255,a=i&255,l=D(a,x,c),f=l in n?n[l]:n[l]=Q();f.rc+=a,f.gc+=x,f.bc+=c,f.cnt++}return n}function quantize(t,e,s={}){let{format:n="rgb565",clearAlpha:r=!0,clearAlphaColor:o=0,clearAlphaThreshold:i=0,oneBitAlpha:c=!1}=s;if(!t||!t.buffer)throw new Error("quantize() expected RGBA Uint8Array data");if(!(t instanceof Uint8Array)&&!(t instanceof Uint8ClampedArray))throw new Error("quantize() expected RGBA Uint8Array data");let x=new Uint32Array(t.buffer),a=s.useSqrt!==!1,l=n==="rgba4444",f=ut(x,n),g=f.length,h=g-1,b=new Uint32Array(g+1);for(var w=0,u=0;u<g;++u){let C=f[u];if(C!=null){var _=1/C.cnt;l&&(C.ac*=_),C.rc*=_,C.gc*=_,C.bc*=_,f[w++]=C}}T(e)/w<.022&&(a=!1);for(var u=0;u<w-1;++u)f[u].fw=u+1,f[u+1].bk=u,a&&(f[u].cnt=Math.sqrt(f[u].cnt));a&&(f[u].cnt=Math.sqrt(f[u].cnt));var k,B,p;for(u=0;u<w;++u){tt(f,u,!1);var A=f[u].err;for(B=++b[0];B>1&&(p=B>>1,!(f[k=b[p]].err<=A));B=p)b[B]=k;b[B]=u}var z=w-e;for(u=0;u<z;){for(var d;;){var I=b[1];if(d=f[I],d.tm>=d.mtm&&f[d.nn].mtm<=d.tm)break;d.mtm==h?I=b[1]=b[b[0]--]:(tt(f,I,!1),d.tm=u);var A=f[I].err;for(B=1;(p=B+B)<=b[0]&&(p<b[0]&&f[b[p]].err>f[b[p+1]].err&&p++,!(A<=f[k=b[p]].err));B=p)b[B]=k;b[B]=I}var y=f[d.nn],m=d.cnt,v=y.cnt,_=1/(m+v);l&&(d.ac=_*(m*d.ac+v*y.ac)),d.rc=_*(m*d.rc+v*y.rc),d.gc=_*(m*d.gc+v*y.gc),d.bc=_*(m*d.bc+v*y.bc),d.cnt+=y.cnt,d.mtm=++u,f[y.bk].fw=y.fw,f[y.fw].bk=y.bk,y.mtm=h}let M=[];var V=0;for(u=0;;++V){let L=R(Math.round(f[u].rc),0,255),C=R(Math.round(f[u].gc),0,255),Y=R(Math.round(f[u].bc),0,255),E=255;if(l){if(E=R(Math.round(f[u].ac),0,255),c){let st=typeof c=="number"?c:127;E=E<=st?0:255}r&&E<=i&&(L=C=Y=o,E=0)}let K=l?[L,C,Y,E]:[L,C,Y];if(xt(M,K)||M.push(K),(u=f[u].fw)==0)break}return M}function xt(t,e){for(let s=0;s<t.length;s++){let n=t[s],r=n[0]===e[0]&&n[1]===e[1]&&n[2]===e[2],o=n.length>=4&&e.length>=4?n[3]===e[3]:!0;if(r&&o)return!0}return!1}function U(t,e){var s=0,n;for(n=0;n<t.length;n++){let r=t[n]-e[n];s+=r*r}return s}function P(t,e){return e>1?Math.round(t/e)*e:t}function applyPalette(t,e,s="rgb565"){if(!t||!t.buffer)throw new Error("quantize() expected RGBA Uint8Array data");if(!(t instanceof Uint8Array)&&!(t instanceof Uint8ClampedArray))throw new Error("quantize() expected RGBA Uint8Array data");if(e.length>256)throw new Error("applyPalette() only works with 256 colors or less");let n=new Uint32Array(t.buffer),r=n.length,o=s==="rgb444"?4096:65536,i=new Uint8Array(r),c=new Array(o),x=s==="rgba4444";if(s==="rgba4444")for(let a=0;a<r;a++){let l=n[a],f=l>>24&255,g=l>>16&255,h=l>>8&255,b=l&255,w=G(b,h,g,f),_=w in c?c[w]:c[w]=gt(b,h,g,f,e);i[a]=_}else{let a=s==="rgb444"?j:D;for(let l=0;l<r;l++){let f=n[l],g=f>>16&255,h=f>>8&255,b=f&255,w=a(b,h,g),_=w in c?c[w]:c[w]=bt(b,h,g,e);i[l]=_}}return i}function gt(t,e,s,n,r){let o=0,i=1e100;for(let c=0;c<r.length;c++){let x=r[c],a=x[3],l=q(a-n);if(l>i)continue;let f=x[0];if(l+=q(f-t),l>i)continue;let g=x[1];if(l+=q(g-e),l>i)continue;let h=x[2];l+=q(h-s),!(l>i)&&(i=l,o=c)}return o}function bt(t,e,s,n){let r=0,o=1e100;for(let i=0;i<n.length;i++){let c=n[i],x=c[0],a=q(x-t);if(a>o)continue;let l=c[1];if(a+=q(l-e),a>o)continue;let f=c[2];a+=q(f-s),!(a>o)&&(o=a,r=i)}return r}function q(t){return t*t}function GIFEncoder(t={}){let{initialCapacity:e=4096,auto:s=!0}=t,n=F(e),r=5003,o=new Uint8Array(256),i=new Int32Array(r),c=new Int32Array(r),x=!1;return{reset(){n.reset(),x=!1},finish(){n.writeByte(X.trailer)},bytes(){return n.bytes()},bytesView(){return n.bytesView()},get buffer(){return n.buffer},get stream(){return n},writeHeader:a,writeFrame(l,f,g,h={}){let{transparent:b=!1,transparentIndex:w=0,delay:_=0,palette:u=null,repeat:k=0,colorDepth:B=8,dispose:p=-1}=h,A=!1;if(s?x||(A=!0,a(),x=!0):A=Boolean(h.first),f=Math.max(0,Math.floor(f)),g=Math.max(0,Math.floor(g)),A){if(!u)throw new Error("First frame must include a { palette } option");pt(n,f,g,u,B),it(n,u),k>=0&&dt(n,k)}let z=Math.round(_/10);wt(n,p,z,b,w);let d=Boolean(u)&&!A;ht(n,f,g,d?u:null),d&&it(n,u),yt(n,l,f,g,B,o,i,c)}};function a(){ft(n,"GIF89a")}function wt(t,e,s,n,r){t.writeByte(33),t.writeByte(249),t.writeByte(4),r<0&&(r=0,n=!1);var o,i;n?(o=1,i=2):(o=0,i=0),e>=0&&(i=e&7),i<<=2;let c=0;t.writeByte(0|i|c|o),S(t,s),t.writeByte(r||0),t.writeByte(0)}function pt(t,e,s,n,r=8){let o=1,i=0,c=Z(n.length)-1,x=o<<7|r-1<<4|i<<3|c,a=0,l=0;S(t,e),S(t,s),t.writeBytes([x,a,l])}function dt(t,e){t.writeByte(33),t.writeByte(255),t.writeByte(11),ft(t,"NETSCAPE2.0"),t.writeByte(3),t.writeByte(1),S(t,e),t.writeByte(0)}function it(t,e){let s=1<<Z(e.length);for(let n=0;n<s;n++){let r=[0,0,0];n<e.length&&(r=e[n]),t.writeByte(r[0]),t.writeByte(r[1]),t.writeByte(r[2])}}function ht(t,e,s,n){if(t.writeByte(44),S(t,0),S(t,0),S(t,e),S(t,s),n){let r=0,o=0,i=Z(n.length)-1;t.writeByte(128|r|o|0|i)}else t.writeByte(0)}function yt(t,e,s,n,r=8,o,i,c){$(s,n,e,r,t,o,i,c)}function S(t,e){t.writeByte(e&255),t.writeByte(e>>8&255)}function ft(t,e){for(var s=0;s<e.length;s++)t.writeByte(e.charCodeAt(s))}function Z(t){return Math.max(Math.ceil(Math.log2(t)),1)}}
// ------------------------------

// Pre-defined presets
const RESOLUTIONS = {
  "480p": { label: "480p (Standard)", w: 640, h: 480 },
  "720p": { label: "720p (HD)", w: 1280, h: 720 },
  "1080p": { label: "1080p (Full HD)", w: 1920, h: 1080 },
  "custom": { label: "Custom Size", w: 500, h: 500 }
};

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 Square" },
  { value: "4:3", label: "4:3 Standard" },
  { value: "16:9", label: "16:9 Widescreen" },
  { value: "9:16", label: "9:16 Portrait" },
  { value: "custom", label: "Custom Aspect" }
];

const TRANSITIONS = [
  { value: "none", label: "None (Instant)" },
  { value: "fade", label: "Fade" },
  { value: "crossfade", label: "Crossfade" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom", label: "Zoom In" },
  { value: "scale", label: "Scale Out" },
  { value: "rotate", label: "Rotate Spin" }
];

const FONTS = [
  { value: "sans-serif", label: "Sans-Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "Impact", label: "Impact (Meme)" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Courier New", label: "Courier" }
];

const SHAPES = [
  { value: "rectangle", label: "Rectangle" },
  { value: "circle", label: "Circle" },
  { value: "triangle", label: "Triangle" },
  { value: "star", label: "Star" }
];

const EMOJIS = ["🔥", "🚀", "😂", "✨", "💯", "🎉", "❤️", "👍", "💡", "🌟", "👾", "🎨", "💥", "🐈", "🐶", "🍕"];

export default function GIFMakerApp() {
  // --- States ---
  const [frames, setFrames] = useState([]);
  const [activeFrameId, setActiveFrameId] = useState(null);
  const [selectedFrameIds, setSelectedFrameIds] = useState(new Set());
  
  // Settings
  const [globalDuration, setGlobalDuration] = useState(500); // ms
  const [transitionType, setTransitionType] = useState("none");
  const [transitionDuration, setTransitionDuration] = useState(300); // ms
  
  // Canvas Settings
  const [resPreset, setResPreset] = useState("custom");
  const [ratioPreset, setRatioPreset] = useState("1:1");
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);
  
  // Background
  const [bgType, setBgType] = useState("transparent");
  const [bgSolidColor, setBgSolidColor] = useState("#1e293b");
  const [bgGradient1, setBgGradient1] = useState("#4f46e5");
  const [bgGradient2, setBgGradient2] = useState("#ec4899");
  
  // Export & Optimization
  const [quality, setQuality] = useState("balanced"); // fast, balanced, high, ultra
  const [reduceColors, setReduceColors] = useState(false);
  const [optimizeFrames, setOptimizeFrames] = useState(true);
  const [compressGif, setCompressGif] = useState(false);
  const [smoothAnimation, setSmoothAnimation] = useState(true);
  const [loopCount, setLoopCount] = useState(0); // 0 = loop forever
  const [pingPong, setPingPong] = useState(false);
  
  const [exportFormat, setExportFormat] = useState("gif");
  const [exportFilename, setExportFilename] = useState("my-animation");

  // Playback Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState(0);
  const [playbackT, setPlaybackT] = useState(0); // Transition interpolation fraction (0 to 1)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("canvas"); // canvas, frames, layers, export
  
  // Rendering / UI Feedback States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState("0 KB");

  // Errors / Warnings
  const [errorMessage, setErrorMessage] = useState(null);

  // Drag and Drop reordering index
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Refs
  const previewCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const playTimerRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Loaded image cache (url -> HTMLImageElement)
  const imageCacheRef = useRef(new Map());

  // --- Active Frame Helper ---
  const activeFrame = useMemo(() => {
    return frames.find(f => f.id === activeFrameId) || null;
  }, [frames, activeFrameId]);

  // --- Local Storage: Load last settings ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bt-gif-maker-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.globalDuration) setGlobalDuration(parsed.globalDuration);
        if (parsed.transitionType) setTransitionType(parsed.transitionType);
        if (parsed.transitionDuration) setTransitionDuration(parsed.transitionDuration);
        if (parsed.resPreset) setResPreset(parsed.resPreset);
        if (parsed.ratioPreset) setRatioPreset(parsed.ratioPreset);
        if (parsed.canvasWidth) setCanvasWidth(parsed.canvasWidth);
        if (parsed.canvasHeight) setCanvasHeight(parsed.canvasHeight);
        if (parsed.bgType) setBgType(parsed.bgType);
        if (parsed.bgSolidColor) setBgSolidColor(parsed.bgSolidColor);
        if (parsed.bgGradient1) setBgGradient1(parsed.bgGradient1);
        if (parsed.bgGradient2) setBgGradient2(parsed.bgGradient2);
        if (parsed.quality) setQuality(parsed.quality);
        if (parsed.exportFormat) setExportFormat(parsed.exportFormat);
        if (parsed.exportFilename) setExportFilename(parsed.exportFilename);
      }
    } catch (e) {
      console.warn("Failed to load local storage settings", e);
    }
  }, []);

  // --- Local Storage: Save settings ---
  const saveSettings = () => {
    try {
      const config = {
        globalDuration, transitionType, transitionDuration,
        resPreset, ratioPreset, canvasWidth, canvasHeight,
        bgType, bgSolidColor, bgGradient1, bgGradient2,
        quality, exportFormat, exportFilename
      };
      localStorage.setItem("bt-gif-maker-settings", JSON.stringify(config));
    } catch (e) {}
  };

  // --- Estimated File Size Calculation ---
  useEffect(() => {
    if (frames.length === 0) {
      setEstimatedSize("0 KB");
      return;
    }
    // Estimated size = width * height * frames * byteMultiplier
    // Base multiplier varies with quality and compression settings
    let byteMultiplier = 0.18; // base factor
    if (quality === "fast") byteMultiplier = 0.08;
    if (quality === "high") byteMultiplier = 0.25;
    if (quality === "ultra") byteMultiplier = 0.35;
    if (reduceColors) byteMultiplier *= 0.7;
    if (compressGif) byteMultiplier *= 0.6;

    // Accounts for generated transition frames
    let frameCount = frames.length;
    if (transitionType !== "none") {
      const steps = 8; // average interpolation frames per transition
      frameCount += (frames.length - (loopCount === 0 ? 0 : 1)) * steps;
    }

    const totalPixels = canvasWidth * canvasHeight * frameCount;
    const bytes = totalPixels * byteMultiplier;
    
    if (bytes < 1024 * 1024) {
      setEstimatedSize(`${Math.round(bytes / 1024)} KB`);
    } else {
      setEstimatedSize(`${(bytes / (1024 * 1024)).toFixed(1)} MB`);
    }
  }, [frames, canvasWidth, canvasHeight, quality, reduceColors, compressGif, transitionType, loopCount]);

  // --- Canvas Resolution Presets & Ratios Logic ---
  const handleResolutionPresetChange = (presetKey) => {
    setResPreset(presetKey);
    saveSettings();
    if (presetKey !== "custom") {
      const { w, h } = RESOLUTIONS[presetKey];
      setCanvasWidth(w);
      setCanvasHeight(h);
      
      // Auto-detect ratio
      const ratio = w / h;
      if (Math.abs(ratio - 1) < 0.01) setRatioPreset("1:1");
      else if (Math.abs(ratio - 4/3) < 0.01) setRatioPreset("4:3");
      else if (Math.abs(ratio - 16/9) < 0.01) setRatioPreset("16:9");
      else if (Math.abs(ratio - 9/16) < 0.01) setRatioPreset("9:16");
      else setRatioPreset("custom");
    }
  };

  const handleRatioChange = (ratioVal) => {
    setRatioPreset(ratioVal);
    saveSettings();
    if (ratioVal !== "custom") {
      const [wRatio, hRatio] = ratioVal.split(":").map(Number);
      // Keep width fixed, compute height
      const newHeight = Math.round((canvasWidth / wRatio) * hRatio);
      setCanvasHeight(newHeight);
      setResPreset("custom");
    }
  };

  // Adjust aspect ratio when custom dimension changes
  const handleDimensionChange = (dimension, value) => {
    const val = Math.max(16, Math.min(3840, Number(value) || 0));
    setResPreset("custom");
    setRatioPreset("custom");
    if (dimension === "w") {
      setCanvasWidth(val);
    } else {
      setCanvasHeight(val);
    }
    saveSettings();
  };

  // --- Image Cache Handler ---
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      if (imageCacheRef.current.has(url)) {
        resolve(imageCacheRef.current.get(url));
        return;
      }
      const img = new Image();
      if (url.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        imageCacheRef.current.set(url, img);
        resolve(img);
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid firing shortcuts when user is typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      
      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setIsPlaying(false);
          setCurrentPlaybackIndex(prev => (prev - 1 + frames.length) % Math.max(1, frames.length));
          setPlaybackT(0);
          break;
        case "ArrowRight":
          e.preventDefault();
          setIsPlaying(false);
          setCurrentPlaybackIndex(prev => (prev + 1) % Math.max(1, frames.length));
          setPlaybackT(0);
          break;
        case "Delete":
        case "Backspace":
          if (activeFrameId) {
            e.preventDefault();
            deleteFrame(activeFrameId);
          }
          break;
        case "KeyD":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (activeFrameId) duplicateFrame(activeFrameId);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [frames.length, activeFrameId]);

  // --- File Upload / Drop Handlers ---
  const processImageFiles = (files) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const newFrames = [];
    
    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) {
        setErrorMessage(`Unsupported format: ${file.name}. Only PNG, JPG, and WEBP files are allowed.`);
        return;
      }
      
      if (file.size > 15 * 1024 * 1024) { // 15MB alert
        setErrorMessage(`File ${file.name} is very large (>15MB). Performance might be slower during GIF generation.`);
      }

      const url = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      newFrames.push({
        id,
        file,
        url,
        name: file.name,
        duration: null, // inherits global delay
        settings: {
          rotate: 0,
          flipX: false,
          flipY: false,
          zoom: 1.0,
          offsetX: 0,
          offsetY: 0,
          positionStyle: "fit", // fit, fill, center
        },
        texts: [],
        stickers: []
      });
    });

    if (newFrames.length > 0) {
      setFrames(prev => {
        const updated = [...prev, ...newFrames];
        if (!activeFrameId && updated.length > 0) {
          setActiveFrameId(updated[0].id);
        }
        return updated;
      });
      setErrorMessage(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      processImageFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const files = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        processImageFiles(files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [activeFrameId]);

  // --- Demo Images Loader ---
  const loadDemoImages = () => {
    setProcessingStep("Generating Demo Animation...");
    setIsProcessing(true);
    setProcessingProgress(25);
    
    // We generate 4 premium frames programmatically on a temporary canvas
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      
      const newFrames = [];
      const colors = [
        ["#0f172a", "#1e1b4b", "#311042", "#ec4899", "Creative"],
        ["#0f172a", "#064e3b", "#022c22", "#10b981", "Fast"],
        ["#0f172a", "#1e293b", "#0f172a", "#f97316", "Browser"],
        ["#0f172a", "#1c1917", "#292524", "#eab308", "Private"]
      ];

      colors.forEach((col, idx) => {
        // Draw elegant gradient background
        const grad = ctx.createRadialGradient(300, 300, 50, 300, 300, 420);
        grad.addColorStop(0, col[1]);
        grad.addColorStop(0.5, col[2]);
        grad.addColorStop(1, col[0]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);
        
        // Draw grid overlay
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 600; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0); ctx.lineTo(i, 600);
          ctx.moveTo(0, i); ctx.lineTo(600, i);
          ctx.stroke();
        }

        // Draw animated ring in center
        ctx.strokeStyle = col[3];
        ctx.lineWidth = 6;
        ctx.beginPath();
        const angle = (idx * Math.PI) / 2;
        ctx.arc(300, 300, 100 + Math.sin(angle) * 15, 0, Math.PI * 2);
        ctx.shadowColor = col[3];
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw circular dot orbits
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const dotX = 300 + Math.cos(angle) * 100;
        const dotY = 300 + Math.sin(angle) * 100;
        ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Convert canvas image to Blob
        const dataUrl = canvas.toDataURL("image/png");
        // Fetch to blob
        newFrames.push({
          id: `demo-${idx}-${Date.now()}`,
          url: dataUrl,
          name: `Demo Frame ${idx + 1}.png`,
          duration: null,
          settings: {
            rotate: 0, flipX: false, flipY: false, zoom: 1.0, offsetX: 0, offsetY: 0, positionStyle: "fit"
          },
          texts: [
            {
              id: `text-${idx}-1`,
              text: col[4],
              font: "Impact",
              size: 48,
              color: "#ffffff",
              strokeColor: "#000000",
              strokeWidth: 3,
              shadowColor: "rgba(0,0,0,0.6)",
              shadowBlur: 8,
              shadowOffsetX: 3,
              shadowOffsetY: 3,
              x: 0.5,
              y: 0.5
            },
            {
              id: `text-${idx}-2`,
              text: "GIF MAKER",
              font: "sans-serif",
              size: 20,
              color: col[3],
              strokeColor: "transparent",
              strokeWidth: 0,
              shadowColor: "rgba(0,0,0,0.5)",
              shadowBlur: 4,
              shadowOffsetX: 1,
              shadowOffsetY: 1,
              x: 0.5,
              y: 0.75
            }
          ],
          stickers: [
            { id: `st-${idx}-1`, type: "emoji", content: "✨", color: "", x: 0.2, y: 0.2, scale: 1.5 },
            { id: `st-${idx}-2`, type: "emoji", content: "🔥", color: "", x: 0.8, y: 0.8, scale: 1.5 }
          ]
        });
      });

      setFrames(newFrames);
      setActiveFrameId(newFrames[0].id);
      setGlobalDuration(600);
      setTransitionType("fade");
      setTransitionDuration(300);
      setResPreset("custom");
      setRatioPreset("1:1");
      setCanvasWidth(500);
      setCanvasHeight(500);
      setIsProcessing(false);
      setErrorMessage(null);
    }, 800);
  };

  // --- Frame Operations ---
  const deleteFrame = (id) => {
    setFrames(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const updated = prev.filter(f => f.id !== id);
      
      // Auto-set new active frame
      if (activeFrameId === id) {
        if (updated.length > 0) {
          const nextActiveIdx = Math.min(idx, updated.length - 1);
          setActiveFrameId(updated[nextActiveIdx].id);
        } else {
          setActiveFrameId(null);
        }
      }
      return updated;
    });
  };

  const duplicateFrame = (id) => {
    const frame = frames.find(f => f.id === id);
    if (!frame) return;

    const dup = {
      ...frame,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${frame.name.split(".")[0]}-copy.${frame.name.split(".").pop() || "png"}`,
      // Shallow copy arrays of texts and stickers to prevent editing syncing
      texts: frame.texts.map(t => ({ ...t, id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` })),
      stickers: frame.stickers.map(s => ({ ...s, id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }))
    };

    setFrames(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const updated = [...prev];
      updated.splice(idx + 1, 0, dup);
      setActiveFrameId(dup.id);
      return updated;
    });
  };

  const updateFrameSettings = (frameId, settingKey, value) => {
    setFrames(prev => prev.map(f => {
      if (f.id === frameId) {
        return {
          ...f,
          settings: {
            ...f.settings,
            [settingKey]: value
          }
        };
      }
      return f;
    }));
  };

  const updateFrameDuration = (frameId, val) => {
    setFrames(prev => prev.map(f => {
      if (f.id === frameId) {
        return { ...f, duration: val };
      }
      return f;
    }));
  };

  // Drag and Drop ordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverCard = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Smoothly swap list order during drag
    setFrames(prev => {
      const updated = [...prev];
      const draggedItem = updated[draggedIndex];
      updated.splice(draggedIndex, 1);
      updated.splice(index, 0, draggedItem);
      setDraggedIndex(index); // update drag source
      return updated;
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Batch utilities
  const reverseTimeline = () => {
    setFrames(prev => [...prev].reverse());
    setCurrentPlaybackIndex(0);
    setPlaybackT(0);
  };

  const shuffleTimeline = () => {
    setFrames(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentPlaybackIndex(0);
    setPlaybackT(0);
  };

  const makePingPong = () => {
    if (frames.length < 2) return;
    setFrames(prev => {
      // Append reversed intermediate frames (excluding first and last to avoid doubles)
      const rev = [...prev].slice(1, -1).reverse().map(f => ({
        ...f,
        id: `${f.id}-pong-${Date.now()}`,
        texts: f.texts.map(t => ({ ...t, id: `text-pong-${Math.random()}` })),
        stickers: f.stickers.map(s => ({ ...s, id: `st-pong-${Math.random()}` }))
      }));
      return [...prev, ...rev];
    });
  };

  // --- Text & Sticker Overlays Logic ---
  const addTextLayer = () => {
    if (!activeFrameId) return;
    const newText = {
      id: `text-${Date.now()}`,
      text: "Double Click to Edit",
      font: "sans-serif",
      size: 32,
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.5)",
      shadowBlur: 4,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      x: 0.5,
      y: 0.5
    };
    setFrames(prev => prev.map(f => {
      if (f.id === activeFrameId) {
        return { ...f, texts: [...f.texts, newText] };
      }
      return f;
    }));
  };

  const updateTextLayer = (textId, key, val) => {
    setFrames(prev => prev.map(f => {
      if (f.id === activeFrameId) {
        return {
          ...f,
          texts: f.texts.map(t => (t.id === textId ? { ...t, [key]: val } : t))
        };
      }
      return f;
    }));
  };

  const removeTextLayer = (textId) => {
    setFrames(prev => prev.map(f => {
      if (f.id === activeFrameId) {
        return {
          ...f,
          texts: f.texts.filter(t => t.id !== textId)
        };
      }
      return f;
    }));
  };

  const addStickerLayer = (type, content) => {
    if (!activeFrameId) return;
    const newSticker = {
      id: `sticker-${Date.now()}`,
      type, // emoji, shape, icon
      content,
      color: type === "shape" ? "#f97316" : "",
      x: 0.5,
      y: 0.3,
      scale: 1.0
    };
    setFrames(prev => prev.map(f => {
      if (f.id === activeFrameId) {
        return { ...f, stickers: [...f.stickers, newSticker] };
      }
      return f;
    }));
  };

  const updateStickerLayer = (stId, key, val) => {
    setFrames(prev => prev.map(f => {
      if (f.id === activeFrameId) {
        return {
          ...f,
          stickers: f.stickers.map(s => (s.id === stId ? { ...s, [key]: val } : s))
        };
      }
      return f;
    }));
  };

  const removeStickerLayer = (stId) => {
    setFrames(prev => prev.map(f => {
      if (f.id === activeFrameId) {
        return {
          ...f,
          stickers: f.stickers.filter(s => s.id !== stId)
        };
      }
      return f;
    }));
  };

  // --- Real-time Playback Loop ---
  useEffect(() => {
    if (!isPlaying || frames.length === 0) {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      return;
    }

    const currentFrame = frames[currentPlaybackIndex];
    const duration = currentFrame.duration || globalDuration;
    const nextIdx = (currentPlaybackIndex + 1) % frames.length;

    // Is there a transition to the next frame?
    const hasTransition = transitionType !== "none" && (loopCount === 0 || nextIdx > 0 || currentPlaybackIndex < frames.length - 1);
    
    let startTimestamp = null;

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      if (hasTransition && elapsed < transitionDuration) {
        // We are in the transition phase
        const t = elapsed / transitionDuration;
        setPlaybackT(t);
        playTimerRef.current = requestAnimationFrame(animate);
      } else if (elapsed < duration) {
        // We are in the stable phase of the frame
        setPlaybackT(0);
        playTimerRef.current = requestAnimationFrame(animate);
      } else {
        // Time to step to next frame
        setPlaybackT(0);
        setCurrentPlaybackIndex(nextIdx);
      }
    };

    playTimerRef.current = requestAnimationFrame(animate);

    return () => {
      if (playTimerRef.current) {
        cancelAnimationFrame(playTimerRef.current);
        clearTimeout(playTimerRef.current);
      }
    };
  }, [isPlaying, currentPlaybackIndex, frames, globalDuration, transitionType, transitionDuration, loopCount]);

  // --- Canvas Rendering Core Logic ---
  // Shared render code for both display canvas and export canvas
  const renderFrameOnCanvas = async (ctx, width, height, frameIndex, tVal) => {
    if (frames.length === 0) return;
    
    // 1. Draw Background
    if (bgType === "transparent") {
      // Draw standard transparency checker pattern
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#cbd5e1";
      const size = 15;
      for (let y = 0; y < height; y += size * 2) {
        for (let x = 0; x < width; x += size * 2) {
          ctx.fillRect(x, y, size, size);
          ctx.fillRect(x + size, y + size, size, size);
        }
      }
    } else if (bgType === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "black") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "solid") {
      ctx.fillStyle = bgSolidColor;
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, bgGradient1);
      grad.addColorStop(1, bgGradient2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    const currentFrame = frames[frameIndex];
    const nextFrame = frames[(frameIndex + 1) % frames.length];

    // Helper: draw single frame image
    const drawImageElement = async (context, f, opacity = 1.0, translation = { x: 0, y: 0 }, customScale = 1.0, customRotate = 0) => {
      try {
        const img = await loadImage(f.url);
        context.save();
        context.globalAlpha = opacity;
        
        // Canvas Center
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Image controls
        const { rotate, flipX, flipY, zoom, offsetX, offsetY, positionStyle } = f.settings;
        
        // Translate to position
        context.translate(centerX + offsetX + translation.x, centerY + offsetY + translation.y);
        
        // Scale/Mirroring
        let scaleX = flipX ? -1 : 1;
        let scaleY = flipY ? -1 : 1;
        context.scale(scaleX, scaleY);
        
        // Rotation (User settings rotation + custom transition rotation)
        const totalRotation = ((rotate + customRotate) * Math.PI) / 180;
        context.rotate(totalRotation);

        // Aspect fitting calculations
        let drawW = img.width;
        let drawH = img.height;
        
        if (positionStyle === "fit") {
          const ratio = Math.min(width / img.width, height / img.height);
          drawW = img.width * ratio;
          drawH = img.height * ratio;
        } else if (positionStyle === "fill") {
          const ratio = Math.max(width / img.width, height / img.height);
          drawW = img.width * ratio;
          drawH = img.height * ratio;
        }

        // Apply zoom and custom transition scale
        drawW *= zoom * customScale;
        drawH *= zoom * customScale;

        // Draw image centered at the translated coordinate
        context.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        context.restore();
      } catch (err) {
        // Draw error outline if image fails
        context.fillStyle = "#ef4444";
        context.font = "16px sans-serif";
        context.textAlign = "center";
        context.fillText("Failed to load image", width / 2, height / 2);
      }
    };

    // Draw Overlays (texts, emojis, shapes)
    const drawOverlays = (context, f, opacity = 1.0) => {
      context.save();
      context.globalAlpha = opacity;

      // Text Overlays
      f.texts.forEach(t => {
        context.font = `${t.size}px ${t.font}`;
        context.fillStyle = t.color;
        context.textAlign = "center";
        context.textBaseline = "middle";

        const textX = t.x * width;
        const textY = t.y * height;

        // Shadow settings
        if (t.shadowBlur > 0) {
          context.shadowColor = t.shadowColor;
          context.shadowBlur = t.shadowBlur;
          context.shadowOffsetX = t.shadowOffsetX;
          context.shadowOffsetY = t.shadowOffsetY;
        } else {
          context.shadowColor = "transparent";
        }

        // Draw Stroke
        if (t.strokeWidth > 0 && t.strokeColor !== "transparent") {
          context.strokeStyle = t.strokeColor;
          context.lineWidth = t.strokeWidth;
          context.strokeText(t.text, textX, textY);
        }

        context.fillText(t.text, textX, textY);
      });

      // Reset shadow for stickers
      context.shadowColor = "transparent";
      context.shadowBlur = 0;

      // Stickers & Shapes
      f.stickers.forEach(s => {
        const sx = s.x * width;
        const sy = s.y * height;
        const scaleVal = s.scale;

        if (s.type === "emoji") {
          context.font = `${40 * scaleVal}px sans-serif`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(s.content, sx, sy);
        } else if (s.type === "shape") {
          context.fillStyle = s.color || "#ff0000";
          context.beginPath();
          const size = 30 * scaleVal;
          if (s.content === "rectangle") {
            context.fillRect(sx - size, sy - size / 2, size * 2, size);
          } else if (s.content === "circle") {
            context.arc(sx, sy, size, 0, Math.PI * 2);
            context.fill();
          } else if (s.content === "triangle") {
            context.moveTo(sx, sy - size);
            context.lineTo(sx - size, sy + size);
            context.lineTo(sx + size, sy + size);
            context.closePath();
            context.fill();
          } else if (s.content === "star") {
            // Draw a standard 5-point star
            for (let i = 0; i < 5; i++) {
              context.lineTo(
                Math.cos(((18 + i * 72) * Math.PI) / 180) * size + sx,
                -Math.sin(((18 + i * 72) * Math.PI) / 180) * size + sy
              );
              context.lineTo(
                Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2) + sx,
                -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2) + sy
              );
            }
            context.closePath();
            context.fill();
          }
        }
      });
      context.restore();
    };

    // 2. Perform Transition Logic
    if (tVal > 0 && nextFrame) {
      if (transitionType === "fade") {
        // Crossfade opacity
        await drawImageElement(ctx, currentFrame, 1 - tVal);
        drawOverlays(ctx, currentFrame, 1 - tVal);
        
        await drawImageElement(ctx, nextFrame, tVal);
        drawOverlays(ctx, nextFrame, tVal);
        
      } else if (transitionType === "crossfade") {
        // Overlap blend
        await drawImageElement(ctx, currentFrame, 1.0);
        drawOverlays(ctx, currentFrame, 1 - tVal);
        
        await drawImageElement(ctx, nextFrame, tVal);
        drawOverlays(ctx, nextFrame, tVal);
        
      } else if (transitionType === "slide-left") {
        // Current slides left, next enters from right
        await drawImageElement(ctx, currentFrame, 1.0, { x: -tVal * width, y: 0 });
        drawOverlays(ctx, currentFrame, 1 - tVal);
        
        await drawImageElement(ctx, nextFrame, 1.0, { x: (1 - tVal) * width, y: 0 });
        drawOverlays(ctx, nextFrame, tVal);
        
      } else if (transitionType === "slide-right") {
        // Current slides right, next enters from left
        await drawImageElement(ctx, currentFrame, 1.0, { x: tVal * width, y: 0 });
        drawOverlays(ctx, currentFrame, 1 - tVal);
        
        await drawImageElement(ctx, nextFrame, 1.0, { x: -(1 - tVal) * width, y: 0 });
        drawOverlays(ctx, nextFrame, tVal);
        
      } else if (transitionType === "zoom") {
        // Current zooms in & fades, next zooms in from small
        await drawImageElement(ctx, currentFrame, 1 - tVal, { x: 0, y: 0 }, 1 + tVal * 0.5);
        drawOverlays(ctx, currentFrame, 1 - tVal);
        
        await drawImageElement(ctx, nextFrame, tVal, { x: 0, y: 0 }, 0.5 + tVal * 0.5);
        drawOverlays(ctx, nextFrame, tVal);
        
      } else if (transitionType === "scale") {
        // Current scales down, next scales up
        await drawImageElement(ctx, currentFrame, 1 - tVal, { x: 0, y: 0 }, 1 - tVal * 0.4);
        drawOverlays(ctx, currentFrame, 1 - tVal);
        
        await drawImageElement(ctx, nextFrame, tVal, { x: 0, y: 0 }, 0.6 + tVal * 0.4);
        drawOverlays(ctx, nextFrame, tVal);
        
      } else if (transitionType === "rotate") {
        // Spinning transition
        await drawImageElement(ctx, currentFrame, 1 - tVal, { x: 0, y: 0 }, 1 - tVal * 0.5, tVal * 180);
        drawOverlays(ctx, currentFrame, 1 - tVal);
        
        await drawImageElement(ctx, nextFrame, tVal, { x: 0, y: 0 }, 0.5 + tVal * 0.5, -(1 - tVal) * 180);
        drawOverlays(ctx, nextFrame, tVal);
      }
    } else {
      // Just render current frame statically
      await drawImageElement(ctx, currentFrame, 1.0);
      drawOverlays(ctx, currentFrame, 1.0);
    }
  };

  // Re-render preview canvas whenever frame state changes
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || frames.length === 0) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame
    renderFrameOnCanvas(ctx, canvasWidth, canvasHeight, currentPlaybackIndex, playbackT);
  }, [frames, currentPlaybackIndex, playbackT, canvasWidth, canvasHeight, bgType, bgSolidColor, bgGradient1, bgGradient2]);

  // Handle auto-pausing when active index is forced, or ensuring bounds
  useEffect(() => {
    if (frames.length > 0 && currentPlaybackIndex >= frames.length) {
      setCurrentPlaybackIndex(0);
      setPlaybackT(0);
    }
  }, [frames.length, currentPlaybackIndex]);

  // Sync active frame with preview when player is paused
  useEffect(() => {
    if (!isPlaying && activeFrameId) {
      const idx = frames.findIndex(f => f.id === activeFrameId);
      if (idx !== -1) {
        setCurrentPlaybackIndex(idx);
        setPlaybackT(0);
      }
    }
  }, [activeFrameId, isPlaying]);

  // --- Export Renderer ---
  const handleExport = async () => {
    if (frames.length === 0) {
      setErrorMessage("Please upload images or try demo images first.");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(5);
    setErrorMessage(null);

    const outW = canvasWidth;
    const outH = canvasHeight;

    const canvas = hiddenCanvasRef.current;
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");

    // Quality mapping for quantization colors
    let maxColors = 256;
    if (quality === "fast") maxColors = 64;
    else if (quality === "balanced") maxColors = 128;

    try {
      if (exportFormat === "gif") {
        setProcessingStep("Preparing Frames...");
        setProcessingProgress(15);

        // Define compile frame array
        const compileFrames = [];

        // Compile logic: construct all frames (including interpolations for transitions)
        for (let i = 0; i < frames.length; i++) {
          const f = frames[i];
          const delay = f.duration || globalDuration;
          const nextIdx = (i + 1) % frames.length;
          
          // Decide if transition applies
          const hasTransition = transitionType !== "none" && (loopCount === 0 || nextIdx > 0 || i < frames.length - 1);
          
          if (hasTransition) {
            // Render stable part (Delay minus transition duration)
            const stableDelay = Math.max(50, delay - transitionDuration);
            compileFrames.push({ frameIdx: i, t: 0, delay: stableDelay });

            // Render interpolation parts
            const steps = 8; // number of intermediate frames
            const stepDelay = transitionDuration / steps;
            for (let s = 1; s <= steps; s++) {
              compileFrames.push({ frameIdx: i, t: s / steps, delay: stepDelay });
            }
          } else {
            // Render basic frame
            compileFrames.push({ frameIdx: i, t: 0, delay });
          }
        }

        // Initialize LZW encoder
        const encoder = new GIFEncoder({ initialCapacity: outW * outH * compileFrames.length });

        // Write frames sequentially
        for (let idx = 0; idx < compileFrames.length; idx++) {
          const step = compileFrames[idx];
          setProcessingStep(`Rendering Frame ${idx + 1} of ${compileFrames.length}...`);
          setProcessingProgress(15 + Math.round((idx / compileFrames.length) * 65));

          // Draw to offline canvas
          await renderFrameOnCanvas(ctx, outW, outH, step.frameIdx, step.t);

          // Extract pixels
          const imgData = ctx.getImageData(0, 0, outW, outH);
          const pixels = imgData.data; // RGBA Uint8Array

          // Quantize and map
          const palette = quantize(pixels, maxColors, {
            format: "rgb565",
            clearAlpha: true,
            clearAlphaColor: 0,
            oneBitAlpha: true
          });
          const index = applyPalette(pixels, palette, "rgb565");

          // Encode
          encoder.writeFrame(index, outW, outH, {
            palette,
            delay: step.delay,
            repeat: loopCount,
            dispose: optimizeFrames ? 1 : 2 // 1 = leave state, 2 = clear to bg
          });
        }

        setProcessingStep("Optimizing & Packaging GIF...");
        setProcessingProgress(90);
        encoder.finish();
        
        const bytes = encoder.bytes();
        const blob = new Blob([bytes], { type: "image/gif" });
        
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportFilename || "my-animation"}.gif`;
        a.click();
        
        setProcessingProgress(100);
        setProcessingStep("Export Complete!");
        setTimeout(() => setIsProcessing(false), 800);
        
      } else {
        // Video export format (WEBP / MP4 using MediaRecorder)
        setProcessingStep("Preparing Video Renderer...");
        setProcessingProgress(15);

        // We will run a synthetic playback loop on the canvas and record the frames
        const stream = canvas.captureStream(25); // 25 fps
        const mimeType = exportFormat === "mp4" ? "video/mp4;codecs=h264" : "video/webm";
        
        let recorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType });
        } catch (e) {
          // Fallback to default WebM if mp4 h264 codec is not natively supported
          recorder = new MediaRecorder(stream);
        }

        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          setProcessingStep("Saving Video File...");
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${exportFilename || "my-animation"}.${exportFormat}`;
          a.click();

          setProcessingProgress(100);
          setProcessingStep("Export Complete!");
          setTimeout(() => setIsProcessing(false), 800);
        };

        // Start recording
        recorder.start();

        // Calculate total time
        let totalDuration = 0;
        const videoFrames = [];

        // Build list of all drawing events with timestamp triggers
        for (let i = 0; i < frames.length; i++) {
          const f = frames[i];
          const delay = f.duration || globalDuration;
          const nextIdx = (i + 1) % frames.length;
          
          const hasTransition = transitionType !== "none" && (loopCount === 0 || nextIdx > 0 || i < frames.length - 1);
          
          if (hasTransition) {
            const stableDelay = Math.max(50, delay - transitionDuration);
            videoFrames.push({ frameIdx: i, t: 0, duration: stableDelay });
            totalDuration += stableDelay;

            const steps = 10;
            const stepDelay = transitionDuration / steps;
            for (let s = 1; s <= steps; s++) {
              videoFrames.push({ frameIdx: i, t: s / steps, duration: stepDelay });
              totalDuration += stepDelay;
            }
          } else {
            videoFrames.push({ frameIdx: i, t: 0, duration: delay });
            totalDuration += delay;
          }
        }

        // Run sequential frames with setTimeout triggers
        let currentVideoFrameIdx = 0;
        
        const renderNextVideoFrame = async () => {
          if (currentVideoFrameIdx >= videoFrames.length) {
            recorder.stop();
            return;
          }

          const step = videoFrames[currentVideoFrameIdx];
          setProcessingStep(`Recording Video... ${Math.round((currentVideoFrameIdx / videoFrames.length) * 100)}%`);
          setProcessingProgress(20 + Math.round((currentVideoFrameIdx / videoFrames.length) * 70));

          await renderFrameOnCanvas(ctx, outW, outH, step.frameIdx, step.t);
          
          currentVideoFrameIdx++;
          setTimeout(renderNextVideoFrame, step.duration);
        };

        renderNextVideoFrame();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error occurred during export rendering: " + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HERO HEADER --- */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mt-3 mb-4">GIF Maker from Images</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Turn multiple images into beautiful animated GIFs instantly. Fast, private and completely browser-based.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 hover:shadow-md transition flex items-center gap-2 transform active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Upload Images
            </button>
            <button
              onClick={loadDemoImages}
              className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2 active:scale-95"
            >
              <svg className="w-5 h-5 text-orange-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Try Demo Images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* --- ERROR MESSAGE --- */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* --- MAIN DASHBOARD INTERFACE --- */}
        {frames.length === 0 ? (
          /* Empty Upload Dropzone */
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className="border-3 border-dashed border-slate-300 hover:border-orange-400 bg-white rounded-3xl p-16 text-center cursor-pointer transition shadow-sm hover:shadow-md group"
          >
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-102 transition">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Drag & Drop Images here</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-4">
              Supports PNG, JPG, JPEG, WEBP. You can also multi-select upload files or paste images directly using Ctrl + V.
            </p>
            <span className="text-sm font-semibold text-orange-600 group-hover:underline">or click to browse local files</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT PANEL: CONTROLS & SETTINGS (4 Cols) --- */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[85vh]">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                {["canvas", "frames", "layers", "export"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 capitalize transition ${
                      activeTab === tab
                        ? "border-orange-500 text-orange-600 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {tab === "canvas" ? "Canvas" : tab === "frames" ? "Frame Settings" : tab === "layers" ? "Overlays" : "Export"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* 1. CANVAS SETTINGS TAB */}
                {activeTab === "canvas" && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                      Canvas Dimensions
                    </h3>

                    {/* Resolution Presets */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Preset Size</label>
                      <select
                        value={resPreset}
                        onChange={(e) => handleResolutionPresetChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {Object.entries(RESOLUTIONS).map(([key, item]) => (
                          <option key={key} value={key}>{item.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Aspect Ratio Presets */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ASPECT_RATIOS.map((item) => (
                          <button
                            key={item.value}
                            onClick={() => handleRatioChange(item.value)}
                            className={`p-2.5 text-xs font-semibold rounded-xl border transition ${
                              ratioPreset === item.value
                                ? "bg-orange-50 border-orange-500 text-orange-700"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Width/Height Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Width (px)</label>
                        <input
                          type="number"
                          value={canvasWidth}
                          onChange={(e) => handleDimensionChange("w", e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Height (px)</label>
                        <input
                          type="number"
                          value={canvasHeight}
                          onChange={(e) => handleDimensionChange("h", e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-bold text-slate-900 text-sm mb-3">Canvas Background</h4>
                      
                      {/* BG Types */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {["transparent", "white", "black", "solid", "gradient"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setBgType(type)}
                            className={`p-2 text-xs font-semibold rounded-lg border capitalize transition ${
                              bgType === type
                                ? "bg-orange-50 border-orange-500 text-orange-700"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      {/* Solid Picker */}
                      {bgType === "solid" && (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={bgSolidColor}
                            onChange={(e) => setBgSolidColor(e.target.value)}
                            className="w-10 h-10 border-0 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={bgSolidColor}
                            onChange={(e) => setBgSolidColor(e.target.value)}
                            className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                          />
                        </div>
                      )}

                      {/* Gradient Pickers */}
                      {bgType === "gradient" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-16">Color 1:</span>
                            <input
                              type="color"
                              value={bgGradient1}
                              onChange={(e) => setBgGradient1(e.target.value)}
                              className="w-10 h-10 border-0 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bgGradient1}
                              onChange={(e) => setBgGradient1(e.target.value)}
                              className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-16">Color 2:</span>
                            <input
                              type="color"
                              value={bgGradient2}
                              onChange={(e) => setBgGradient2(e.target.value)}
                              className="w-10 h-10 border-0 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bgGradient2}
                              onChange={(e) => setBgGradient2(e.target.value)}
                              className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. FRAMES & TIMELINE SETTINGS TAB */}
                {activeTab === "frames" && (
                  <div className="space-y-5">
                    
                    {/* Global Duration */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-sm font-bold text-slate-800">Global Frame Delay</label>
                        <span className="text-sm font-bold text-orange-600">{globalDuration} ms</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="2000"
                        step="50"
                        value={globalDuration}
                        onChange={(e) => {
                          setGlobalDuration(Number(e.target.value));
                          saveSettings();
                        }}
                        className="w-full accent-orange-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>50ms (Fast)</span>
                        <span>2s (Slow)</span>
                      </div>
                    </div>

                    {/* Transitions Panel */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-bold text-slate-900 text-sm mb-3">Transitions Settings</h4>
                      
                      <div className="mb-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Transition Effect</label>
                        <select
                          value={transitionType}
                          onChange={(e) => {
                            setTransitionType(e.target.value);
                            saveSettings();
                          }}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          {TRANSITIONS.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      {transitionType !== "none" && (
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Transition Duration</label>
                            <span className="text-sm font-bold text-orange-600">{transitionDuration} ms</span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="1000"
                            step="50"
                            value={transitionDuration}
                            onChange={(e) => {
                              setTransitionDuration(Number(e.target.value));
                              saveSettings();
                            }}
                            className="w-full accent-orange-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Active Frame Specific Controls */}
                    {activeFrame ? (
                      <div className="border-t border-slate-100 pt-4 space-y-4">
                        <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Edit Selected Frame
                        </h4>

                        {/* Individual Duration Override */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Custom Frame Delay</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Default delay"
                              value={activeFrame.duration || ""}
                              onChange={(e) => updateFrameDuration(activeFrame.id, e.target.value ? Number(e.target.value) : null)}
                              className="flex-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="p-2.5 text-sm font-semibold text-slate-500">ms</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Leave empty to inherit global delay ({globalDuration}ms).</p>
                        </div>

                        {/* Image Fitting Position */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Position & Scale</label>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {["fit", "fill", "center"].map((pos) => (
                              <button
                                key={pos}
                                onClick={() => updateFrameSettings(activeFrame.id, "positionStyle", pos)}
                                className={`py-1.5 text-xs font-semibold rounded-lg border capitalize transition ${
                                  activeFrame.settings.positionStyle === pos
                                    ? "bg-orange-50 border-orange-500 text-orange-700"
                                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                }`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Flip & Rotate Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => updateFrameSettings(activeFrame.id, "rotate", (activeFrame.settings.rotate + 90) % 360)}
                            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1 transition"
                          >
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" /></svg>
                            Rotate 90°
                          </button>
                          <button
                            onClick={() => updateFrameSettings(activeFrame.id, "flipX", !activeFrame.settings.flipX)}
                            className={`p-2 border rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition ${
                              activeFrame.settings.flipX ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            Flip Horiz
                          </button>
                          <button
                            onClick={() => updateFrameSettings(activeFrame.id, "flipY", !activeFrame.settings.flipY)}
                            className={`p-2 border rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition ${
                              activeFrame.settings.flipY ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 12V8m0 0l-4 4m4-4l4 4" /></svg>
                            Flip Vert
                          </button>
                        </div>

                        {/* Custom Zoom Slider */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Zoom</label>
                            <span className="text-xs font-bold text-slate-600">{(activeFrame.settings.zoom * 100).toFixed(0)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="3.0"
                            step="0.1"
                            value={activeFrame.settings.zoom}
                            onChange={(e) => updateFrameSettings(activeFrame.id, "zoom", Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        {/* Offsets inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Offset X (px)</label>
                            <input
                              type="number"
                              value={activeFrame.settings.offsetX}
                              onChange={(e) => updateFrameSettings(activeFrame.id, "offsetX", Number(e.target.value))}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Offset Y (px)</label>
                            <input
                              type="number"
                              value={activeFrame.settings.offsetY}
                              onChange={(e) => updateFrameSettings(activeFrame.id, "offsetY", Number(e.target.value))}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                            />
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                        <p className="text-slate-500 text-xs">Select a frame from the timeline to access advanced individual controls.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. OVERLAYS TAB (TEXT & STICKERS) */}
                {activeTab === "layers" && (
                  <div className="space-y-6">
                    {activeFrame ? (
                      <div className="space-y-6">
                        
                        {/* Text Overlay Section */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-900 text-sm">Text Layers</h4>
                            <button
                              onClick={addTextLayer}
                              className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-orange-600 transition flex items-center gap-1"
                            >
                              + Add Text
                            </button>
                          </div>

                          {activeFrame.texts.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No text overlays added yet.</p>
                          ) : (
                            <div className="space-y-4">
                              {activeFrame.texts.map((t, idx) => (
                                <div key={t.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-2 relative">
                                  {/* Close/Remove Button */}
                                  <button
                                    onClick={() => removeTextLayer(t.id)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>

                                  <div className="text-xs font-bold text-slate-500 mb-1">Text #{idx + 1}</div>

                                  {/* Text Input */}
                                  <input
                                    type="text"
                                    value={t.text}
                                    onChange={(e) => updateTextLayer(t.id, "text", e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                                  />

                                  {/* Font Style Selection */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <select
                                      value={t.font}
                                      onChange={(e) => updateTextLayer(t.id, "font", e.target.value)}
                                      className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                      {FONTS.map(f => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                      ))}
                                    </select>
                                    
                                    <input
                                      type="number"
                                      value={t.size}
                                      onChange={(e) => updateTextLayer(t.id, "size", Number(e.target.value))}
                                      className="p-2 border border-slate-200 rounded-lg text-xs bg-white text-center"
                                      placeholder="Size"
                                    />
                                  </div>

                                  {/* Colors & Stroke */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-500">Fill:</span>
                                      <input
                                        type="color"
                                        value={t.color}
                                        onChange={(e) => updateTextLayer(t.id, "color", e.target.value)}
                                        className="w-6 h-6 p-0 border-0 cursor-pointer rounded"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-500">Stroke:</span>
                                      <input
                                        type="color"
                                        value={t.strokeColor === "transparent" ? "#000000" : t.strokeColor}
                                        onChange={(e) => updateTextLayer(t.id, "strokeColor", e.target.value)}
                                        className="w-6 h-6 p-0 border-0 cursor-pointer rounded"
                                      />
                                    </div>
                                    <div className="flex-1 flex items-center gap-1">
                                      <span className="text-[10px] text-slate-500">Width:</span>
                                      <input
                                        type="number"
                                        value={t.strokeWidth}
                                        onChange={(e) => updateTextLayer(t.id, "strokeWidth", Number(e.target.value))}
                                        className="w-10 p-1 border rounded text-xs text-center"
                                      />
                                    </div>
                                  </div>

                                  {/* Alignment/Position Slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                      <span>Vertical Position:</span>
                                      <span>{Math.round(t.y * 100)}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0.05"
                                      max="0.95"
                                      step="0.05"
                                      value={t.y}
                                      onChange={(e) => updateTextLayer(t.id, "y", Number(e.target.value))}
                                      className="w-full accent-orange-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                      <span>Horizontal Position:</span>
                                      <span>{Math.round(t.x * 100)}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0.05"
                                      max="0.95"
                                      step="0.05"
                                      value={t.x}
                                      onChange={(e) => updateTextLayer(t.id, "x", Number(e.target.value))}
                                      className="w-full accent-orange-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Stickers / Emojis / Shapes Overlay */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="font-bold text-slate-900 text-sm mb-3">Stickers & Shapes</h4>
                          
                          {/* Add Emoji Section */}
                          <div className="mb-4">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Emojis</label>
                            <div className="grid grid-cols-8 gap-2 p-2 border border-slate-100 rounded-xl bg-slate-50 max-h-[85px] overflow-y-auto">
                              {EMOJIS.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => addStickerLayer("emoji", emoji)}
                                  className="text-lg hover:scale-125 transition active:scale-95"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Add Shapes Section */}
                          <div className="mb-4">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Shapes</label>
                            <div className="grid grid-cols-2 gap-2">
                              {SHAPES.map(shape => (
                                <button
                                  key={shape.value}
                                  onClick={() => addStickerLayer("shape", shape.value)}
                                  className="p-2 border border-slate-200 hover:border-orange-500 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition"
                                >
                                  {shape.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Render Added Stickers */}
                          {activeFrame.stickers.length > 0 && (
                            <div className="space-y-4 mt-3">
                              <div className="text-xs font-bold text-slate-800">Layers List</div>
                              {activeFrame.stickers.map((s, idx) => (
                                <div key={s.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl space-y-2 relative">
                                  {/* Close/Remove Button */}
                                  <button
                                    onClick={() => removeStickerLayer(s.id)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>

                                  <div className="text-xs font-bold text-slate-500">
                                    {s.type === "emoji" ? `Emoji (${s.content})` : `Shape (${s.content})`} #{idx + 1}
                                  </div>

                                  {/* Scale slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                      <span>Size Scale:</span>
                                      <span>{s.scale.toFixed(1)}x</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0.2"
                                      max="3.0"
                                      step="0.1"
                                      value={s.scale}
                                      onChange={(e) => updateStickerLayer(s.id, "scale", Number(e.target.value))}
                                      className="w-full accent-orange-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                  </div>

                                  {/* X & Y position */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-slate-500">Pos X:</span>
                                      <input
                                        type="range"
                                        min="0.05"
                                        max="0.95"
                                        step="0.05"
                                        value={s.x}
                                        onChange={(e) => updateStickerLayer(s.id, "x", Number(e.target.value))}
                                        className="w-full accent-orange-500 h-1 bg-slate-200 rounded-lg appearance-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-slate-500">Pos Y:</span>
                                      <input
                                        type="range"
                                        min="0.05"
                                        max="0.95"
                                        step="0.05"
                                        value={s.y}
                                        onChange={(e) => updateStickerLayer(s.id, "y", Number(e.target.value))}
                                        className="w-full accent-orange-500 h-1 bg-slate-200 rounded-lg appearance-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Shape color picker */}
                                  {s.type === "shape" && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-500">Shape Color:</span>
                                      <input
                                        type="color"
                                        value={s.color || "#ff0000"}
                                        onChange={(e) => updateStickerLayer(s.id, "color", e.target.value)}
                                        className="w-6 h-6 border-0 rounded"
                                      />
                                    </div>
                                  )}

                                </div>
                              ))}
                            </div>
                          )}

                        </div>

                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                        <p className="text-slate-500 text-xs">Select a frame from the timeline to add text layers, emojis, and shapes on top of it.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. EXPORT TAB */}
                {activeTab === "export" && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Compile & Download
                    </h3>

                    {/* Export Format Select */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Output Format</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["gif", "webp", "mp4"].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => {
                              setExportFormat(fmt);
                              saveSettings();
                            }}
                            className={`p-2.5 text-xs font-semibold rounded-xl border capitalize transition ${
                              exportFormat === fmt
                                ? "bg-orange-50 border-orange-500 text-orange-700"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {fmt === "gif" ? "GIF" : fmt === "webp" ? "Animated WebP" : "MP4 Video"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom File Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">File Name</label>
                      <input
                        type="text"
                        value={exportFilename}
                        onChange={(e) => {
                          setExportFilename(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""));
                          saveSettings();
                        }}
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="my-animation"
                      />
                    </div>

                    {/* GIF Quality Settings */}
                    {exportFormat === "gif" && (
                      <div className="border-t border-slate-100 pt-4 space-y-4">
                        <h4 className="font-bold text-slate-900 text-sm">Quality Settings</h4>
                        
                        <div className="grid grid-cols-4 gap-1">
                          {["fast", "balanced", "high", "ultra"].map((q) => (
                            <button
                              key={q}
                              onClick={() => {
                                setQuality(q);
                                saveSettings();
                              }}
                              className={`py-1.5 text-[10px] font-bold rounded-lg border capitalize transition ${
                                quality === q
                                  ? "bg-orange-50 border-orange-500 text-orange-700"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>

                        {/* Optimization Checks */}
                        <div className="space-y-3 pt-2">
                          <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={reduceColors}
                              onChange={(e) => setReduceColors(e.target.checked)}
                              className="accent-orange-500 w-4 h-4 rounded"
                            />
                            <span>Reduce Colors (Smaller file size)</span>
                          </label>

                          <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={optimizeFrames}
                              onChange={(e) => setOptimizeFrames(e.target.checked)}
                              className="accent-orange-500 w-4 h-4 rounded"
                            />
                            <span>Optimize frame transparency</span>
                          </label>

                          <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={compressGif}
                              onChange={(e) => setCompressGif(e.target.checked)}
                              className="accent-orange-500 w-4 h-4 rounded"
                            />
                            <span>Compress GIF (LZW optimization)</span>
                          </label>

                          <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={smoothAnimation}
                              onChange={(e) => setSmoothAnimation(e.target.checked)}
                              className="accent-orange-500 w-4 h-4 rounded"
                            />
                            <span>Smooth Animation scaling</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Export Action Trigger */}
                    <div className="border-t border-slate-100 pt-4">
                      <button
                        onClick={handleExport}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 transform active:scale-98 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" /></svg>
                        Export & Download
                      </button>
                    </div>

                  </div>
                )}

              </div>
              
              {/* --- BOTTOM STATS PANEL --- */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="space-y-1">
                  <div>Frames: <span className="text-slate-900 font-bold">{frames.length}</span></div>
                  <div>Length: <span className="text-slate-900 font-bold">{((frames.length * globalDuration) / 1000).toFixed(1)}s</span></div>
                </div>
                <div className="space-y-1">
                  <div>Resolution: <span className="text-slate-900 font-bold">{canvasWidth}×{canvasHeight}</span></div>
                  <div>Est. Size: <span className="text-slate-900 font-bold">{estimatedSize}</span></div>
                </div>
              </div>

            </div>

            {/* --- RIGHT PANEL: CANVAS PREVIEW & TIMELINE (8 Cols) --- */}
            <div className="lg:col-span-8 space-y-6 flex flex-col">
              
              {/* 1. Preview canvas wrapper */}
              <div
                ref={previewContainerRef}
                className={`relative flex items-center justify-center bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-inner group overflow-hidden ${
                  isFullscreen ? "fixed inset-0 z-50 p-10 bg-slate-950" : "h-[450px]"
                }`}
              >
                {/* Responsive preview canvas */}
                <canvas
                  ref={previewCanvasRef}
                  width={canvasWidth}
                  height={canvasHeight}
                  className="max-h-full max-w-full object-contain shadow-2xl border border-slate-800/50 bg-slate-900 rounded-lg"
                />

                {/* Hidden canvas for exporting offline */}
                <canvas ref={hiddenCanvasRef} className="hidden" />

                {/* Fullscreen indicator overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700/50 transition backdrop-blur-sm"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
                    )}
                  </button>
                </div>

                {/* Progress bar inside preview */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
                  <div
                    className="h-full bg-orange-500 transition-all duration-100"
                    style={{
                      width: `${((currentPlaybackIndex + playbackT) / frames.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* 2. Playback Controllers */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm gap-4">
                
                {/* Play/Pause Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPlaybackIndex(0);
                      setPlaybackT(0);
                    }}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                    title="Restart"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPlaybackIndex(prev => (prev - 1 + frames.length) % frames.length);
                      setPlaybackT(0);
                      setIsPlaying(false);
                    }}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                    title="Prev Frame"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition transform active:scale-95 shadow ${
                      isPlaying ? "bg-slate-700 hover:bg-slate-800" : "bg-orange-500 hover:bg-orange-600"
                    }`}
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPlaybackIndex(prev => (prev + 1) % frames.length);
                      setPlaybackT(0);
                      setIsPlaying(false);
                    }}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                    title="Next Frame"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>

                {/* Frame counter & status */}
                <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border">
                  <span>Frame</span>
                  <span className="text-orange-600">{currentPlaybackIndex + 1}</span>
                  <span className="text-slate-400">/</span>
                  <span>{frames.length}</span>
                </div>

                {/* Speed indicator & Playback Timeline scrubbing bar */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Scrub</span>
                  <input
                    type="range"
                    min="0"
                    max={frames.length - 1}
                    value={currentPlaybackIndex}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentPlaybackIndex(Number(e.target.value));
                      setPlaybackT(0);
                    }}
                    className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* 3. Draggable Timeline Area */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                
                {/* Timeline Header controls */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Animation Timeline
                  </h3>
                  
                  {/* Timeline global operations */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      + Add Frames
                    </button>
                    <button
                      onClick={reverseTimeline}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition"
                      title="Reverse frames order"
                    >
                      Reverse
                    </button>
                    <button
                      onClick={shuffleTimeline}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition"
                      title="Shuffle frames order randomly"
                    >
                      Shuffle
                    </button>
                    <button
                      onClick={makePingPong}
                      className="px-3 py-1.5 border border-orange-200 hover:bg-orange-50 text-orange-700 rounded-xl text-xs font-bold transition"
                      title="Loop back-and-forth"
                    >
                      Ping-Pong Loop
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all frames?")) {
                          setFrames([]);
                          setActiveFrameId(null);
                        }
                      }}
                      className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Timeline Grid (Overflow scrollable) */}
                <div className="flex gap-4 overflow-x-auto py-2 min-h-[140px] scrollbar-thin select-none">
                  {frames.map((f, index) => {
                    const isActive = f.id === activeFrameId;
                    const isSelected = selectedFrameIds.has(f.id);
                    const isCurrentPlaying = index === currentPlaybackIndex;

                    return (
                      <div
                        key={f.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOverCard(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          setActiveFrameId(f.id);
                          if (!isPlaying) {
                            setCurrentPlaybackIndex(index);
                            setPlaybackT(0);
                          }
                        }}
                        className={`flex-shrink-0 w-24 relative bg-slate-50 rounded-xl border-2 p-1 text-center cursor-pointer transition flex flex-col group ${
                          isActive
                            ? "border-orange-500 bg-orange-50/20"
                            : isCurrentPlaying && isPlaying
                            ? "border-slate-800 shadow"
                            : "border-slate-200 hover:border-slate-400 bg-white"
                        }`}
                      >
                        {/* Frame Number Badge */}
                        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black z-10 ${
                          isActive ? "bg-orange-500 text-white" : "bg-slate-700 text-white"
                        }`}>
                          #{index + 1}
                        </div>

                        {/* Drag Handle Indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 cursor-grab active:cursor-grabbing transition">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 11.001 3.999A2 2 0 017 2zm0 6a2 2 0 11.001 3.999A2 2 0 017 8zm0 6a2 2 0 11.001 3.999A2 2 0 017 14zm6-12a2 2 0 11.001 3.999A2 2 0 0113 2zm0 6a2 2 0 11.001 3.999A2 2 0 0113 8zm0 6a2 2 0 11.001 3.999A2 2 0 0113 14z" /></svg>
                        </div>

                        {/* Thumbnail Image Container */}
                        <div className="w-full h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative mb-1.5">
                          <img
                            src={f.url}
                            alt={`frame-${index}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Frame specific info */}
                        <div className="text-[9px] font-bold text-slate-500 truncate w-full mb-1">
                          {f.duration ? `${f.duration}ms` : `Inherit`}
                        </div>

                        {/* Individual Controls Overlay */}
                        <div className="flex justify-between gap-1 mt-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateFrame(f.id);
                            }}
                            className="flex-1 py-1 hover:bg-orange-100 rounded text-slate-500 hover:text-orange-700 transition"
                            title="Duplicate Frame"
                          >
                            <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFrame(f.id);
                            }}
                            className="flex-1 py-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition"
                            title="Delete Frame"
                          >
                            <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* --- EXPORT/PROCESSING POPUP SPINNER MODAL --- */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-slate-100 space-y-6">
            
            {/* Spinning ring animation */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-slate-700">
                {processingProgress}%
              </div>
            </div>

            {/* Processing details */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">Generating Files</h3>
              <p className="text-sm font-semibold text-slate-500 animate-pulse">{processingStep}</p>
            </div>

            {/* Custom linear progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Do not close this browser tab</p>
          </div>
        </div>
      )}

    </div>
  );
}
