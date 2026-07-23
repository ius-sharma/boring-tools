"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit
const MAX_UPLOAD_SIZE_LABEL = "100 MB";
const FFMPEG_CORE_VERSION = "0.12.10";
const FFMPEG_CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

const FORMAT_OPTIONS = [
  { value: "mp3", label: "MP3 (Compressed)" },
  { value: "wav", label: "WAV (Lossless PCM)" },
  { value: "m4a", label: "M4A (AAC Audio)" },
  { value: "aac", label: "AAC (Raw Audio)" },
  { value: "flac", label: "FLAC (Lossless Compress)" },
  { value: "ogg", label: "OGG (Vorbis)" },
  { value: "webm", label: "WEBM (Opus)" },
];

const BITRATE_OPTIONS = [
  { value: "128", label: "128 kbps (Standard)" },
  { value: "192", label: "192 kbps (Medium)" },
  { value: "256", label: "256 kbps (High Quality)" },
  { value: "320", label: "320 kbps (Ultra Quality)" },
];

// Helper to format bytes to human readable sizes
function formatBytes(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// Format time in mm:ss.SS
function formatTime(time) {
  if (isNaN(time) || time === null) return "00:00.00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

// Tab configuration with SVG icons
const TABS_CONFIG = [
  {
    id: "split",
    label: "Split Audio",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
  {
    id: "insights",
    label: "Smart Insights",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096c-.328-2.05-.328-4.132 0-6.181l.813-5.096m0 16.273a2.917 2.917 0 100-5.833 2.917 2.917 0 000 5.833z" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AudioWaveformTrimmer() {
  // Loading & Error States
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [loadingStep, setLoadingStep] = useState(""); // "reading", "generating", "transcoding", ""
  
  // Audio Buffer & Analysis States
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [sampleRate, setSampleRate] = useState(0);
  const [channels, setChannels] = useState(1);
  const [peakCache, setPeakCache] = useState([]); // Array of {min, max} pre-computed peaks
  const [silences, setSilences] = useState([]); // List of silences
  
  // Trimming State
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Playback Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loopPreview, setLoopPreview] = useState(false);
  
  // Display & Zoom States
  const [zoom, setZoom] = useState(30); // pixels per second
  const [activeTab, setActiveTab] = useState("split"); // "split", "insights", "history"
  
  // Settings & Export Preferences
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("192");
  const [fadeInDuration, setFadeInDuration] = useState(0); // in seconds
  const [fadeOutDuration, setFadeOutDuration] = useState(0); // in seconds
  const [normalize, setNormalize] = useState(false);
  const [customFilename, setCustomFilename] = useState("");
  const [recentFiles, setRecentFiles] = useState([]);
  
  // Splitting state
  const [splitMode, setSplitMode] = useState("equal"); // "equal" or "seconds"
  const [splitPartsCount, setSplitPartsCount] = useState(2);
  const [splitSecondsInterval, setSplitSecondsInterval] = useState(10);
  const [splitFiles, setSplitFiles] = useState([]); // array of { start, end, filename, index }
  
  // Web Audio Context refs
  const audioCtxRef = useRef(null);
  const playSourceRef = useRef(null);
  const playGainNodeRef = useRef(null);
  const playStartTimeRef = useRef(null);
  const playOffsetRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // UI & Waveform Canvas refs
  const canvasRef = useRef(null);
  const waveformScrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const draggingRef = useRef(null); // "left" or "right"
  
  // FFmpeg refs
  const ffmpegRef = useRef(null);
  const ffmpegLoadPromiseRef = useRef(null);

  // Initialize Audio Context on Client
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Load configuration from Local Storage
  useEffect(() => {
    try {
      const savedFormat = localStorage.getItem("awt_outputFormat");
      const savedBitrate = localStorage.getItem("awt_bitrate");
      const savedFadeIn = localStorage.getItem("awt_fadeIn");
      const savedFadeOut = localStorage.getItem("awt_fadeOut");
      const savedNormalize = localStorage.getItem("awt_normalize");
      const savedLoop = localStorage.getItem("awt_loopPreview");
      const savedHistory = localStorage.getItem("awt_recentFiles");

      if (savedFormat) setOutputFormat(savedFormat);
      if (savedBitrate) setBitrate(savedBitrate);
      if (savedFadeIn) setFadeInDuration(parseFloat(savedFadeIn));
      if (savedFadeOut) setFadeOutDuration(parseFloat(savedFadeOut));
      if (savedNormalize) setNormalize(savedNormalize === "true");
      if (savedLoop) setLoopPreview(savedLoop === "true");
      if (savedHistory) setRecentFiles(JSON.parse(savedHistory));
    } catch (e) {
      console.warn("Could not load settings from localStorage", e);
    }
  }, []);

  // Save Settings to Local Storage when modified
  const savePreference = (key, val) => {
    try {
      localStorage.setItem(key, String(val));
    } catch (e) {}
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      ffmpegRef.current?.terminate?.();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Pre-calculate 4000 peak points for fast drawing
  const buildPeakCache = (buffer) => {
    const numBins = 4000;
    const channelData = buffer.getChannelData(0); // peak analysis from channel 0
    const totalSamples = buffer.length;
    const binSize = Math.ceil(totalSamples / numBins);
    const peaks = [];

    for (let i = 0; i < numBins; i++) {
      const start = i * binSize;
      const end = Math.min(start + binSize, totalSamples);
      let maxVal = -1.0;
      let minVal = 1.0;

      // Scan step of 2 to double speed
      for (let j = start; j < end; j += 2) {
        const val = channelData[j];
        if (val > maxVal) maxVal = val;
        if (val < minVal) minVal = val;
      }
      peaks.push({
        min: minVal === 1.0 ? 0 : minVal,
        max: maxVal === -1.0 ? 0 : maxVal,
      });
    }
    setPeakCache(peaks);
  };

  // Scan Audio for Silence sections (<-45dB, >1.5 seconds)
  const detectSilences = (buffer) => {
    const channelData = buffer.getChannelData(0);
    const sRate = buffer.sampleRate;
    const len = buffer.length;
    const blockDuration = 0.1; // 100ms blocks
    const blockSize = Math.floor(sRate * blockDuration);
    const thresholdDB = -45;
    const thresholdAmp = Math.pow(10, thresholdDB / 20); // ~0.0056

    const silList = [];
    let isSilent = false;
    let silenceStart = 0;

    for (let i = 0; i < len; i += blockSize) {
      let sum = 0;
      let count = 0;
      for (let j = i; j < i + blockSize && j < len; j += 4) {
        sum += channelData[j] * channelData[j];
        count++;
      }
      const rms = Math.sqrt(sum / count);

      if (rms < thresholdAmp) {
        if (!isSilent) {
          isSilent = true;
          silenceStart = i / sRate;
        }
      } else {
        if (isSilent) {
          isSilent = false;
          const silenceEnd = i / sRate;
          const dur = silenceEnd - silenceStart;
          if (dur >= 1.5) {
            silList.push({ start: silenceStart, end: silenceEnd, duration: dur });
          }
        }
      }
    }

    if (isSilent) {
      const silenceEnd = len / sRate;
      const dur = silenceEnd - silenceStart;
      if (dur >= 1.5) {
        silList.push({ start: silenceStart, end: silenceEnd, duration: dur });
      }
    }
    setSilences(silList);
  };

  // Audio Context decode file buffer
  const loadAudioBuffer = async (arrayBuffer) => {
    const ctx = getAudioContext();
    return await ctx.decodeAudioData(arrayBuffer);
  };

  // Setup file and trigger decoding pipelines
  const handleFile = async (file) => {
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError(`File size exceeds the browser recommendation. Please load an audio file smaller than ${MAX_UPLOAD_SIZE_LABEL} to prevent memory crashes.`);
      return;
    }

    stopPlayback();
    setError("");
    setLoadingStep("reading");
    setStatusLabel(`Reading ${file.name}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setStatusLabel("Decoding audio data into browser memory...");
      
      let decodedBuffer;
      try {
        decodedBuffer = await loadAudioBuffer(arrayBuffer);
      } catch (decodeErr) {
        // Fallback: If browser native decoder fails, try transcoding to WAV with FFmpeg
        console.warn("Native browser decoding failed, attempting FFmpeg fallback transcoding", decodeErr);
        setStatusLabel("Loading FFmpeg engine to transcode incompatible codec...");
        const ffmpeg = await loadFfmpeg();
        const { fetchFile } = await import("@ffmpeg/util");
        
        await ffmpeg.writeFile("input_codec", await fetchFile(file));
        setStatusLabel("Converting audio format locally...");
        
        // Transcode to standard 16-bit WAV PCM
        await ffmpeg.exec(["-i", "input_codec", "-acodec", "pcm_s16le", "-ar", "44100", "decoded_fallback.wav"]);
        const wavData = await ffmpeg.readFile("decoded_fallback.wav");
        
        setStatusLabel("Decoding fallback stream...");
        decodedBuffer = await loadAudioBuffer(wavData.buffer);
      }

      setLoadingStep("generating");
      setStatusLabel("Generating interactive waveform peaks...");
      
      // Setup buffer states
      setAudioBuffer(decodedBuffer);
      setDuration(decodedBuffer.duration);
      setSampleRate(decodedBuffer.sampleRate);
      setChannels(decodedBuffer.numberOfChannels);
      
      // Default trim endpoints
      setTrimStart(0);
      setTrimEnd(decodedBuffer.duration);
      setCurrentTime(0);

      // Extract peaks & detect silences
      buildPeakCache(decodedBuffer);
      detectSilences(decodedBuffer);

      setSelectedFile(file);
      setCustomFilename(`${file.name.replace(/\.[^/.]+$/, "")}_trimmed`);
      
      // Save to recent history (avoid duplicating file content in state, only metadata)
      const newRecentItem = {
        name: file.name,
        size: file.size,
        type: file.type,
        duration: decodedBuffer.duration,
        loadedAt: new Date().toLocaleTimeString(),
      };
      setRecentFiles((prev) => {
        const filtered = prev.filter((item) => item.name !== file.name);
        const updated = [newRecentItem, ...filtered].slice(0, 5);
        localStorage.setItem("awt_recentFiles", JSON.stringify(updated));
        return updated;
      });

      setLoadingStep("");
      setStatusLabel("Audio file loaded successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to process audio file. The file may be corrupted, or this format isn't supported by your browser's audio core.");
      setLoadingStep("");
    }
  };

  // synthesized programmatic demo audio
  const handleTryDemo = () => {
    stopPlayback();
    setError("");
    setLoadingStep("generating");
    setStatusLabel("Synthesizing studio synth melody...");

    try {
      const ctx = getAudioContext();
      const sampleRate = 44100;
      const demoDur = 12.5; // 12.5 seconds chord progression
      const totalSamples = sampleRate * demoDur;
      const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Melodic Progression (Am - F - C - G - Am)
      const chords = [
        [220.00, 261.63, 329.63, 440.00], // Am
        [174.61, 220.00, 261.63, 349.23], // F
        [130.81, 164.81, 196.00, 261.63], // C
        [196.00, 246.94, 293.66, 392.00], // G
        [220.00, 261.63, 329.63, 440.00], // Am (resolve)
      ];
      const chordDur = demoDur / chords.length;

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.min(Math.floor(t / chordDur), chords.length - 1);
        const chordFreqs = chords[chordIdx];
        const localTime = t % chordDur;

        // Envelope: smooth fade-in, decay and release
        let env = 1;
        const attack = 0.25;
        const decay = 0.45;
        if (localTime < attack) {
          env = localTime / attack;
        } else if (localTime > chordDur - decay) {
          env = (chordDur - localTime) / decay;
        }

        // Subtly mix multiple voice osc structures
        let sampleVal = 0;
        for (let freqIdx = 0; freqIdx < chordFreqs.length; freqIdx++) {
          const freq = chordFreqs[freqIdx];
          // Voice 1: Sine
          const sValue = Math.sin(2 * Math.PI * freq * t);
          // Voice 2: Triangle
          const phase = (freq * t) % 1;
          const tValue = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;

          sampleVal += (sValue * 0.55 + tValue * 0.45);
        }

        // Scale chord amplitude
        sampleVal = (sampleVal / chordFreqs.length) * 0.28 * env;

        // Add a 5Hz warmth tremolo LFO
        const tremolo = 1.0 + 0.12 * Math.sin(2 * Math.PI * 5.0 * t);
        sampleVal *= tremolo;

        // Stereo spatialization
        leftChannel[i] = sampleVal * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.4 * t));
        rightChannel[i] = sampleVal * (0.85 - 0.15 * Math.sin(2 * Math.PI * 0.4 * t));
      }

      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setSampleRate(buffer.sampleRate);
      setChannels(buffer.numberOfChannels);

      setTrimStart(0);
      setTrimEnd(buffer.duration);
      setCurrentTime(0);

      buildPeakCache(buffer);
      detectSilences(buffer);

      // Dummy file meta
      setSelectedFile({
        name: "demo_synth_progression.wav",
        size: totalSamples * 4,
        type: "audio/wav",
      });
      setCustomFilename("demo_synth_trimmed");
      
      setLoadingStep("");
      setStatusLabel("Melodic synthesized demo loaded!");
    } catch (err) {
      console.error(err);
      setError("Failed to synthesize demo audio.");
      setLoadingStep("");
    }
  };

  // Paste Event Handler
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file" && items[i].type.startsWith("audio/")) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // WebAssembly FFmpeg loading
  const loadFfmpeg = async () => {
    if (!ffmpegRef.current) {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      ffmpegRef.current = new FFmpeg();
    }
    if (!ffmpegLoadPromiseRef.current) {
      ffmpegLoadPromiseRef.current = (async () => {
        try {
          const { toBlobURL } = await import("@ffmpeg/util");
          const ffmpeg = ffmpegRef.current;
          await ffmpeg.load({
            coreURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
          });
          return ffmpeg;
        } catch (error) {
          ffmpegLoadPromiseRef.current = null;
          ffmpegRef.current?.terminate?.();
          ffmpegRef.current = null;
          throw error;
        }
      })();
    }
    return ffmpegLoadPromiseRef.current;
  };

  // Draw Waveform and Ruler Canvas
  useEffect(() => {
    if (!audioBuffer || peakCache.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const width = duration * zoom;
    const height = canvas.clientHeight;

    // Set correct dimensions for retina sharpening
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Draw dark dashboard background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    const rulerHeight = 22;
    const centerY = rulerHeight + (height - rulerHeight) / 2;
    const maxWaveformHeight = (height - rulerHeight) - 8;

    // 1. Draw Time Ruler grid
    ctx.strokeStyle = "#334155"; // slate-700
    ctx.lineWidth = 1;
    ctx.font = "9px ui-monospace, monospace font-bold";
    ctx.fillStyle = "#94a3b8"; // slate-400

    // Adjust grid frequency based on zoom factor
    let labelInterval = 5; // label every 5 seconds
    let minorTickInterval = 1; // minor ticks every second
    if (zoom < 10) {
      labelInterval = 10;
      minorTickInterval = 5;
    } else if (zoom > 80) {
      labelInterval = 1;
      minorTickInterval = 0.25;
    }

    for (let sec = 0; sec <= duration; sec += minorTickInterval) {
      const x = sec * zoom;
      const isLabel = sec % labelInterval === 0;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, isLabel ? 12 : 6);
      ctx.stroke();

      if (isLabel) {
        ctx.fillText(formatTime(sec), x + 4, 10);
      }
    }

    // Border line beneath ruler
    ctx.strokeStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(0, rulerHeight);
    ctx.lineTo(width, rulerHeight);
    ctx.stroke();

    // 2. Draw Waveform Peaks
    const numPeaks = peakCache.length;
    const stepSize = width / numPeaks;

    // Create Indigo-to-Cyan vertical gradient for selected region
    const selectedGradient = ctx.createLinearGradient(0, rulerHeight, 0, height);
    selectedGradient.addColorStop(0, "#818cf8"); // indigo-400
    selectedGradient.addColorStop(0.5, "#6366f1"); // indigo-500
    selectedGradient.addColorStop(1, "#22d3ee"); // cyan-400

    // Create Teal-to-Cyan vertical gradient for played region
    const playedGradient = ctx.createLinearGradient(0, rulerHeight, 0, height);
    playedGradient.addColorStop(0, "#2dd4bf"); // teal-400
    playedGradient.addColorStop(0.5, "#0d9488"); // teal-600
    playedGradient.addColorStop(1, "#0891b2"); // cyan-600

    // Create Slate vertical gradient for outside region
    const outsideGradient = ctx.createLinearGradient(0, rulerHeight, 0, height);
    outsideGradient.addColorStop(0, "#475569"); // slate-500
    outsideGradient.addColorStop(1, "#1e293b"); // slate-800

    for (let i = 0; i < numPeaks; i++) {
      const peakVal = peakCache[i];
      const x = i * stepSize;

      // Determine colors based on active trimming range
      const timeAtPoint = (x / width) * duration;
      const inTrimArea = timeAtPoint >= trimStart && timeAtPoint <= trimEnd;
      const isPlayed = timeAtPoint <= currentTime;

      if (inTrimArea) {
        if (isPlayed && isPlaying) {
          ctx.strokeStyle = playedGradient;
        } else {
          ctx.strokeStyle = selectedGradient; 
        }
      } else {
        ctx.strokeStyle = outsideGradient;
      }

      // Draw peaks mirrored symmetrically
      const peakMax = Math.abs(peakVal.max);
      const peakMin = Math.abs(peakVal.min);
      const drawHeight = Math.max(1, ((peakMax + peakMin) / 2) * maxWaveformHeight);

      ctx.lineWidth = Math.max(1, stepSize - 0.5);
      ctx.beginPath();
      ctx.moveTo(x, centerY - drawHeight / 2);
      ctx.lineTo(x, centerY + drawHeight / 2);
      ctx.stroke();
    }
  }, [audioBuffer, peakCache, duration, zoom, trimStart, trimEnd, currentTime, isPlaying]);

  // Handle zooming scale modification
  const handleZoom = (factor) => {
    setZoom((prev) => Math.max(5, Math.min(250, Math.round(prev * factor))));
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Skip if writing in text inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target.isContentEditable
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (isPlaying) {
          pausePlayback();
        } else {
          startPlayback(currentTime);
        }
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        seekRelative(-1.5);
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        seekRelative(1.5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentTime, audioBuffer, trimStart, trimEnd, volume, playbackSpeed, loopPreview]);

  // Setup zoom-wheel listner on container
  useEffect(() => {
    const container = waveformScrollContainerRef.current;
    if (!container) return;

    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        if (event.deltaY < 0) {
          handleZoom(1.2);
        } else {
          handleZoom(0.8);
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoom]);

  // Seek relative step
  const seekRelative = (seconds) => {
    if (!audioBuffer) return;
    let nextTime = currentTime + seconds;
    if (nextTime < trimStart) nextTime = trimStart;
    if (nextTime > trimEnd) nextTime = trimEnd;
    
    setCurrentTime(nextTime);
    if (isPlaying) {
      startPlayback(nextTime);
    }
  };

  // Start Web Audio Player
  const startPlayback = (startTimeOffset) => {
    if (!audioBuffer) return;
    const ctx = getAudioContext();

    stopPlayback();

    // Check bounds
    let offset = startTimeOffset;
    if (offset < trimStart || offset >= trimEnd) {
      offset = trimStart;
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackSpeed;

    const gainNode = ctx.createGain();
    
    // Apply normalizations and volumes
    let baseGain = volume;
    if (normalize && audioBuffer) {
      const scale = calculateNormalizationScale(audioBuffer, trimStart, trimEnd);
      baseGain *= scale;
    }
    gainNode.gain.setValueAtTime(baseGain, ctx.currentTime);

    // Apply real-time Fades
    const playDuration = trimEnd - offset;
    const offsetInTrim = offset - trimStart;

    // Fade In setup
    if (fadeInDuration > 0 && offsetInTrim < fadeInDuration) {
      const fadeTimeRemaining = fadeInDuration - offsetInTrim;
      const targetTime = ctx.currentTime + fadeTimeRemaining / playbackSpeed;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseGain, targetTime);
    }

    // Fade Out setup
    if (fadeOutDuration > 0) {
      const fadeOutTimeOffset = trimEnd - trimStart - fadeOutDuration;
      if (offsetInTrim < fadeOutTimeOffset) {
        const fadeOutStartTime = ctx.currentTime + (fadeOutTimeOffset - offsetInTrim) / playbackSpeed;
        const fadeOutEndTime = ctx.currentTime + playDuration / playbackSpeed;
        gainNode.gain.setValueAtTime(baseGain, fadeOutStartTime);
        gainNode.gain.linearRampToValueAtTime(0, fadeOutEndTime);
      } else {
        // Start inside fade-out
        const ratio = (trimEnd - offset) / fadeOutDuration;
        const currentFadeVolume = baseGain * ratio;
        const fadeOutEndTime = ctx.currentTime + playDuration / playbackSpeed;
        gainNode.gain.setValueAtTime(currentFadeVolume, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, fadeOutEndTime);
      }
    }

    source.connect(gainNode).connect(ctx.destination);

    // Looping handles
    if (loopPreview) {
      source.loop = true;
      source.loopStart = trimStart;
      source.loopEnd = trimEnd;
      source.start(0, offset);
    } else {
      source.loop = false;
      source.start(0, offset, playDuration);
      source.onended = () => {
        // Only trigger end if it represents actual finish
        if (playSourceRef.current === source) {
          setIsPlaying(false);
          setCurrentTime(trimStart);
        }
      };
    }

    playSourceRef.current = source;
    playGainNodeRef.current = gainNode;
    playStartTimeRef.current = ctx.currentTime;
    playOffsetRef.current = offset;
    setIsPlaying(true);

    // Animation frame timing updates
    const updateTime = () => {
      if (playSourceRef.current !== source) return;
      const elapsed = (ctx.currentTime - playStartTimeRef.current) * playbackSpeed;
      let calculatedTime = playOffsetRef.current + elapsed;

      if (loopPreview) {
        const loopLen = trimEnd - trimStart;
        if (calculatedTime > trimEnd) {
          calculatedTime = trimStart + ((calculatedTime - trimStart) % loopLen);
        }
      } else if (calculatedTime > trimEnd) {
        calculatedTime = trimEnd;
      }

      setCurrentTime(calculatedTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };

  const pausePlayback = () => {
    if (playSourceRef.current) {
      try {
        playSourceRef.current.stop();
      } catch (e) {}
      playSourceRef.current = null;
    }
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const stopPlayback = () => {
    pausePlayback();
    setCurrentTime(trimStart);
  };

  // Drag and Drop handle tracking
  const handleDragStart = (event, handleType) => {
    event.preventDefault();
    draggingRef.current = handleType;
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd);
  };

  const handleDragMove = (event) => {
    if (!audioBuffer || !waveformScrollContainerRef.current || !draggingRef.current) return;
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const container = waveformScrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // account for scroll left position
    const relativeX = clientX - rect.left + container.scrollLeft;
    const calculatedTime = Math.max(0, Math.min(duration, relativeX / zoom));

    if (draggingRef.current === "left") {
      setTrimStart(Math.min(calculatedTime, trimEnd - 0.08));
    } else {
      setTrimEnd(Math.max(calculatedTime, trimStart + 0.08));
    }
  };

  const handleDragEnd = () => {
    draggingRef.current = null;
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("touchend", handleDragEnd);
  };

  // Timeline click seeking
  const handleTimelineClick = (event) => {
    if (!audioBuffer || !waveformScrollContainerRef.current) return;

    const container = waveformScrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const relativeX = event.clientX - rect.left + container.scrollLeft;
    const clickedTime = Math.max(0, Math.min(duration, relativeX / zoom));

    // Seek player
    setCurrentTime(clickedTime);
    if (isPlaying) {
      startPlayback(clickedTime);
    }
  };

  // Find normalization scale factor
  const calculateNormalizationScale = (buffer, start, end) => {
    const channelData = buffer.getChannelData(0);
    const sRate = buffer.sampleRate;
    const startIdx = Math.floor(start * sRate);
    const endIdx = Math.floor(end * sRate);
    
    let maxVal = 0.0001;
    // Scan with step 10 to speed up scan
    for (let i = startIdx; i < endIdx && i < buffer.length; i += 10) {
      const val = Math.abs(channelData[i]);
      if (val > maxVal) maxVal = val;
    }
    const scale = 0.98 / maxVal;
    return Math.min(10.0, scale); // Max 10x boost
  };

  // WAV file exporter (16-bit stereo/mono raw PCM Blob)
  const renderWavBlob = (renderedBuffer) => {
    const numOfChan = renderedBuffer.numberOfChannels;
    const length = renderedBuffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channelsData = [];

    // Header helpers
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, length - 8, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM Format
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, renderedBuffer.sampleRate, true);
    view.setUint32(28, renderedBuffer.sampleRate * numOfChan * 2, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true); // 16-bit
    writeString(36, "data");
    view.setUint32(40, renderedBuffer.length * numOfChan * 2, true);

    for (let i = 0; i < numOfChan; i++) {
      channelsData.push(renderedBuffer.getChannelData(i));
    }

    // Interleave samples
    let offset = 44;
    for (let i = 0; i < renderedBuffer.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        let sample = channelsData[ch][i];
        // Clamp sample
        sample = Math.max(-1, Math.min(1, sample));
        const val = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, val, true);
        offset += 2;
      }
    }

    return new Blob([bufferArr], { type: "audio/wav" });
  };

  // DSP Offline Context Processing Engine
  const processDspSelection = async (start, end) => {
    if (!audioBuffer) return null;
    const trimDur = end - start;
    const outSampleRate = audioBuffer.sampleRate;
    const totalSamples = Math.floor(trimDur * outSampleRate);

    // Offline context with original channel config
    const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, totalSamples, outSampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = offlineCtx.createGain();
    source.connect(gainNode).connect(offlineCtx.destination);

    // volume/normalization factor
    let baseGain = 1.0;
    if (normalize) {
      baseGain = calculateNormalizationScale(audioBuffer, start, end);
    }
    gainNode.gain.setValueAtTime(baseGain, 0);

    // Fades in offline render
    if (fadeInDuration > 0) {
      gainNode.gain.setValueAtTime(0, 0);
      gainNode.gain.linearRampToValueAtTime(baseGain, fadeInDuration);
    }

    if (fadeOutDuration > 0) {
      const fadeOutStartTime = trimDur - fadeOutDuration;
      gainNode.gain.setValueAtTime(baseGain, Math.max(0, fadeOutStartTime));
      gainNode.gain.linearRampToValueAtTime(0, trimDur);
    }

    source.start(0, start, trimDur);
    return await offlineCtx.startRendering();
  };

  // Main Export Pipeline (Trim + Convert)
  const handleExport = async (customStart = null, customEnd = null, suffix = "") => {
    if (!audioBuffer) return;
    stopPlayback();
    setError("");
    setLoadingStep("transcoding");

    const start = customStart !== null ? customStart : trimStart;
    const end = customEnd !== null ? customEnd : trimEnd;
    const targetName = `${customFilename || "audio"}${suffix}`;

    setStatusLabel("Applying DSP effects (fades, normalization, trimming)...");

    try {
      const renderedBuffer = await processDspSelection(start, end);
      if (!renderedBuffer) throw new Error("Render process failed");

      // Generate intermediate WAV
      const wavBlob = renderWavBlob(renderedBuffer);

      // If format is WAV, download immediately without loading WASM FFmpeg!
      if (outputFormat === "wav") {
        triggerDownload(wavBlob, `${targetName}.wav`);
        setLoadingStep("");
        setStatusLabel("WAV file downloaded!");
        return;
      }

      // Convert using FFmpeg
      setStatusLabel("Initializing local FFmpeg transcoder...");
      const ffmpeg = await loadFfmpeg();
      const { fetchFile } = await import("@ffmpeg/util");

      setStatusLabel("Loading WAV PCM buffer into transcoder filesystem...");
      await ffmpeg.writeFile("render.wav", await fetchFile(wavBlob));

      setStatusLabel(`Transcoding audio to ${outputFormat.toUpperCase()} at ${bitrate} kbps...`);

      const inputName = "render.wav";
      const outputName = `output.${outputFormat}`;

      // Build FFmpeg command args
      const args = ["-i", inputName];
      if (outputFormat === "mp3") {
        args.push("-c:a", "libmp3lame", "-b:a", `${bitrate}k`);
      } else if (outputFormat === "m4a") {
        args.push("-c:a", "aac", "-b:a", `${bitrate}k`);
      } else if (outputFormat === "aac") {
        args.push("-c:a", "aac", "-b:a", `${bitrate}k`);
      } else if (outputFormat === "ogg") {
        args.push("-c:a", "libvorbis", "-b:a", `${bitrate}k`);
      } else if (outputFormat === "webm") {
        args.push("-c:a", "libopus", "-b:a", `${bitrate}k`);
      } else if (outputFormat === "flac") {
        args.push("-c:a", "flac"); // FLAC lossless ignore bitrate
      }
      args.push(outputName);

      await ffmpeg.exec(args);
      
      const fileData = await ffmpeg.readFile(outputName);
      const mimeTypes = {
        mp3: "audio/mpeg",
        m4a: "audio/mp4",
        aac: "audio/aac",
        ogg: "audio/ogg",
        flac: "audio/flac",
        webm: "audio/webm",
      };

      const outBlob = new Blob([fileData.buffer], { type: mimeTypes[outputFormat] || "audio/octet-stream" });
      triggerDownload(outBlob, `${targetName}.${outputFormat}`);

      setLoadingStep("");
      setStatusLabel("Export completed successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to convert audio file. Transcoder memory limit hit, or format mismatch.");
      setLoadingStep("");
    }
  };

  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Split calculations
  useEffect(() => {
    if (!audioBuffer) return;

    const segments = [];
    const selectionDuration = trimEnd - trimStart;

    if (splitMode === "equal") {
      const partDur = selectionDuration / splitPartsCount;
      for (let i = 0; i < splitPartsCount; i++) {
        segments.push({
          index: i + 1,
          start: trimStart + i * partDur,
          end: trimStart + (i + 1) * partDur,
          filename: `${customFilename || "split"}_part${i + 1}`,
        });
      }
    } else {
      let current = trimStart;
      let idx = 1;
      while (current < trimEnd) {
        const next = Math.min(current + splitSecondsInterval, trimEnd);
        segments.push({
          index: idx,
          start: current,
          end: next,
          filename: `${customFilename || "split"}_chunk${idx}`,
        });
        current = next;
        idx++;
      }
    }
    setSplitFiles(segments);
  }, [audioBuffer, trimStart, trimEnd, splitMode, splitPartsCount, splitSecondsInterval, customFilename]);

  // Reset tool state
  const handleReset = () => {
    stopPlayback();
    setSelectedFile(null);
    setAudioBuffer(null);
    setDuration(0);
    setSampleRate(0);
    setChannels(1);
    setPeakCache([]);
    setSilences([]);
    setTrimStart(0);
    setTrimEnd(0);
    setCurrentTime(0);
    setError("");
    setStatusLabel("");
    setLoadingStep("");
    setSplitFiles([]);
  };

  // Format analysis size estimates
  const estimatedExportSize = useMemo(() => {
    if (!audioBuffer) return "0 B";
    const selectedDuration = trimEnd - trimStart;
    if (outputFormat === "wav") {
      // 16-bit PCM (2 bytes/sample) * sampleRate * channels
      return formatBytes(selectedDuration * sampleRate * channels * 2);
    }
    // compressed format estimation
    const kbps = parseInt(bitrate) || 192;
    const bytesPerSec = (kbps * 1000) / 8;
    return formatBytes(selectedDuration * bytesPerSec);
  }, [trimStart, trimEnd, outputFormat, bitrate, sampleRate, channels, audioBuffer]);

  // Smart Insights Generation
  const audioInsights = useMemo(() => {
    if (!audioBuffer) return [];
    const list = [];

    // Channel check
    if (channels === 1) {
      list.push({ type: "info", text: "Mono audio track detected. Suitable for voices and voice notes." });
    } else {
      list.push({ type: "success", text: `Stereo spatial audio detected (${channels} separate audio channels).` });
    }

    // Sample rate check
    if (sampleRate >= 44100) {
      list.push({ type: "success", text: `CD/Studio quality recording detected with a sample rate of ${sampleRate / 1000} kHz.` });
    } else {
      list.push({ type: "warning", text: `Low sample rate (${sampleRate / 1000} kHz). Transcoding to high bitrates will not improve clarity.` });
    }

    // Silent intros / outros checks
    const silenceIntro = silences.find((s) => s.start < 0.35);
    const silenceOutro = silences.find((s) => s.end > duration - 0.35);

    if (silenceIntro && silenceIntro.duration > 1.0) {
      list.push({
        type: "warning",
        text: `Large silent intro detected at the beginning (${silenceIntro.duration.toFixed(1)}s of silence).`,
        action: () => setTrimStart(silenceIntro.end),
        actionLabel: "Trim Silent Intro",
      });
    }

    if (silenceOutro && silenceOutro.duration > 1.0) {
      list.push({
        type: "warning",
        text: `Large silent outro detected at the end of the file (${silenceOutro.duration.toFixed(1)}s of silence).`,
        action: () => setTrimEnd(silenceOutro.start),
        actionLabel: "Trim Silent Outro",
      });
    }

    // Low bitrate estimate on input file size
    if (selectedFile?.size) {
      const inputBitrate = (selectedFile.size * 8) / duration / 1000;
      if (inputBitrate < 120) {
        list.push({ type: "info", text: `Low density source file (est. ${Math.round(inputBitrate)} kbps). Converting to higher bitrates (like 320 kbps) will only inflate output file size.` });
      }
    }

    return list;
  }, [audioBuffer, channels, sampleRate, silences, duration, selectedFile]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/70 px-4 py-6 sm:px-6 lg:px-8">
      {/* Title SEO structured */}
      <head>
        <title>Audio Waveform Trimmer & Converter – Trim & Convert Audio Online</title>
        <meta name="description" content="Trim audio, edit waveforms, preview changes, convert formats, and export high-quality audio directly in your browser. Fast, private and free." />
      </head>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex min-w-0 flex-col gap-8">
            
            {/* Header Hero */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                Privacy First • Local Browser Engine
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Audio Waveform Trimmer & Converter
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Trim, preview, convert and export audio directly in your browser. Fast, private and free.
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="font-medium">{error}</div>
              </div>
            )}

            {/* File Upload Shell */}
            {!audioBuffer ? (
              <div className="flex flex-col gap-6">
                <div
                  onDragEnter={() => setDragActive(true)}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files?.[0]); }}
                  className={`relative min-w-0 rounded-3xl border-2 border-dashed p-6 transition sm:p-10 ${
                    dragActive ? "border-orange-400 bg-orange-50/80" : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-5 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md ring-1 ring-slate-100 relative group transition-transform duration-300">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-500/10 to-amber-500/5 opacity-40 blur-md" />
                      <svg className="h-14 w-14 relative z-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                          <linearGradient id="user-soundwave-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        <rect x="3.4" y="10.25" width="1.2" height="3.5" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="5.4" y="8.75" width="1.2" height="6.5" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="7.4" y="6.25" width="1.2" height="11.5" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="9.4" y="7.5" width="1.2" height="9.0" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="11.4" y="3.5" width="1.2" height="17.0" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="13.4" y="8.0" width="1.2" height="8.0" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="15.4" y="6.25" width="1.2" height="11.5" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="17.4" y="8.5" width="1.2" height="7.0" rx="0.6" fill="url(#user-soundwave-gradient)" />
                        <rect x="19.4" y="10.25" width="1.2" height="3.5" rx="0.6" fill="url(#user-soundwave-gradient)" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-slate-900">Drag & Drop audio file here</p>
                      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                        Or click to upload, or paste (Ctrl+V) files. 100% processed locally on your computer.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                      >
                        Upload Audio
                      </button>
                      <button
                        type="button"
                        onClick={handleTryDemo}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        Try Demo Audio
                      </button>
                    </div>

                    {/* Supported tags */}
                    <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-500">
                      <span>Supported Inputs:</span>
                      {["MP3", "WAV", "AAC", "M4A", "FLAC", "OGG", "WEBM"].map((tag) => (
                        <span key={tag} className="rounded bg-slate-100 px-2 py-0.5 font-mono">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Processing Overlay loading states */}
                {loadingStep && (
                  <div className="flex flex-col items-center justify-center gap-4 py-8 text-center bg-slate-50 rounded-2xl">
                    <div className="relative flex h-10 w-10 animate-spin items-center justify-center rounded-full border-4 border-slate-200 border-t-orange-500" />
                    <div>
                      <p className="font-bold text-slate-900">
                        {loadingStep === "reading" && "Reading Audio File..."}
                        {loadingStep === "generating" && "Generating Waveform Peaks..."}
                        {loadingStep === "transcoding" && "Preparing Export..."}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{statusLabel}</p>
                    </div>
                  </div>
                )}
                
                {/* Recent History List */}
                {recentFiles.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recent Files Load History
                    </h2>
                    <div className="divide-y divide-slate-100">
                      {recentFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 text-xs sm:text-sm first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{file.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatBytes(file.size)} • {formatTime(file.duration)} • Loaded at {file.loadedAt}
                              </p>
                            </div>
                          </div>
                          <span className="text-slate-400 text-xs italic shrink-0">Saved offline</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* File Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Active Workspace File</span>
                    <h3 className="truncate text-base font-bold text-slate-900">{selectedFile?.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatBytes(selectedFile?.size)} • {channels} ch • {sampleRate / 1000} kHz • {formatTime(duration)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Upload Another
                    </button>
                  </div>
                </div>

                {/* Waveform Editor Panel */}
                <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-800 bg-[#020617] p-4 shadow-2xl relative">
                  {/* Waveform Canvas Container with handles */}
                  <div className="relative w-full border border-slate-900 rounded-xl bg-slate-950 p-1 overflow-hidden shadow-inner select-none">
                    <div 
                      className="overflow-x-auto overflow-y-hidden h-44 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-955" 
                      ref={waveformScrollContainerRef}
                    >
                      <div 
                        className="relative h-full cursor-pointer" 
                        style={{ width: `${duration * zoom}px` }}
                        onClick={handleTimelineClick}
                      >
                        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />
                        
                        {/* Trim region overlay shadow */}
                        <div 
                          className="absolute top-6 bottom-0 bg-indigo-500/8 border-x border-indigo-500/20 pointer-events-none" 
                          style={{ left: `${trimStart * zoom}px`, width: `${(trimEnd - trimStart) * zoom}px` }} 
                        />
                        
                        {/* Left Trim Handle */}
                        <div
                          className="absolute top-6 bottom-0 w-6 -ml-3 cursor-col-resize z-20 flex flex-col justify-between items-center group"
                          style={{ left: `${trimStart * zoom}px` }}
                          onMouseDown={(e) => handleDragStart(e, "left")}
                          onTouchStart={(e) => handleDragStart(e, "left")}
                          onClick={(e) => e.stopPropagation()} // Prevent seek click
                        >
                          <div className="w-0.5 h-full bg-indigo-500 group-hover:bg-indigo-400 transition" />
                          <div className="absolute top-1/2 -translate-y-1/2 w-5 h-8 rounded-md bg-indigo-600 border border-white shadow-lg flex items-center justify-center gap-0.5 select-none hover:bg-indigo-500 transition duration-150">
                            <span className="w-0.5 h-3 bg-white/70 rounded-full" />
                            <span className="w-0.5 h-3 bg-white/70 rounded-full" />
                          </div>
                        </div>

                        {/* Right Trim Handle */}
                        <div
                          className="absolute top-6 bottom-0 w-6 -ml-3 cursor-col-resize z-20 flex flex-col justify-between items-center group"
                          style={{ left: `${trimEnd * zoom}px` }}
                          onMouseDown={(e) => handleDragStart(e, "right")}
                          onTouchStart={(e) => handleDragStart(e, "right")}
                          onClick={(e) => e.stopPropagation()} // Prevent seek click
                        >
                          <div className="w-0.5 h-full bg-indigo-500 group-hover:bg-indigo-400 transition" />
                          <div className="absolute top-1/2 -translate-y-1/2 w-5 h-8 rounded-md bg-indigo-600 border border-white shadow-lg flex items-center justify-center gap-0.5 select-none hover:bg-indigo-500 transition duration-150">
                            <span className="w-0.5 h-3 bg-white/70 rounded-full" />
                            <span className="w-0.5 h-3 bg-white/70 rounded-full" />
                          </div>
                        </div>

                        {/* Real-time playback playhead vertical marker */}
                        <div 
                          className="absolute top-6 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none transition-all duration-75" 
                          style={{ left: `${currentTime * zoom}px` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Timeline details (current position, selected duration) */}
                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 px-1 pt-1">
                    <div className="flex items-center gap-3">
                      <span>Seek: <strong className="text-cyan-400">{formatTime(currentTime)}</strong> / {formatTime(duration)}</span>
                      <span className="hidden sm:inline text-slate-700">|</span>
                      <span className="hidden sm:inline">Zoom: <strong className="text-slate-300">{zoom} px/s</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Selection: <strong className="text-indigo-400">{formatTime(trimStart)} - {formatTime(trimEnd)}</strong></span>
                      <span className="text-slate-700">|</span>
                      <span>Duration: <strong className="text-indigo-400">{(trimEnd - trimStart).toFixed(2)}s</strong></span>
                    </div>
                  </div>
                </div>

                {/* Double column layout */}
                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr] items-start">
                  
                  {/* Left Column: Player and Editing Deck */}
                  <div className="flex flex-col gap-6">
                    
                    {/* Player Toolbar */}
                    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Playback Controls</h4>
                      <div className="flex flex-wrap items-center gap-3 justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={isPlaying ? pausePlayback : () => startPlayback(currentTime)}
                            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md hover:from-indigo-500 hover:to-cyan-500 hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition duration-200"
                            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                          >
                            {isPlaying ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          <button
                            onClick={stopPlayback}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                            title="Stop"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9z" clipRule="evenodd" />
                            </svg>
                          </button>

                          <button
                            onClick={() => startPlayback(trimStart)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                            title="Replay Selection"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                          </button>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 min-w-[120px] max-w-[150px] flex-1">
                          <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                          </svg>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="h-1 w-full bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>

                      {/* Speed & Loop togglers */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          {["0.5", "1.0", "1.25", "1.5", "2.0"].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => setPlaybackSpeed(parseFloat(speed))}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                playbackSpeed === parseFloat(speed)
                                  ? "bg-slate-900 text-white shadow-sm"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={loopPreview}
                            onChange={(e) => {
                              setLoopPreview(e.target.checked);
                              savePreference("awt_loopPreview", e.target.checked);
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          Loop Selection
                        </label>
                      </div>
                    </div>

                    {/* Precision Trim and DSP Effects Panel */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col gap-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Precision Edit & DSP Settings</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Define your trim boundaries and volume fade profiles.</p>
                      </div>

                      {/* Time Manual Inputs */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Start Time (seconds)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={trimEnd - 0.05}
                            value={parseFloat(trimStart.toFixed(3))}
                            onChange={(e) => setTrimStart(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">End Time (seconds)</label>
                          <input
                            type="number"
                            step="0.01"
                            min={trimStart + 0.05}
                            max={duration}
                            value={parseFloat(trimEnd.toFixed(3))}
                            onChange={(e) => setTrimEnd(Math.min(duration, parseFloat(e.target.value) || duration))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Fades Ramping sliders */}
                      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                            <span>Fade In Duration</span>
                            <span className="text-indigo-600 font-mono">{fadeInDuration.toFixed(1)}s</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={fadeInDuration}
                            onChange={(e) => {
                              setFadeInDuration(parseFloat(e.target.value));
                              savePreference("awt_fadeIn", e.target.value);
                            }}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                            <span>Fade Out Duration</span>
                            <span className="text-indigo-600 font-mono">{fadeOutDuration.toFixed(1)}s</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={fadeOutDuration}
                            onChange={(e) => {
                              setFadeOutDuration(parseFloat(e.target.value));
                              savePreference("awt_fadeOut", e.target.value);
                            }}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>

                      {/* Peak Normalization Switcher */}
                      <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer select-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={normalize}
                            onChange={(e) => {
                              setNormalize(e.target.checked);
                              savePreference("awt_normalize", e.target.checked);
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-800">Normalize Audio Volume</span>
                            <p className="text-xs text-slate-500 mt-0.5">Auto-scale peaks to -0.17dB without introducing clipping, boosting speech clarity.</p>
                          </div>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Export, Splitting and Insights */}
                  <div className="flex flex-col gap-6">
                    
                    {/* Export Action Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Transcode & Export</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Render files directly in browser memory.</p>
                      </div>

                      {/* Custom Filename */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Output File Name</label>
                        <input
                          type="text"
                          value={customFilename}
                          onChange={(e) => setCustomFilename(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Format and bitrates */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Format</label>
                          <ThemedDropdown
                            value={outputFormat}
                            options={FORMAT_OPTIONS}
                            onChange={(val) => {
                              setOutputFormat(val);
                              savePreference("awt_outputFormat", val);
                            }}
                            ariaLabel="Output Format"
                          />
                        </div>

                        {outputFormat !== "wav" && outputFormat !== "flac" ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Quality Bitrate</label>
                            <ThemedDropdown
                              value={bitrate}
                              options={BITRATE_OPTIONS}
                              onChange={(val) => {
                                setBitrate(val);
                                savePreference("awt_bitrate", val);
                              }}
                              ariaLabel="Bitrate Quality"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Quality</label>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5 text-xs font-bold text-slate-500 text-center">
                              Lossless PCM
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File size estimate panel */}
                      <div className="rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100 flex items-center justify-between text-xs sm:text-sm font-semibold">
                        <span className="text-slate-600">Estimated Output Size:</span>
                        <span className="text-indigo-700 font-bold">{estimatedExportSize}</span>
                      </div>

                      {/* Process Export Button */}
                      {loadingStep === "transcoding" ? (
                        <div className="flex flex-col items-center justify-center gap-2.5 py-3 text-center bg-indigo-50/30 rounded-xl">
                          <div className="relative flex h-8 w-8 animate-spin items-center justify-center rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                          <span className="text-xs text-indigo-700 font-bold">{statusLabel}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExport()}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:from-indigo-500 hover:to-cyan-500 active:scale-95"
                        >
                          Trim & Export Audio
                        </button>
                      )}
                    </div>

                    {/* Secondary Utilities Tabs Container */}
                    <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex flex-col gap-4">
                      {/* Grid tabs */}
                      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-inner shadow-slate-200/50">
                        {TABS_CONFIG.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-xl py-2 px-1 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              activeTab === tab.id
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.id === "insights" ? "Insights" : tab.id === "history" ? "History" : "Split"}</span>
                          </button>
                        ))}
                      </div>

                      {/* Tab contents */}
                      <div className="pt-2">
                        {/* Tab Content: Split */}
                        {activeTab === "split" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setSplitMode("equal")}
                                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                                  splitMode === "equal" ? "bg-slate-900 text-white" : "text-slate-600"
                                }`}
                              >
                                Equal Parts
                              </button>
                              <button
                                type="button"
                                onClick={() => setSplitMode("seconds")}
                                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                                  splitMode === "seconds" ? "bg-slate-900 text-white" : "text-slate-600"
                                }`}
                              >
                                Fixed Seconds
                              </button>
                            </div>

                            {splitMode === "equal" ? (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-slate-600">Split into parts</span>
                                <input
                                  type="number"
                                  min="2"
                                  max="32"
                                  value={splitPartsCount}
                                  onChange={(e) => setSplitPartsCount(Math.max(2, parseInt(e.target.value) || 2))}
                                  className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-slate-600">Interval (seconds)</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={duration}
                                  value={splitSecondsInterval}
                                  onChange={(e) => setSplitSecondsInterval(Math.max(1, parseFloat(e.target.value) || 1))}
                                  className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            )}

                            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 bg-white rounded-2xl p-1 shadow-inner">
                              {splitFiles.map((segment) => (
                                <div key={segment.index} className="flex items-center justify-between p-2.5 text-xs">
                                  <div className="min-w-0 flex-1 pr-2">
                                    <p className="font-bold text-slate-800">Part {segment.index}</p>
                                    <p className="text-[10px] text-slate-500">
                                      {formatTime(segment.start)} - {formatTime(segment.end)} ({(segment.end - segment.start).toFixed(1)}s)
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleExport(segment.start, segment.end, `_part${segment.index}`)}
                                    className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                                  >
                                    Export
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tab Content: Insights */}
                        {activeTab === "insights" && (
                          <div className="flex flex-col gap-3">
                            {audioInsights.length === 0 ? (
                              <p className="text-xs text-slate-500 text-center py-4">No diagnostics found.</p>
                            ) : (
                              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                                {audioInsights.map((insight, idx) => (
                                  <div
                                    key={idx}
                                    className={`rounded-xl border p-3 flex flex-col gap-2 text-xs ${
                                      insight.type === "success"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : insight.type === "warning"
                                        ? "border-amber-200 bg-amber-50 text-amber-800"
                                        : "border-slate-200 bg-white text-slate-800"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      {insight.type === "success" && (
                                        <svg className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {insight.type === "warning" && (
                                        <svg className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                      )}
                                      {insight.type === "info" && (
                                        <svg className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                      )}
                                      <span className="font-semibold">{insight.text}</span>
                                    </div>
                                    {insight.action && (
                                      <button
                                        type="button"
                                        onClick={insight.action}
                                        className="self-end rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200 hover:bg-slate-50 transition"
                                      >
                                        {insight.actionLabel}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tab Content: History */}
                        {activeTab === "history" && (
                          <div className="flex flex-col gap-3">
                            {recentFiles.length === 0 ? (
                              <p className="text-xs text-slate-500 text-center py-4">No loaded files.</p>
                            ) : (
                              <div className="divide-y divide-slate-100 rounded-2xl bg-white border border-slate-200 p-1 shadow-inner max-h-48 overflow-y-auto">
                                {recentFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2.5 text-[11px] sm:text-xs">
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                        </svg>
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{file.name}</p>
                                        <p className="text-[10px] text-slate-500">
                                          {formatBytes(file.size)} • {formatTime(file.duration)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                </div>

                {/* Keyboard Shortcuts Quick Guide */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-500 flex flex-wrap gap-x-5 gap-y-2 justify-center">
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded border bg-slate-50 px-1.5 py-0.5 font-mono shadow-sm">Space</kbd> Play / Pause
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded border bg-slate-50 px-1.5 py-0.5 font-mono shadow-sm">←</kbd> Seek Backward 1.5s
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded border bg-slate-50 px-1.5 py-0.5 font-mono shadow-sm">→</kbd> Seek Forward 1.5s
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded border bg-slate-50 px-1.5 py-0.5 font-mono shadow-sm">Ctrl + Wheel</kbd> Zoom Timeline
                  </div>
                </div>

              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}
