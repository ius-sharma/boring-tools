"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

// DB Configuration
const DB_NAME = "BoringTimeCapsulesDB_v1";
const STORE_NAME = "capsules";
const DB_VERSION = 1;

// Key Helpers
const KEY_PREFIX = "time_capsule_key_";

// --- INDEXEDDB STORAGE HELPERS ---
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("SSR");
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

async function getAllCapsulesFromDB() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("IndexedDB read error:", e);
    return [];
  }
}

async function saveCapsuleToDB(capsule) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(capsule);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteCapsuleFromDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- WEB CRYPTO HELPERS ---
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

function arrayBufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Derive a cryptographic key from a password via PBKDF2
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const rawKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    rawKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt payload using AES-GCM
async function encryptData(payloadString, password = null) {
  const enc = new TextEncoder();
  const data = enc.encode(payloadString);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  let key;
  let salt = null;
  let autoKeyHex = null;

  if (password) {
    salt = crypto.getRandomValues(new Uint8Array(16));
    key = await deriveKey(password, salt);
  } else {
    // Generate a unique strong key for auto-decryption
    key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const exportedRaw = await crypto.subtle.exportKey("raw", key);
    autoKeyHex = arrayBufferToHex(exportedRaw);
  }

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToHex(iv),
    salt: salt ? arrayBufferToHex(salt) : null,
    autoKeyHex: autoKeyHex,
  };
}

// Decrypt payload using AES-GCM
async function decryptData(ciphertextBase64, ivHex, saltHex, password = null, autoKeyHex = null) {
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = hexToArrayBuffer(ivHex);
  let key;

  if (password && saltHex) {
    const salt = hexToArrayBuffer(saltHex);
    key = await deriveKey(password, salt);
  } else if (autoKeyHex) {
    const rawKey = hexToArrayBuffer(autoKeyHex);
    key = await crypto.subtle.importKey(
      "raw",
      rawKey,
      "AES-GCM",
      false,
      ["decrypt"]
    );
  } else {
    throw new Error("Missing decryption credentials");
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

// Safe UUID helper (fallback for non-secure contexts)
function getUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// --- OTHER UTILITIES ---
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Precise Calendar Countdown
function getCountdown(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  let tempDate = new Date(now.getTime());
  
  let years = target.getFullYear() - now.getFullYear();
  tempDate.setFullYear(tempDate.getFullYear() + years);
  if (tempDate > target) {
    years--;
    tempDate.setFullYear(tempDate.getFullYear() - 1);
  }

  let months = 0;
  while (true) {
    let nextMonth = new Date(tempDate.getTime());
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= target) {
      months++;
      tempDate = nextMonth;
    } else {
      break;
    }
  }

  const remainMs = target.getTime() - tempDate.getTime();
  const days = Math.floor(remainMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainMs % (1000 * 60)) / 1000);

  return { years, months, days, hours, minutes, seconds };
}

// Uncompressed ZIP Generator (Client-Side, zero deps)
const crcTable = (() => {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(strOrUint8) {
  const bytes = typeof strOrUint8 === "string" ? new TextEncoder().encode(strOrUint8) : strOrUint8;
  let crc = 0 ^ (-1);
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function generateZipBlob(files) {
  let offset = 0;
  const localHeaders = [];
  const centralHeaders = [];
  const date = new Date();
  const dosTime = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF;

  const dataParts = [];

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const fileData = file.content;
    const fileCrc = crc32(fileData);
    const size = fileData.length;
    const localOffset = offset;

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(localHeader.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 10, true);
    dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, dosTime, true);
    dv.setUint16(12, dosDate, true);
    dv.setUint32(14, fileCrc, true);
    dv.setUint32(18, size, true);
    dv.setUint32(22, size, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    dataParts.push(localHeader);
    dataParts.push(fileData);
    offset += localHeader.length + fileData.length;

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(centralHeader.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 10, true);
    cdv.setUint16(8, 0, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, dosTime, true);
    cdv.setUint16(14, dosDate, true);
    cdv.setUint32(16, fileCrc, true);
    cdv.setUint32(20, size, true);
    cdv.setUint32(24, size, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);
    cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true);
    cdv.setUint16(36, 0, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, localOffset, true);
    centralHeader.set(nameBytes, 46);

    centralHeaders.push(centralHeader);
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const h of centralHeaders) {
    dataParts.push(h);
    centralDirSize += h.length;
  }

  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(4, 0, true);
  edv.setUint16(6, 0, true);
  edv.setUint16(8, files.length, true);
  edv.setUint16(10, files.length, true);
  edv.setUint32(12, centralDirSize, true);
  edv.setUint32(16, centralDirOffset, true);
  edv.setUint16(20, 0, true);

  dataParts.push(eocd);
  return new Blob(dataParts, { type: "application/zip" });
}

// Generate an ICS file content
function generateICS(title, unlockDate, createdDate) {
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  const start = formatICSDate(new Date(unlockDate));
  const end = formatICSDate(new Date(new Date(unlockDate).getTime() + 30 * 60 * 1000));
  const created = formatICSDate(new Date(createdDate));

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BoringTools//Digital Time Capsule//EN
BEGIN:VEVENT
UID:${getUUID()}
DTSTAMP:${created}
DTSTART:${start}
DTEND:${end}
SUMMARY:Unlock Time Capsule: ${title}
DESCRIPTION:Your digital time capsule "${title}" is ready to be opened. Visit BoringTools to decrypt and read your message.
URL:https://boringtools.vercel.app/digital-time-capsule
END:VEVENT
END:VCALENDAR`;
}

// --- MAIN PAGE COMPONENT ---
export default function DigitalTimeCapsule() {
  const [view, setView] = useState("home"); // home, create, vault
  const [step, setStep] = useState(1);
  const [capsules, setCapsules] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, locked, unlocked
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, upcoming

  // Form Fields
  const [title, setTitle] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [images, setImages] = useState([]);
  const [voiceRecordings, setVoiceRecordings] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [unlockDate, setUnlockDate] = useState("");
  const [durationPreset, setDurationPreset] = useState("1-year");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailReminder, setEmailReminder] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [reminderOffset, setReminderOffset] = useState("0");

  // Audio Recording States
  const [recordingState, setRecordingState] = useState("idle"); // idle, recording, paused
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const durationIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Active Viewing/Unlocking Capsule
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [decryptionPassword, setDecryptionPassword] = useState("");
  const [decryptionError, setDecryptionError] = useState("");
  const [vaultState, setVaultState] = useState("locked"); // locked, dialing, bolting, opening, opened
  const [decryptedPayload, setDecryptedPayload] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  // HTML Rich Text Editor Ref
  const editorRef = useRef(null);

  // Load theme/settings on mount
  useEffect(() => {
    setIsMounted(true);
    refreshCapsules();

    // Check if redirect query param exists
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "create") {
        setView("create");
      }
    }
  }, []);

  const refreshCapsules = async () => {
    const list = await getAllCapsulesFromDB();
    setCapsules(list);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Watch preset unlocks
  useEffect(() => {
    if (durationPreset === "custom") return;
    const now = new Date();
    const presetTimes = {
      "1-month": new Date(now.setMonth(now.getMonth() + 1)),
      "6-months": new Date(now.setMonth(now.getMonth() + 6)),
      "1-year": new Date(now.setFullYear(now.getFullYear() + 1)),
      "3-years": new Date(now.setFullYear(now.getFullYear() + 3)),
      "5-years": new Date(now.setFullYear(now.getFullYear() + 5)),
      "10-years": new Date(now.setFullYear(now.getFullYear() + 10)),
    };
    const targetDate = presetTimes[durationPreset];
    if (targetDate) {
      // Local time formatting for datetime-local input
      const pad = (n) => String(n).padStart(2, "0");
      const formatted = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}T${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}`;
      setUnlockDate(formatted);
    }
  }, [durationPreset]);

  // Live Timer for Countdown Updates
  const [timeTicker, setTimeTicker] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- AUDIO RECORDING HANDLERS ---
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceRecordings((prev) => [
            ...prev,
            {
              id: getUUID(),
              name: `Voice Record - ${new Date().toLocaleTimeString()}`,
              type: "audio/webm",
              data: reader.result,
              duration: `${recordingDuration}s`,
            },
          ]);
          setRecordingDuration(0);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorderRef.current.start();
      setRecordingState("recording");
      setRecordingDuration(0);

      // Duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Audio visualizer setup
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      drawVisualizer();
      showToast("Voice recording started", "info");
    } catch (err) {
      console.error("Recording error:", err);
      showToast("Unable to access microphone.", "error");
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (recordingState === "idle" || !analyserRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        // Premium gradient style matching brand
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, "#fbbf24");
        grad.addColorStop(1, "#f59e0b");
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== "idle") {
      mediaRecorderRef.current.stop();
      clearInterval(durationIntervalRef.current);
      setRecordingState("idle");
      showToast("Voice recording saved", "success");
    }
  };

  // --- RICH TEXT HANDLERS ---
  const handleEditorInput = () => {
    if (editorRef.current) {
      setMessageHtml(editorRef.current.innerHTML);
    }
  };

  const executeEditorCommand = (command, value = null) => {
    if (typeof window !== "undefined") {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleEditorInput();
    }
  };

  const messageText = useMemo(() => {
    if (typeof window === "undefined") return "";
    const doc = new DOMParser().parseFromString(messageHtml, "text/html");
    return doc.body.textContent || "";
  }, [messageHtml]);

  const wordCount = useMemo(() => {
    return messageText.trim().split(/\s+/).filter(Boolean).length;
  }, [messageText]);

  const charCount = messageText.length;

  // --- FILE HANDLING ---
  const handleFileUpload = (e, type) => {
    const filesArray = Array.from(e.target.files);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "image") {
          setImages((prev) => [
            ...prev,
            { id: getUUID(), name: file.name, type: file.type, data: reader.result },
          ]);
        } else if (type === "audio") {
          setVoiceRecordings((prev) => [
            ...prev,
            { id: getUUID(), name: file.name, type: file.type, data: reader.result, duration: "Uploaded File" },
          ]);
        } else {
          setAttachments((prev) => [
            ...prev,
            { id: getUUID(), name: file.name, type: file.type, data: reader.result, size: formatBytes(file.size) },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast(`Uploaded ${filesArray.length} ${type}(s)`, "success");
  };

  // --- SAVE CAPSULE ---
  const handleSaveCapsule = async () => {
    if (!title.trim()) {
      showToast("Please enter a capsule title.", "error");
      return;
    }
    if (!messageHtml.trim() && images.length === 0 && voiceRecordings.length === 0 && attachments.length === 0) {
      showToast("Time capsules must contain a letter or at least one attachment.", "error");
      return;
    }
    if (!unlockDate) {
      showToast("Please select a valid unlock date.", "error");
      return;
    }
    if (new Date(unlockDate) <= new Date()) {
      showToast("Unlock date must be in the future.", "error");
      return;
    }
    if (isEncrypted && password && password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      const capsuleId = getUUID();
      const payload = JSON.stringify({
        messageHtml,
        images,
        voiceRecordings,
        attachments,
      });

      let encryptionResult;
      if (isEncrypted) {
        encryptionResult = await encryptData(payload, password || null);
      } else {
        // Safe standard encryption if password is not desired
        encryptionResult = await encryptData(payload, null);
      }

      // Store key in local storage if not password-protected
      if (!password && encryptionResult.autoKeyHex) {
        localStorage.setItem(`${KEY_PREFIX}${capsuleId}`, encryptionResult.autoKeyHex);
      }

      const newCapsule = {
        id: capsuleId,
        title: title.trim(),
        createdDate: new Date().toISOString(),
        unlockDate: new Date(unlockDate).toISOString(),
        ciphertext: encryptionResult.ciphertext,
        iv: encryptionResult.iv,
        salt: encryptionResult.salt,
        isPasswordProtected: !!password,
        hasCloudBackup: false,
        emailReminder: emailReminder,
        emailAddress: emailReminder ? emailAddress : null,
      };

      await saveCapsuleToDB(newCapsule);
      showToast("Your Digital Time Capsule is locked away!", "success");

      if (emailReminder) {
        showToast("Saving reminder in sheet...", "info");
        try {
          const res = await fetch("/api/digital-time-capsule/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              capsuleId,
              title: title.trim(),
              email: emailAddress,
              createdDate: new Date().toISOString(),
              unlockDate: new Date(unlockDate).toISOString(),
              reminderOffset: parseInt(reminderOffset, 10),
            }),
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to save cloud reminder");
          }
          showToast("Confirmation email requested!", "success");
        } catch (err) {
          console.error(err);
          showToast("Warning: Saved locally, but email reminder failed: " + err.message, "error");
        }
      }

      // Suggest downloading the calendar event
      triggerICSDownload(newCapsule);

      // Reset fields
      setTitle("");
      setMessageHtml("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      setImages([]);
      setVoiceRecordings([]);
      setAttachments([]);
      setUnlockDate("");
      setDurationPreset("1-year");
      setPassword("");
      setConfirmPassword("");
      setEmailReminder(false);
      setEmailAddress("");
      setReminderOffset("0");
      setStep(1);

      refreshCapsules();
      setView("home");
    } catch (e) {
      console.error(e);
      showToast("Error securing time capsule.", "error");
    }
  };

  // Trigger download of the ICS file
  const triggerICSDownload = (capsule) => {
    const icsContent = generateICS(capsule.title, capsule.unlockDate, capsule.createdDate);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${capsule.title.toLowerCase().replace(/\s+/g, "-")}-reminder.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded calendar reminder! Add it to your calendar app.", "info");
  };

  // --- DASHBOARD SEARCH & FILTERS ---
  const filteredCapsules = useMemo(() => {
    return capsules
      .filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(c.unlockDate).getFullYear().toString().includes(searchTerm);
        
        const now = new Date();
        const isLocked = new Date(c.unlockDate) > now;
        
        if (filterStatus === "locked") return matchesSearch && isLocked;
        if (filterStatus === "unlocked") return matchesSearch && !isLocked;
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") return new Date(b.createdDate) - new Date(a.createdDate);
        if (sortOrder === "oldest") return new Date(a.createdDate) - new Date(b.createdDate);
        if (sortOrder === "upcoming") return new Date(a.unlockDate) - new Date(b.unlockDate);
        return 0;
      });
  }, [capsules, searchTerm, filterStatus, sortOrder, timeTicker]);

  // --- UNLOCK EXPERIENCE HANDLERS ---
  const handleSelectCapsule = (capsule) => {
    setSelectedCapsule(capsule);
    setDecryptionPassword("");
    setDecryptionError("");
    setDecryptedPayload(null);
    
    // Check if auto-decryption key is locally stored
    const now = new Date();
    const isLocked = new Date(capsule.unlockDate) > now;
    
    if (isLocked) {
      setVaultState("locked");
      setView("vault");
      return;
    }

    const autoKey = localStorage.getItem(`${KEY_PREFIX}${capsule.id}`);
    if (!capsule.isPasswordProtected && autoKey) {
      // Auto decrypt right away
      attemptDecryption(capsule, null, autoKey);
    } else {
      setVaultState("locked");
      setView("vault");
    }
  };

  const handleUnlockClick = () => {
    if (selectedCapsule.isPasswordProtected && !decryptionPassword) {
      setDecryptionError("Password is required.");
      return;
    }
    attemptDecryption(selectedCapsule, decryptionPassword || null, null);
  };

  const attemptDecryption = async (capsule, pass, autoKey) => {
    try {
      setVaultState("dialing");
      
      // Artificial delay for vault animation feel
      await new Promise(r => setTimeout(r, 1200));
      
      const plaintext = await decryptData(
        capsule.ciphertext,
        capsule.iv,
        capsule.salt,
        pass,
        autoKey
      );

      const parsed = JSON.parse(plaintext);
      
      setVaultState("bolting");
      await new Promise(r => setTimeout(r, 800));
      
      setVaultState("opening");
      await new Promise(r => setTimeout(r, 1000));
      
      setDecryptedPayload(parsed);
      setVaultState("opened");
      showToast("Time Capsule decrypted successfully!", "success");
    } catch (e) {
      console.error(e);
      setVaultState("locked");
      setDecryptionError("Incorrect password or corrupted archive.");
    }
  };

  const deleteCapsule = async (id) => {
    if (confirm("Are you sure you want to delete this capsule forever? This action is irreversible.")) {
      await deleteCapsuleFromDB(id);
      localStorage.removeItem(`${KEY_PREFIX}${id}`);
      showToast("Time Capsule deleted.", "info");
      setView("home");
      refreshCapsules();
    }
  };

  // --- EXPORTS ---
  const exportTxt = () => {
    if (!decryptedPayload) return;
    const text = `TITLE: ${selectedCapsule.title}
CREATED: ${new Date(selectedCapsule.createdDate).toLocaleString()}
UNLOCKED: ${new Date(selectedCapsule.unlockDate).toLocaleString()}

LETTER CONTENT:
--------------------------------------------------
${messageText}
--------------------------------------------------
Attachments Count: ${decryptedPayload.images?.length || 0} images, ${decryptedPayload.voiceRecordings?.length || 0} voice recordings, ${decryptedPayload.attachments?.length || 0} files.
Generated via BoringTools Digital Time Capsule.`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedCapsule.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = async () => {
    if (!decryptedPayload) return;
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();
      
      let y = height - 50;

      // Draw Title
      page.drawText("DIGITAL TIME CAPSULE LETTER", { x: 50, y, size: 20, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 30;

      // Draw Metadata
      page.drawText(`Title: ${selectedCapsule.title}`, { x: 50, y, size: 12, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      y -= 15;
      page.drawText(`Locked: ${new Date(selectedCapsule.createdDate).toLocaleString()}`, { x: 50, y, size: 10, font: font, color: rgb(0.5, 0.5, 0.5) });
      y -= 15;
      page.drawText(`Unlocked: ${new Date(selectedCapsule.unlockDate).toLocaleString()}`, { x: 50, y, size: 10, font: font, color: rgb(0.5, 0.5, 0.5) });
      y -= 30;

      // Draw Message text with word wrap
      const textToDraw = messageText || "No written letter content.";
      const words = textToDraw.split(" ");
      let currentLine = "";
      const lines = [];

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, 11);
        if (testWidth > width - 100) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Render lines & support pagination
      for (const line of lines) {
        if (y < 50) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = height - 50;
        }
        page.drawText(line, { x: 50, y, size: 11, font: font, color: rgb(0.15, 0.15, 0.15) });
        y -= 16;
      }

      // Embed attachments summary
      y -= 30;
      if (y < 80) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
      }
      page.drawText("ATTACHMENTS SUMMARY", { x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      y -= 18;
      page.drawText(`• Images: ${decryptedPayload.images?.length || 0}`, { x: 60, y, size: 10, font: font, color: rgb(0.3, 0.3, 0.3) });
      y -= 14;
      page.drawText(`• Recordings: ${decryptedPayload.voiceRecordings?.length || 0}`, { x: 60, y, size: 10, font: font, color: rgb(0.3, 0.3, 0.3) });
      y -= 14;
      page.drawText(`• Custom Files: ${decryptedPayload.attachments?.length || 0}`, { x: 60, y, size: 10, font: font, color: rgb(0.3, 0.3, 0.3) });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedCapsule.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("PDF letter generated", "success");
    } catch (e) {
      console.error(e);
      showToast("Error creating PDF", "error");
    }
  };

  const exportZip = () => {
    if (!decryptedPayload) return;
    const fileList = [];

    // Helper: extract raw uint8 array from base64 dataURI
    const base64ToUint8 = (dataURI) => {
      const base64Str = dataURI.split(",")[1];
      const binary = window.atob(base64Str);
      const arr = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        arr[i] = binary.charCodeAt(i);
      }
      return arr;
    };

    // Images
    (decryptedPayload.images || []).forEach((img, i) => {
      try {
        fileList.push({
          name: img.name || `image_${i + 1}.png`,
          content: base64ToUint8(img.data),
        });
      } catch (e) {}
    });

    // Voice Notes
    (decryptedPayload.voiceRecordings || []).forEach((rec, i) => {
      try {
        fileList.push({
          name: rec.name || `voice_recording_${i + 1}.webm`,
          content: base64ToUint8(rec.data),
        });
      } catch (e) {}
    });

    // Attachments
    (decryptedPayload.attachments || []).forEach((file, i) => {
      try {
        fileList.push({
          name: file.name || `file_${i + 1}.bin`,
          content: base64ToUint8(file.data),
        });
      } catch (e) {}
    });

    if (fileList.length === 0) {
      showToast("No attachments to package into ZIP.", "info");
      return;
    }

    try {
      const zipBlob = generateZipBlob(fileList);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${selectedCapsule.title.toLowerCase().replace(/\s+/g, "-")}-attachments.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("ZIP downloaded with all attachments!", "success");
    } catch (e) {
      console.error(e);
      showToast("Error bundling ZIP", "error");
    }
  };

  // Calculate elapsed progress percent
  const getElapsedPercent = (created, unlock) => {
    const createdTime = new Date(created).getTime();
    const unlockTime = new Date(unlock).getTime();
    const nowTime = new Date().getTime();

    if (nowTime >= unlockTime) return 100;
    const total = unlockTime - createdTime;
    const elapsed = nowTime - createdTime;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Securing connection & database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-sm font-semibold transition-all duration-300 animate-slide-up ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {view === "home" && (
          <div className="space-y-12">
            {/* HERO SECTION */}
            <div className="text-center max-w-2xl mx-auto space-y-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Digital <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Time Capsule</span>
              </h1>
              <p className="text-slate-500 text-lg sm:text-xl font-medium">
                Write a message to your future self and unlock it years later.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setView("create")}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-950/10 hover:shadow-xl transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Create Capsule
                </button>
                <a
                  href="#dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl shadow-sm hover:shadow transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                >
                  View Saved Capsules
                </a>
              </div>
            </div>

            {/* DASHBOARD / TIMELINE */}
            <div id="dashboard" className="pt-8 border-t border-slate-200 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Your Locked Memories</h2>
                  <p className="text-sm text-slate-500 font-medium">Chronological memory archives</p>
                </div>
                
                {/* FILTERS */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search capsules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 pr-4 py-4 border border-slate-200 rounded-xl bg-white text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 sm:w-64 transition shadow-sm"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Status Filter */}
                  <div className="w-40 sm:w-48">
                    <ThemedDropdown
                      value={filterStatus}
                      options={[
                        { value: "all", label: "All Statuses" },
                        { value: "locked", label: "Locked Only" },
                        { value: "unlocked", label: "Unlocked Only" },
                      ]}
                      onChange={setFilterStatus}
                      ariaLabel="Filter by status"
                    />
                  </div>

                  {/* Sort Filter */}
                  <div className="w-40 sm:w-48">
                    <ThemedDropdown
                      value={sortOrder}
                      options={[
                        { value: "newest", label: "Newest First" },
                        { value: "oldest", label: "Oldest First" },
                        { value: "upcoming", label: "Upcoming Unlocks" },
                      ]}
                      onChange={setSortOrder}
                      ariaLabel="Sort capsules"
                    />
                  </div>
                </div>
              </div>

              {/* TIMELINE LIST */}
              {filteredCapsules.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white space-y-4">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">No capsules found</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjustments to your search queries or status filters." 
                      : "Create your very first encrypted digital time capsule right now!"}
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <button
                      onClick={() => setView("create")}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition"
                    >
                      Create Capsule
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCapsules.map((capsule) => {
                    const now = new Date();
                    const unlock = new Date(capsule.unlockDate);
                    const isLocked = unlock > now;
                    const pct = getElapsedPercent(capsule.createdDate, capsule.unlockDate);
                    const countdown = getCountdown(capsule.unlockDate);

                    return (
                      <div
                        key={capsule.id}
                        onClick={() => handleSelectCapsule(capsule)}
                        className="group border border-slate-200 rounded-2xl bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition cursor-pointer flex flex-col justify-between space-y-6"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-500 transition line-clamp-2">
                              {capsule.title}
                            </h3>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
                              isLocked 
                                ? "bg-amber-50 text-amber-700 border border-amber-100" 
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}>
                              {isLocked ? "Locked" : "Unlocked"}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs font-medium text-slate-500">
                            <div className="flex justify-between">
                              <span>Locked:</span>
                              <span className="text-slate-800">{new Date(capsule.createdDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Unlocks:</span>
                              <span className="text-slate-800">{new Date(capsule.unlockDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* PROGRESS AND COUNTDOWN */}
                        <div className="space-y-4 border-t border-slate-50 pt-4">
                          {isLocked ? (
                            <div className="space-y-3">
                              {/* Progress bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xxs font-bold text-slate-400">
                                  <span>TIME ELAPSED</span>
                                  <span>{pct.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Live Countdown snippet */}
                              {countdown && (
                                <div className="grid grid-cols-5 gap-1 text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 tabular-nums">{countdown.years}</div>
                                    <div className="text-[9px] font-semibold text-slate-400">Yr</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 tabular-nums">{countdown.months}</div>
                                    <div className="text-[9px] font-semibold text-slate-400">Mo</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 tabular-nums">{countdown.days}</div>
                                    <div className="text-[9px] font-semibold text-slate-400">Dy</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 tabular-nums">{countdown.hours}</div>
                                    <div className="text-[9px] font-semibold text-slate-400">Hr</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 tabular-nums">{countdown.minutes}</div>
                                    <div className="text-[9px] font-semibold text-slate-400">Min</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                              <span className="text-emerald-500 shrink-0">
                                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-emerald-800">READY TO UNLOCK</h4>
                                <p className="text-[10px] font-medium text-emerald-600">Reveal your hidden message now</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATOR VIEW */}
        {view === "create" && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-lg p-6 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Create Time Capsule</h2>
                <p className="text-sm text-slate-500 font-medium">Drafting step {step} of 4</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to discard your draft?")) {
                    setView("home");
                    setStep(1);
                  }
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <div className={`h-1.5 rounded-full transition-colors duration-300 ${
                    step >= num ? "bg-amber-500" : "bg-slate-100"
                  }`} />
                  <span className={`hidden sm:inline text-xxs font-bold uppercase tracking-wider ${
                    step === num ? "text-amber-600" : "text-slate-400"
                  }`}>
                    {num === 1 ? "Letter" : num === 2 ? "Media" : num === 3 ? "Lock Date" : "Privacy"}
                  </span>
                </div>
              ))}
            </div>

            {/* STEP 1: TITLE & RICH TEXT LETTER */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <label htmlFor="capsule-title" className="block text-sm font-bold text-slate-800">Capsule Title</label>
                  <input
                    id="capsule-title"
                    type="text"
                    placeholder="E.g., Letter to myself in 5 years, Graduation Day..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800">Message Editor (Rich Text)</label>
                    <div className="flex items-center gap-2 text-xxs font-bold text-slate-400">
                      <span>{wordCount} Words</span>
                      <span>•</span>
                      <span>{charCount} Characters</span>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="border border-slate-200 border-b-0 rounded-t-xl bg-slate-50 p-2 flex flex-wrap gap-1 items-center">
                    <button
                      type="button"
                      onClick={() => executeEditorCommand("bold")}
                      className="p-2 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs w-8 h-8 flex items-center justify-center focus:outline-none"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => executeEditorCommand("italic")}
                      className="p-2 hover:bg-slate-200 rounded text-slate-700 italic text-xs w-8 h-8 flex items-center justify-center focus:outline-none"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => executeEditorCommand("underline")}
                      className="p-2 hover:bg-slate-200 rounded text-slate-700 underline text-xs w-8 h-8 flex items-center justify-center focus:outline-none"
                      title="Underline"
                    >
                      U
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => executeEditorCommand("insertUnorderedList")}
                      className="p-2 hover:bg-slate-200 rounded text-slate-700 text-xs w-8 h-8 flex items-center justify-center focus:outline-none"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => executeEditorCommand("insertOrderedList")}
                      className="p-2 hover:bg-slate-200 rounded text-slate-700 text-xs w-8 h-8 flex items-center justify-center focus:outline-none"
                      title="Numbered List"
                    >
                      1. List
                    </button>
                    <button
                      type="button"
                      onClick={() => executeEditorCommand("removeFormat")}
                      className="p-2 hover:bg-slate-200 rounded text-slate-500 text-xs w-8 h-8 flex items-center justify-center focus:outline-none"
                      title="Clear Formatting"
                    >
                      Clear
                    </button>
                  </div>

                  {/* ContentEditable Div */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    className="w-full min-h-[220px] p-4 border border-slate-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-800 prose max-w-none overflow-y-auto"
                    style={{ whiteSpace: "pre-wrap" }}
                    placeholder="Write a message to your future self..."
                  />
                </div>
              </div>
            )}

            {/* STEP 2: MEDIA ATTACHMENTS */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                {/* Voice recording section */}
                <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-800">Voice Message Recording</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {recordingState === "idle" ? (
                      <button
                        onClick={startRecording}
                        className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
                      >
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping shrink-0" />
                        Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
                      >
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0" />
                        Stop ({recordingDuration}s)
                      </button>
                    )}
                    {/* Visualizer Canvas */}
                    <canvas
                      ref={canvasRef}
                      width={250}
                      height={42}
                      className="bg-slate-100 rounded-xl border border-slate-200 w-full max-w-[250px] h-[42px]"
                    />
                  </div>
                </div>

                {/* Multiple upload tools */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Upload Image */}
                  <div className="border border-slate-200 hover:border-slate-300 rounded-2xl p-4 bg-white text-center space-y-3 relative transition">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "image")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="block text-xs font-bold text-slate-800">Add Images</span>
                  </div>

                  {/* Upload Audio */}
                  <div className="border border-slate-200 hover:border-slate-300 rounded-2xl p-4 bg-white text-center space-y-3 relative transition">
                    <input
                      type="file"
                      multiple
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, "audio")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <span className="block text-xs font-bold text-slate-800">Upload Audio Files</span>
                  </div>

                  {/* Upload File */}
                  <div className="border border-slate-200 hover:border-slate-300 rounded-2xl p-4 bg-white text-center space-y-3 relative transition">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e, "attachment")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </div>
                    <span className="block text-xs font-bold text-slate-800">Attach Document</span>
                  </div>
                </div>

                {/* PREVIEW DRAWER */}
                {(images.length > 0 || voiceRecordings.length > 0 || attachments.length > 0) && (
                  <div className="space-y-4 border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview Attachments</h4>
                    
                    {/* Images preview list */}
                    {images.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-600 block">Images ({images.length})</span>
                        <div className="flex flex-wrap gap-3">
                          {images.map((img) => (
                            <div key={img.id} className="relative w-20 h-20 border border-slate-200 rounded-xl overflow-hidden group">
                              <img src={img.data} alt="Thumbnail preview" className="w-full h-full object-cover" />
                              <button
                                onClick={() => setImages((prev) => prev.filter((i) => i.id !== img.id))}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio recording preview list */}
                    {voiceRecordings.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-600 block">Voice recordings ({voiceRecordings.length})</span>
                        <div className="space-y-2">
                          {voiceRecordings.map((rec) => (
                            <div key={rec.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                              <div className="flex items-center gap-2 truncate">
                                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                <span className="text-xs font-semibold text-slate-800 truncate">{rec.name}</span>
                                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 shrink-0">{rec.duration}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <audio src={rec.data} controls className="h-6 w-40" />
                                <button
                                  onClick={() => setVoiceRecordings((prev) => prev.filter((r) => r.id !== rec.id))}
                                  className="text-slate-400 hover:text-red-500 transition p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom attachments preview list */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-600 block">Documents & Files ({attachments.length})</span>
                        <div className="space-y-2">
                          {attachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                              <div className="flex items-center gap-2 truncate">
                                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-semibold text-slate-800 truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{file.size}</span>
                              </div>
                              <button
                                onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== file.id))}
                                className="text-slate-400 hover:text-red-500 transition p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: UNLOCK DATE & PRESETS */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Quick Presets</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { value: "1-month", label: "1 Month" },
                      { value: "6-months", label: "6 Months" },
                      { value: "1-year", label: "1 Year" },
                      { value: "3-years", label: "3 Years" },
                      { value: "5-years", label: "5 Years" },
                      { value: "10-years", label: "10 Years" },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setDurationPreset(preset.value)}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                          durationPreset === preset.value
                            ? "bg-amber-500 border-amber-600 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDurationPreset("custom")}
                      className={`col-span-2 sm:col-span-1 py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                        durationPreset === "custom"
                          ? "bg-amber-500 border-amber-600 text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Custom Date
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="unlock-time" className="block text-sm font-bold text-slate-800">Precise Unlock Date & Time</label>
                  <input
                    id="unlock-time"
                    type="datetime-local"
                    value={unlockDate}
                    onChange={(e) => {
                      setUnlockDate(e.target.value);
                      setDurationPreset("custom");
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: PRIVACY & ENCRYPTION */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      id="encrypt-option"
                      type="checkbox"
                      checked={isEncrypted}
                      onChange={(e) => setIsEncrypted(e.target.checked)}
                      className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-slate-300 rounded"
                    />
                    <label htmlFor="encrypt-option" className="text-sm font-bold text-slate-800">
                      Encrypt Capsule (Highly Recommended)
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-8">
                    Uses Web Crypto API (AES-GCM 256-bit encryption). Plaintext is never stored on disk.
                  </p>
                </div>

                {isEncrypted && (
                  <div className="space-y-4 pl-8 border-l-2 border-slate-100">
                    <div className="space-y-2">
                      <label htmlFor="capsule-pwd" className="block text-xs font-bold text-slate-700">Password Protection (Optional)</label>
                      <input
                        id="capsule-pwd"
                        type="password"
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-slate-800"
                      />
                    </div>
                    {password && (
                      <div className="space-y-2">
                        <label htmlFor="confirm-pwd" className="block text-xs font-bold text-slate-700">Confirm Password</label>
                        <input
                          id="confirm-pwd"
                          type="password"
                          placeholder="Verify password..."
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-slate-800"
                        />
                      </div>
                    )}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 leading-relaxed font-semibold">
                      ⚠️ Zero-knowledge architecture: Passwords are never sent to a server. If forgotten, this capsule can never be decrypted!
                    </div>
                  </div>
                )}

                {/* Email Reminder setting */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <input
                      id="email-reminder-opt"
                      type="checkbox"
                      checked={emailReminder}
                      onChange={(e) => setEmailReminder(e.target.checked)}
                      className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-slate-300 rounded"
                    />
                    <label htmlFor="email-reminder-opt" className="text-sm font-bold text-slate-800">
                      Receive Email Reminder (Optional)
                    </label>
                  </div>
                  
                  {emailReminder && (
                    <div className="space-y-4 pl-8 border-l-2 border-slate-100">
                      <div className="space-y-2">
                        <label htmlFor="reminder-email" className="block text-xs font-bold text-slate-700">Email Address</label>
                        <input
                          id="reminder-email"
                          type="email"
                          placeholder="E.g., you@example.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-slate-800"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">When to remind me?</label>
                        <ThemedDropdown
                          value={reminderOffset}
                          options={[
                            { value: "0", label: "On the Unlock Day" },
                            { value: "1", label: "1 Day Before Unlock" },
                            { value: "3", label: "3 Days Before Unlock" },
                            { value: "7", label: "1 Week Before Unlock" },
                          ]}
                          onChange={(val) => setReminderOffset(val)}
                          ariaLabel="Select reminder time"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-800 font-medium">
                  <svg className="w-5 h-5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h5 className="font-bold">Local-Only Privacy Policy</h5>
                    <p className="mt-1 leading-relaxed">
                      All capsule contents remain completely locked in your browser's IndexedDB. No data will ever leave this device.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Nav Buttons */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition disabled:opacity-40"
              >
                Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center gap-1"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveCapsule}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition"
                >
                  Lock Capsule
                </button>
              )}
            </div>
          </div>
        )}

        {/* VAULT EXPERIENCE / READ CAPSULE */}
        {view === "vault" && selectedCapsule && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
            {/* Close */}
            <button
              onClick={() => {
                setView("home");
                setSelectedCapsule(null);
                setDecryptedPayload(null);
                setDecryptionPassword("");
                setDecryptionError("");
              }}
              className="absolute top-5 right-5 z-25 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* SECURED VAULT DOOR STATE */}
            {vaultState !== "opened" ? (
              <div className="text-center space-y-8 py-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{selectedCapsule.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    Locked on {new Date(selectedCapsule.createdDate).toLocaleDateString()}
                  </p>
                </div>

                {/* ANIMATED VAULT DOOR */}
                <div className="relative w-64 h-64 mx-auto bg-slate-800 rounded-full border-8 border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                  {/* Vault glows when opening */}
                  {["dialing", "bolting", "opening"].includes(vaultState) && (
                    <div className="absolute inset-0 bg-radial-gradient from-amber-400 to-transparent opacity-80 animate-pulse filter blur-md" />
                  )}

                  {/* Vault Door SVG */}
                  <svg
                    className={`w-48 h-48 transition-all duration-[1.2s] ${
                      vaultState === "dialing" ? "animate-spin" :
                      vaultState === "bolting" ? "scale-95" :
                      vaultState === "opening" ? "scale-0 rotate-[180deg] opacity-0" : "hover:rotate-12"
                    }`}
                    viewBox="0 0 200 200"
                    fill="none"
                  >
                    {/* Metal plate */}
                    <circle cx="100" cy="100" r="85" fill="#475569" stroke="#334155" strokeWidth="6" />
                    {/* Rivets */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <circle
                        key={angle}
                        cx={100 + 72 * Math.cos((angle * Math.PI) / 180)}
                        cy={100 + 72 * Math.sin((angle * Math.PI) / 180)}
                        r="3.5"
                        fill="#1e293b"
                      />
                    ))}
                    {/* Dial mark outlines */}
                    <circle cx="100" cy="100" r="50" stroke="#1e293b" strokeWidth="4" strokeDasharray="3 4" />
                    {/* Central Wheel Lock */}
                    <circle cx="100" cy="100" r="28" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
                    <circle cx="100" cy="100" r="8" fill="#f59e0b" />
                    {/* Spokes */}
                    {[0, 120, 240].map((angle) => (
                      <line
                        key={angle}
                        x1="100"
                        y1="100"
                        x2={100 + 44 * Math.cos((angle * Math.PI) / 180)}
                        y2={100 + 44 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#64748b"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                    ))}
                    {/* Handles */}
                    {[0, 120, 240].map((angle) => (
                      <circle
                        key={angle}
                        cx={100 + 44 * Math.cos((angle * Math.PI) / 180)}
                        cy={100 + 44 * Math.sin((angle * Math.PI) / 180)}
                        r="8"
                        fill="#f59e0b"
                        stroke="#b45309"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>

                {/* COUNTDOWN OR DECRYPTION FORM */}
                {new Date(selectedCapsule.unlockDate) > new Date() ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      Locked Capsule
                    </div>
                    
                    {/* Live countdown */}
                    {getCountdown(selectedCapsule.unlockDate) ? (
                      (() => {
                        const cd = getCountdown(selectedCapsule.unlockDate);
                        return (
                          <div className="flex justify-center gap-4 max-w-sm mx-auto">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 w-16 text-center shadow-inner">
                              <span className="block text-xl font-bold text-slate-800 tabular-nums">{cd.years}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Years</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 w-16 text-center shadow-inner">
                              <span className="block text-xl font-bold text-slate-800 tabular-nums">{cd.months}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Months</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 w-16 text-center shadow-inner">
                              <span className="block text-xl font-bold text-slate-800 tabular-nums">{cd.days}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Days</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 w-16 text-center shadow-inner">
                              <span className="block text-xl font-bold text-slate-800 tabular-nums">{cd.hours}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Hours</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : null}
                    
                    <p className="text-slate-400 text-xs">
                      This time capsule cannot be opened until{" "}
                      <span className="font-semibold text-slate-700">
                        {new Date(selectedCapsule.unlockDate).toLocaleString()}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-sm mx-auto">
                    {selectedCapsule.isPasswordProtected ? (
                      <div className="space-y-3">
                        <label htmlFor="decrypt-pwd" className="block text-sm font-bold text-slate-800">Password Required</label>
                        <input
                          id="decrypt-pwd"
                          type="password"
                          placeholder="Enter decryption password..."
                          value={decryptionPassword}
                          onChange={(e) => {
                            setDecryptionPassword(e.target.value);
                            setDecryptionError("");
                          }}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-slate-800 text-center"
                        />
                        {decryptionError && (
                          <span className="block text-xs font-bold text-red-600">{decryptionError}</span>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-semibold text-emerald-800">
                        No password set. Decryption key is retrieved automatically.
                      </div>
                    )}

                    <button
                      onClick={handleUnlockClick}
                      disabled={vaultState !== "locked"}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg transition disabled:opacity-40"
                    >
                      {vaultState === "dialing" ? "Dialing code..." :
                       vaultState === "bolting" ? "Unlocking bolts..." :
                       vaultState === "opening" ? "Opening vault..." : "Unlock Vault"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // UNLOCKED STATE - READING EXPERIENCE
              <div className="space-y-8 animate-fade-in py-4">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Opened Memory</span>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCapsule.title}</h3>
                    <p className="text-xxs font-bold text-slate-400">
                      Locked {new Date(selectedCapsule.createdDate).toLocaleDateString()} • Unlocked {new Date(selectedCapsule.unlockDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Delete Option */}
                  <button
                    onClick={() => deleteCapsule(selectedCapsule.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Time Capsule Forever"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Letter Body */}
                {decryptedPayload.messageHtml ? (
                  <div className="prose max-w-none bg-slate-50 border border-slate-100 p-6 rounded-2xl text-slate-800 leading-relaxed min-h-[150px] shadow-inner text-sm whitespace-pre-wrap">
                    <div dangerouslySetInnerHTML={{ __html: decryptedPayload.messageHtml }} />
                  </div>
                ) : (
                  <p className="italic text-slate-400 text-sm text-center">No written letter content.</p>
                )}

                {/* UNLOCKED MEDIA ATTACHMENTS */}
                {(decryptedPayload.images?.length > 0 || decryptedPayload.voiceRecordings?.length > 0 || decryptedPayload.attachments?.length > 0) && (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unlocked Attachments</h4>

                    {/* Unlocked Images */}
                    {decryptedPayload.images?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">Images ({decryptedPayload.images.length})</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {decryptedPayload.images.map((img) => (
                            <a
                              key={img.id}
                              href={img.data}
                              download={img.name}
                              className="relative aspect-square border border-slate-200 rounded-xl overflow-hidden group shadow-sm"
                            >
                              <img src={img.data} alt="Capsule photo" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unlocked recordings */}
                    {decryptedPayload.voiceRecordings?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">Voice recordings ({decryptedPayload.voiceRecordings.length})</span>
                        <div className="space-y-2.5">
                          {decryptedPayload.voiceRecordings.map((rec) => (
                            <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 gap-3">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-xs font-bold text-slate-800 truncate">{rec.name}</span>
                              </div>
                              <audio src={rec.data} controls className="h-8 w-full sm:w-64" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unlocked Documents */}
                    {decryptedPayload.attachments?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">Files & Documents ({decryptedPayload.attachments.length})</span>
                        <div className="space-y-2">
                          {decryptedPayload.attachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                              <span className="text-xs font-bold text-slate-800 truncate">{file.name}</span>
                              <a
                                href={file.data}
                                download={file.name}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xxs font-bold transition flex items-center gap-1 shrink-0"
                              >
                                Download ({file.size || "file"})
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EXPORTS BAR */}
                <div className="border-t border-slate-100 pt-6 space-y-3">
                  <span className="block text-xxs font-bold text-slate-400 uppercase tracking-widest text-center">Export Memory</span>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={exportTxt}
                      className="py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                      TXT
                    </button>
                    <button
                      onClick={exportPdf}
                      className="py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                      PDF Letter
                    </button>
                    <button
                      onClick={exportZip}
                      disabled={!(decryptedPayload.images?.length > 0 || decryptedPayload.voiceRecordings?.length > 0 || decryptedPayload.attachments?.length > 0)}
                      className="py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
                    >
                      ZIP Media
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global CSS Style Animations */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .text-xxs {
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  );
}
