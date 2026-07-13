"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

// Platform Configs
const PLATFORMS = [
  { id: "midjourney", label: "Midjourney" },
  { id: "chatgpt", label: "ChatGPT Images" },
  { id: "flux", label: "Flux" },
  { id: "stable_diffusion", label: "Stable Diffusion" },
  { id: "imagen", label: "Imagen" },
  { id: "kling", label: "Kling" },
  { id: "runway", label: "Runway" },
  { id: "pika", label: "Pika" },
  { id: "veo", label: "Veo" },
  { id: "hailuo", label: "Hailuo" },
  { id: "generic", label: "Generic" }
];

// Presets Configurations
const PRESETS = [
  {
    id: "christopher_nolan",
    label: "Christopher Nolan Inspired",
    data: {
      camera: { cameraType: "IMAX", lens: "85mm", shotType: "Medium", movement: "Slow Push In" },
      lighting: "Soft Light",
      style: "Hollywood",
      colorGrading: "Kodak",
      mood: "Tense",
      details: ["Film Grain", "Depth of Field", "Sharp Focus"]
    }
  },
  {
    id: "denis_villeneuve",
    label: "Denis Villeneuve Inspired",
    data: {
      camera: { cameraType: "IMAX", lens: "35mm", shotType: "Extreme Wide", movement: "Static" },
      lighting: "Volumetric",
      style: "Sci-Fi",
      colorGrading: "Muted",
      mood: "Mystical",
      details: ["Depth of Field", "Sharp Focus", "Bokeh"]
    }
  },
  {
    id: "zack_snyder",
    label: "Zack Snyder Inspired",
    data: {
      camera: { cameraType: "Cinema Camera", lens: "35mm", shotType: "Close Up", movement: "Dolly" },
      lighting: "Rim Light",
      style: "Dark",
      colorGrading: "High Contrast",
      mood: "Tense",
      details: ["Ultra Detailed", "8K", "Depth of Field"]
    }
  },
  {
    id: "studio_ghibli",
    label: "Studio Ghibli Inspired",
    data: {
      camera: { cameraType: "Cinema Camera", lens: "50mm", shotType: "Wide", movement: "Static" },
      lighting: "Soft Light",
      style: "Anime",
      colorGrading: "Warm",
      mood: "Dreamlike",
      details: ["Depth of Field", "Bokeh"]
    }
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    data: {
      camera: { cameraType: "Cinema Camera", lens: "35mm", shotType: "Medium", movement: "Tracking Shot" },
      lighting: "Cyberpunk",
      style: "Sci-Fi",
      colorGrading: "Teal Orange",
      mood: "Energetic",
      details: ["8K", "HDR", "Sharp Focus", "Bokeh"]
    }
  },
  {
    id: "blade_runner",
    label: "Blade Runner Inspired",
    data: {
      camera: { cameraType: "IMAX", lens: "50mm", shotType: "Wide", movement: "Slow Push In" },
      lighting: "Neon",
      style: "Noir",
      colorGrading: "Teal Orange",
      mood: "Dark",
      details: ["Film Grain", "Depth of Field", "Bokeh", "8K"]
    }
  },
  {
    id: "dune",
    label: "Dune Inspired",
    data: {
      camera: { cameraType: "IMAX", lens: "50mm", shotType: "Extreme Wide", movement: "Static" },
      lighting: "Volumetric",
      style: "Epic",
      colorGrading: "Muted",
      mood: "Mystical",
      details: ["Ultra Detailed", "Film Grain", "Depth of Field"]
    }
  },
  {
    id: "interstellar",
    label: "Interstellar Inspired",
    data: {
      camera: { cameraType: "IMAX", lens: "50mm", shotType: "Extreme Wide", movement: "Slow Push In" },
      lighting: "Moonlight",
      style: "Sci-Fi",
      colorGrading: "Kodak",
      mood: "Mystical",
      details: ["Film Grain", "Sharp Focus", "Depth of Field"]
    }
  },
  {
    id: "luxury_fashion",
    label: "Luxury Fashion",
    data: {
      camera: { cameraType: "Cinema Camera", lens: "85mm", shotType: "Close Up", movement: "Steadicam" },
      lighting: "Studio",
      style: "Luxury",
      colorGrading: "Low Contrast",
      mood: "Dreamlike",
      details: ["Sharp Focus", "Depth of Field", "Bokeh", "Natural Skin", "Realistic Eyes"]
    }
  },
  {
    id: "apple_commercial",
    label: "Apple Commercial",
    data: {
      camera: { cameraType: "Cinema Camera", lens: "50mm", shotType: "Medium", movement: "Fast Push" },
      lighting: "Studio",
      style: "Commercial",
      colorGrading: "High Contrast",
      mood: "Peaceful",
      details: ["Sharp Focus", "Depth of Field", "Bokeh", "Natural Skin", "Realistic Eyes"]
    }
  },
  {
    id: "national_geographic",
    label: "National Geographic",
    data: {
      camera: { cameraType: "DSLR", lens: "135mm", shotType: "Close Up", movement: "Static" },
      lighting: "Soft Light",
      style: "Documentary",
      colorGrading: "Fuji",
      mood: "Peaceful",
      details: ["Ultra Detailed", "Sharp Focus", "Depth of Field", "Natural Skin"]
    }
  },
  {
    id: "wildlife_documentary",
    label: "Wildlife Documentary",
    data: {
      camera: { cameraType: "DSLR", lens: "135mm", shotType: "Extreme Close Up", movement: "Tracking Shot" },
      lighting: "Soft Light",
      style: "Adventure",
      colorGrading: "Fuji",
      mood: "Peaceful",
      details: ["Ultra Detailed", "Sharp Focus", "Depth of Field", "Natural Skin", "Realistic Eyes"]
    }
  },
  {
    id: "epic_fantasy",
    label: "Epic Fantasy",
    data: {
      camera: { cameraType: "Cinema Camera", lens: "35mm", shotType: "Wide", movement: "Crane" },
      lighting: "Volumetric",
      style: "Fantasy",
      colorGrading: "Warm",
      mood: "Mystical",
      details: ["8K", "HDR", "Sharp Focus", "Depth of Field", "Bokeh"]
    }
  },
  {
    id: "anime_movie",
    label: "Anime Movie",
    data: {
      camera: { cameraType: "Cinema Camera", lens: "50mm", shotType: "Wide", movement: "Static" },
      lighting: "Sunset",
      style: "Anime",
      colorGrading: "Teal Orange",
      mood: "Dreamlike",
      details: ["Depth of Field", "Bokeh"]
    }
  },
  {
    id: "dark_thriller",
    label: "Dark Thriller",
    data: {
      camera: { cameraType: "Handheld", lens: "35mm", shotType: "Medium", movement: "Handheld" },
      lighting: "Moonlight",
      style: "Dark",
      colorGrading: "High Contrast",
      mood: "Tense",
      details: ["Film Grain", "Sharp Focus", "Depth of Field"]
    }
  }
];

const LOADING_STEPS = [
  "Deconstructing main subject & character traits...",
  "Rendering environmental location & weather dynamics...",
  "Calibrating camera perspective and lens focal distance...",
  "Applying cinematic lighting, color grade, and mood...",
  "Structuring prompt formatting rules for target platform..."
];

export default function CinematicPromptArchitect() {
  // Main Builder States
  const [subject, setSubject] = useState({
    mainSubject: "",
    characterName: "",
    age: "",
    gender: "",
    appearance: "",
    clothing: "",
    expression: "",
    pose: "",
    accessories: ""
  });

  const [scene, setScene] = useState({
    location: "",
    environment: "",
    weather: "",
    season: "",
    timeOfDay: "",
    background: "",
    props: "",
    architecture: ""
  });

  const [camera, setCamera] = useState({
    cameraType: "",
    lens: "",
    shotType: "",
    movement: ""
  });

  const [lighting, setLighting] = useState("");
  const [style, setStyle] = useState("");
  const [colorGrading, setColorGrading] = useState("");
  const [mood, setMood] = useState("");
  const [details, setDetails] = useState([]);
  const [platform, setPlatform] = useState("midjourney");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  
  const [negativePromptOptions, setNegativePromptOptions] = useState([
    "Low Quality", "Blur", "Bad Anatomy", "Watermark", "Logo", "Artifacts"
  ]);

  // Compiled Prompt Output (State-bound to final text box)
  const [compiledPrompt, setCompiledPrompt] = useState("");

  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Storage and UI States
  const [recentPresets, setRecentPresets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [expandedSection, setExpandedSection] = useState("subject");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const bottomSectionRef = useRef(null);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSubject = localStorage.getItem("cpa_subject");
        const savedScene = localStorage.getItem("cpa_scene");
        const savedCamera = localStorage.getItem("cpa_camera");
        const savedLighting = localStorage.getItem("cpa_lighting");
        const savedStyle = localStorage.getItem("cpa_style");
        const savedColorGrading = localStorage.getItem("cpa_colorGrading");
        const savedMood = localStorage.getItem("cpa_mood");
        const savedDetails = localStorage.getItem("cpa_details");
        const savedPlatform = localStorage.getItem("cpa_platform");
        const savedAspectRatio = localStorage.getItem("cpa_aspectRatio");
        const savedNegatives = localStorage.getItem("cpa_negatives");
        const savedRecentPresets = localStorage.getItem("cpa_recentPresets");
        const savedFavorites = localStorage.getItem("cpa_favorites");
        const savedPrompt = localStorage.getItem("cpa_compiledPrompt");

        if (savedSubject) setSubject(JSON.parse(savedSubject));
        if (savedScene) setScene(JSON.parse(savedScene));
        if (savedCamera) setCamera(JSON.parse(savedCamera));
        if (savedLighting) setLighting(savedLighting);
        if (savedStyle) setStyle(savedStyle);
        if (savedColorGrading) setColorGrading(savedColorGrading);
        if (savedMood) setMood(savedMood);
        if (savedDetails) setDetails(JSON.parse(savedDetails));
        if (savedPlatform) setPlatform(savedPlatform);
        if (savedAspectRatio) setAspectRatio(savedAspectRatio);
        if (savedNegatives) setNegativePromptOptions(JSON.parse(savedNegatives));
        if (savedRecentPresets) setRecentPresets(JSON.parse(savedRecentPresets));
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        if (savedPrompt) setCompiledPrompt(savedPrompt);
      } catch (e) {
        console.error("Error reading localStorage:", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cpa_subject", JSON.stringify(subject));
        localStorage.setItem("cpa_scene", JSON.stringify(scene));
        localStorage.setItem("cpa_camera", JSON.stringify(camera));
        localStorage.setItem("cpa_lighting", lighting);
        localStorage.setItem("cpa_style", style);
        localStorage.setItem("cpa_colorGrading", colorGrading);
        localStorage.setItem("cpa_mood", mood);
        localStorage.setItem("cpa_details", JSON.stringify(details));
        localStorage.setItem("cpa_platform", platform);
        localStorage.setItem("cpa_aspectRatio", aspectRatio);
        localStorage.setItem("cpa_negatives", JSON.stringify(negativePromptOptions));
        localStorage.setItem("cpa_recentPresets", JSON.stringify(recentPresets));
        localStorage.setItem("cpa_favorites", JSON.stringify(favorites));
        localStorage.setItem("cpa_compiledPrompt", compiledPrompt);
      } catch (e) {
        console.error("Error saving localStorage:", e);
      }
    }
  }, [subject, scene, camera, lighting, style, colorGrading, mood, details, platform, aspectRatio, negativePromptOptions, recentPresets, favorites, compiledPrompt]);

  // Show status toasts
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2000);
  };

  // Preset Handler
  const applyPreset = (presetObj) => {
    const { camera: pCam, lighting: pLit, style: pSty, colorGrading: pCol, mood: pMood, details: pDet } = presetObj.data;
    
    setCamera(prev => ({ ...prev, ...pCam }));
    setLighting(pLit);
    setStyle(pSty);
    setColorGrading(pCol);
    setMood(pMood);
    setDetails(pDet);
    
    // Add to recent presets (unique queue of 5)
    setRecentPresets(prev => {
      const filtered = prev.filter(p => p !== presetObj.label);
      return [presetObj.label, ...filtered].slice(0, 5);
    });

    triggerToast(`Applied Preset: ${presetObj.label}`, "info");
  };

  // Individual Subject/Scene input updates
  const updateSubject = (field, value) => {
    setSubject(prev => ({ ...prev, [field]: value }));
  };

  const updateScene = (field, value) => {
    setScene(prev => ({ ...prev, [field]: value }));
  };

  const updateCamera = (field, value) => {
    setCamera(prev => ({ ...prev, [field]: prev[field] === value ? "" : value }));
  };

  const toggleDetail = (item) => {
    setDetails(prev => {
      const updated = prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item];
      return updated;
    });
  };

  const toggleNegativeOption = (item) => {
    setNegativePromptOptions(prev => {
      const updated = prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item];
      return updated;
    });
  };

  // Compile Subject String (Rules-based)
  const subjectText = useMemo(() => {
    let parts = [];
    if (subject.characterName) {
      parts.push(subject.characterName);
    }
    
    let main = subject.mainSubject || "";
    if (main) {
      if (subject.age || subject.gender) {
        const ageGender = [subject.age, subject.gender].filter(Boolean).join(" ");
        main += `, a ${ageGender}`;
      }
      parts.push(main);
    } else if (subject.age || subject.gender) {
      const ageGender = [subject.age, subject.gender].filter(Boolean).join(" ");
      parts.push(`a ${ageGender}`);
    }

    if (subject.appearance) parts.push(`with ${subject.appearance}`);
    if (subject.clothing) parts.push(`wearing ${subject.clothing}`);
    if (subject.expression) parts.push(`with a ${subject.expression} expression`);
    if (subject.pose) parts.push(subject.pose);
    if (subject.accessories) parts.push(`with ${subject.accessories}`);

    return parts.join(", ");
  }, [subject]);

  // Compile Scene String (Rules-based)
  const sceneText = useMemo(() => {
    let parts = [];
    if (scene.location) parts.push(`set in ${scene.location}`);
    if (scene.environment) parts.push(scene.environment);
    
    if (scene.weather || scene.season || scene.timeOfDay) {
      const envDetails = [scene.weather, scene.season, scene.timeOfDay].filter(Boolean).join(" ");
      parts.push(envDetails);
    }
    
    if (scene.background) parts.push(`in the background ${scene.background}`);
    if (scene.props) parts.push(`featuring ${scene.props}`);
    if (scene.architecture) parts.push(`with ${scene.architecture} architecture`);
    
    return parts.join(", ");
  }, [scene]);

  // Compile Camera String (Rules-based)
  const cameraText = useMemo(() => {
    let parts = [];
    if (camera.shotType) parts.push(`${camera.shotType} shot`);
    if (camera.cameraType) parts.push(`shot on ${camera.cameraType}`);
    if (camera.lens) parts.push(`with ${camera.lens} lens`);
    if (camera.movement) parts.push(`${camera.movement} camera movement`);
    return parts.join(", ");
  }, [camera]);

  const styleText = style ? `${style} style` : "";
  const lightingText = lighting ? `${lighting} lighting` : "";
  const colorGradingText = colorGrading ? `${colorGrading} color grading` : "";
  const moodText = mood ? `${mood} mood` : "";
  const detailsText = details.length > 0 ? details.join(", ") : "";

  // Dynamic active segments array for highlight renderer
  const activeParts = useMemo(() => {
    const parts = {
      subject: subjectText,
      scene: sceneText,
      camera: cameraText,
      style: styleText,
      lighting: lightingText,
      color: colorGradingText,
      mood: moodText,
      details: detailsText
    };

    return Object.entries(parts)
      .filter(([_, val]) => val.trim() !== "")
      .map(([key, val]) => ({ key, val }));
  }, [subjectText, sceneText, cameraText, styleText, lightingText, colorGradingText, moodText, detailsText]);

  // Local rule-based compiler with platform-specific element ordering
  const compileLocalPrompt = () => {
    if (activeParts.length === 0) {
      return "";
    }

    switch (platform) {
      case "midjourney": {
        // MJ weights left-to-right: subject first, scene, details, style, lighting, color, mood, camera last
        const orderedParts = [subjectText, sceneText, detailsText, styleText, lightingText, colorGradingText, moodText, cameraText].filter(Boolean);
        let midText = orderedParts.join(", ");
        if (aspectRatio) {
          midText += ` --ar ${aspectRatio}`;
        }
        midText += " --style raw --v 6.0";
        return midText;
      }
      
      case "chatgpt": {
        let ch = "A cinematic ";
        if (style) ch += `${style} style `;
        ch += `photograph. `;
        
        if (subjectText) ch += `The subject is ${subjectText}. `;
        if (sceneText) ch += `The scene is ${sceneText}. `;
        if (cameraText) ch += `Captured as a ${cameraText}. `;
        if (lightingText) ch += `The lighting is ${lightingText}. `;
        if (colorGradingText || moodText) {
          const combined = [colorGradingText, moodText].filter(Boolean).join(" with a ");
          ch += `It features ${combined}. `;
        }
        if (detailsText) ch += `Outstanding details include ${detailsText}.`;
        
        return ch.trim().replace(/\s+/g, ' ');
      }
      
      case "flux": {
        // Flux: coherent natural sentences grouped by subject → scene → camera → aesthetics
        let fl = "";
        if (subjectText) fl += `Cinematic photo of ${subjectText}`;
        if (sceneText) fl += ` in ${sceneText}`;
        fl += ". ";
        
        let cameraDetails = [];
        if (camera.cameraType || camera.lens) {
          const cam = [camera.cameraType, camera.lens].filter(Boolean).join(" with a ");
          cameraDetails.push(`Shot on ${cam}`);
        }
        if (camera.shotType || camera.movement) {
          const comp = [camera.shotType, camera.movement].filter(Boolean).join(" and ");
          cameraDetails.push(`using a ${comp} composition`);
        }
        if (cameraDetails.length > 0) {
          fl += cameraDetails.join(", ") + ". ";
        }
        
        let moodStyleDetails = [];
        if (lightingText) moodStyleDetails.push(`${lightingText} lighting`);
        if (colorGradingText) moodStyleDetails.push(`${colorGradingText}`);
        if (styleText) moodStyleDetails.push(`${styleText} aesthetic`);
        if (moodText) moodStyleDetails.push(`${moodText}`);
        if (moodStyleDetails.length > 0) {
          fl += moodStyleDetails.join(", ") + ". ";
        }
        
        if (detailsText) {
          fl += `Outstanding details: ${detailsText}.`;
        }
        
        return fl.trim().replace(/\s+/g, ' ');
      }
      
      case "stable_diffusion": {
        // SD: left-to-right weighting, subject and scene tags first, quality boosters last
        let tags = ["masterpiece", "best quality", "cinematic photo"];
        if (subjectText) tags.push(subjectText);
        if (sceneText) tags.push(sceneText);
        if (detailsText) tags.push(detailsText);
        if (styleText) tags.push(styleText);
        if (lightingText) tags.push(lightingText);
        if (colorGradingText) tags.push(colorGradingText);
        if (moodText) tags.push(moodText);
        if (cameraText) tags.push(cameraText);
        return tags.join(", ");
      }
      
      case "imagen": {
        let im = "A professional cinematic photograph. ";
        if (subjectText) im += `Subject: ${subjectText}. `;
        if (sceneText) im += `Setting: ${sceneText}. `;
        if (cameraText) im += `Camera details: ${cameraText}. `;
        if (lightingText) im += `Lighting: ${lightingText}. `;
        if (colorGradingText || moodText) {
          const combined = [colorGradingText, moodText].filter(Boolean).join(", ");
          im += `Aesthetic accents: ${combined}. `;
        }
        if (detailsText) im += `Texture details: ${detailsText}.`;
        return im.trim().replace(/\s+/g, ' ');
      }
      
      // Video models: camera movement placed at the very beginning for kinetic priority
      case "kling": {
        let kl = "";
        if (camera.movement) kl += `${camera.movement} camera movement. `;
        kl += "Cinematic video of ";
        if (subjectText) kl += subjectText;
        if (sceneText) kl += ` in ${sceneText}`;
        if (camera.cameraType || camera.lens || camera.shotType) {
          const camInfo = [camera.shotType, camera.cameraType, camera.lens].filter(Boolean).join(", ");
          kl += `. Camera: ${camInfo}`;
        }
        if (lightingText || styleText || colorGradingText || moodText || detailsText) {
          const extra = [lightingText, styleText, colorGradingText, moodText, detailsText].filter(Boolean).join(", ");
          kl += `. Style attributes: ${extra}`;
        }
        return kl.trim().replace(/\s+/g, ' ');
      }
      
      case "runway": {
        let rw = "";
        if (camera.movement) rw += `${camera.movement} camera movement. `;
        rw += "Cinematic motion film: ";
        if (subjectText) rw += subjectText;
        if (sceneText) rw += ` in ${sceneText}`;
        if (camera.shotType || camera.cameraType || camera.lens) {
          const camInfo = [camera.shotType, camera.cameraType, camera.lens].filter(Boolean).join(", ");
          rw += `. Shot details: ${camInfo}`;
        }
        if (lightingText) rw += `, with ${lightingText}`;
        if (colorGradingText) rw += `, color graded as ${colorGradingText}`;
        if (moodText || styleText || detailsText) {
          const detailsVal = [moodText, styleText, detailsText].filter(Boolean).join(", ");
          rw += `. Atmosphere: ${detailsVal}`;
        }
        return rw.trim().replace(/\s+/g, ' ');
      }
      
      case "pika": {
        let pk = "";
        if (camera.movement) pk += `[camera: ${camera.movement}] `;
        pk += `Cinematic shot of ${subjectText || "a subject"}`;
        if (sceneText) pk += ` in ${sceneText}`;
        const pkExtra = [camera.shotType, lightingText, styleText, detailsText].filter(Boolean).join(", ");
        if (pkExtra) pk += `. ${pkExtra}`;
        return pk.trim().replace(/\s+/g, ' ');
      }
      
      case "veo": {
        let ve = "";
        if (camera.movement) ve += `${camera.movement} camera motion. `;
        ve += "A high-fidelity cinematic video of ";
        if (subjectText) ve += subjectText;
        if (sceneText) ve += ` in ${sceneText}`;
        ve += ". ";
        if (camera.cameraType || camera.lens || camera.shotType) {
          const camInfo = [camera.shotType, camera.cameraType, camera.lens].filter(Boolean).join(" shot on ");
          ve += `Captured as a ${camInfo}. `;
        }
        const veExtra = [lightingText, colorGradingText, moodText, styleText, detailsText].filter(Boolean).join(", ");
        if (veExtra) ve += `Visual components: ${veExtra}.`;
        return ve.trim().replace(/\s+/g, ' ');
      }
      
      case "hailuo": {
        let hl = "";
        if (camera.movement) hl += `${camera.movement} camera motion, `;
        if (subjectText) hl += subjectText;
        if (sceneText) hl += ` in ${sceneText}`;
        const hlExtra = [camera.shotType, lightingText, styleText, colorGradingText, moodText, detailsText].filter(Boolean).join(", ");
        if (hlExtra) hl += `, ${hlExtra}`;
        return hl.trim().replace(/\s+/g, ' ');
      }
      
      case "generic":
      default:
        return activeParts.map(p => p.val).join(", ");
    }
  };

  // Secure Backend API Call helper
  const fetchBackendAIResponse = async () => {
    const response = await fetch("/api/cinematic-ai-prompt-architect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subject,
        scene,
        camera,
        lighting,
        style,
        colorGrading,
        mood,
        details,
        platform,
        aspectRatio
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.prompt;
  };

  // Main Generator Action
  const generatePrompt = async () => {
    if (!subject.mainSubject.trim()) {
      triggerToast("Main Subject is required to generate a prompt!", "error");
      setExpandedSection("subject");
      return;
    }

    setIsGenerating(true);
    setLoadingStepIndex(0);

    // Start cycling loading steps
    const stepInterval = setInterval(() => {
      setLoadingStepIndex(prev => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 450);

    const startTime = Date.now();

    try {
      // Query serverless API endpoint
      const enhancedPrompt = await fetchBackendAIResponse();
      
      // Ensure the loading animation runs for at least 1.5 seconds for visual flow
      const elapsedTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, 1500 - elapsedTime);
      
      setTimeout(() => {
        clearInterval(stepInterval);
        setCompiledPrompt(enhancedPrompt);
        setIsGenerating(false);
        triggerToast("Cinematic AI Prompt Generated!");
        
        // Scroll to result section
        setTimeout(() => {
          bottomSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }, remainingDelay);

    } catch (err) {
      console.warn("AI Enhancement API failed, falling back to local compiler:", err);
      clearInterval(stepInterval);
      
      // Error fallback to local compiler
      const localPrompt = compileLocalPrompt();
      
      const elapsedTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, 1500 - elapsedTime);

      setTimeout(() => {
        setCompiledPrompt(localPrompt);
        setIsGenerating(false);
        triggerToast("Cinematic Prompt Compiled (Local Engine)!");
        
        setTimeout(() => {
          bottomSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }, remainingDelay);
    }
  };

  // Compile negative prompt text
  const negativePromptText = useMemo(() => {
    return negativePromptOptions.length > 0
      ? negativePromptOptions.join(", ")
      : "";
  }, [negativePromptOptions]);

  // Prompt Statistics Calculations with SD token limit awareness
  const stats = useMemo(() => {
    const text = compiledPrompt || "";
    const words = text.trim() === "" ? 0 : text.split(/\s+/).length;
    const chars = text.length;
    const tokens = Math.ceil(chars / 4);
    // SD CLIP encoder splits at ~75 tokens (words × 1.35 approximation)
    const sdEstTokens = Math.ceil(words * 1.35);
    const sdTokenWarning = platform === "stable_diffusion" && sdEstTokens > 75;
    return { words, chars, tokens, sdEstTokens, sdTokenWarning };
  }, [compiledPrompt, platform]);

  // ── Contradiction & Redundancy Auditor ──
  const auditorIssues = useMemo(() => {
    const issues = [];

    // Lighting / Time-of-day contradictions
    const nightTimes = ["midnight", "night"];
    const dayLighting = ["golden hour", "sunrise", "sunset"];
    if (scene.timeOfDay && lighting) {
      const tod = scene.timeOfDay.toLowerCase();
      const lit = lighting.toLowerCase();
      if (nightTimes.includes(tod) && dayLighting.includes(lit)) {
        issues.push({ type: "contradiction", message: `"${scene.timeOfDay}" conflicts with "${lighting}" lighting — this combination is physically impossible.`, penalty: 5 });
      }
      if (["dawn", "morning", "noon", "afternoon"].includes(tod) && lit === "moonlight") {
        issues.push({ type: "contradiction", message: `"${scene.timeOfDay}" conflicts with "Moonlight" lighting.`, penalty: 5 });
      }
    }

    // Studio lighting with outdoor locations
    if (lighting && lighting.toLowerCase() === "studio") {
      const outdoorKeywords = ["mountain", "forest", "desert", "ocean", "beach", "jungle", "field", "river", "lake", "cliff", "valley", "canyon", "wilderness"];
      const locationText = (scene.location || "").toLowerCase() + " " + (scene.environment || "").toLowerCase();
      const hasOutdoor = outdoorKeywords.some(kw => locationText.includes(kw));
      if (hasOutdoor) {
        issues.push({ type: "contradiction", message: `"Studio" lighting is indoor — your scene describes an outdoor location.`, penalty: 5 });
      }
    }

    // Redundancy detection: find words repeated across different input fields
    const allTextInputs = [
      subject.mainSubject, subject.characterName, subject.appearance,
      subject.clothing, subject.accessories, subject.expression, subject.pose,
      scene.location, scene.environment, scene.background, scene.props, scene.architecture,
      lighting, style, colorGrading, mood
    ].filter(Boolean).map(s => s.toLowerCase());

    // Extract significant words (3+ chars) and count across different fields
    const wordFieldMap = new Map();
    allTextInputs.forEach((fieldText, fieldIdx) => {
      const words = fieldText.split(/\s+/).filter(w => w.length >= 4);
      // Filter out common filler words
      const fillers = new Set(["with", "from", "that", "this", "into", "over", "under", "near", "like", "very", "more", "some"]);
      words.forEach(word => {
        if (fillers.has(word)) return;
        if (!wordFieldMap.has(word)) {
          wordFieldMap.set(word, new Set());
        }
        wordFieldMap.get(word).add(fieldIdx);
      });
    });

    const duplicatedWords = [];
    wordFieldMap.forEach((fieldSet, word) => {
      if (fieldSet.size > 1) {
        duplicatedWords.push(word);
      }
    });

    if (duplicatedWords.length > 0) {
      const displayWords = duplicatedWords.slice(0, 3).map(w => `"${w}"`).join(", ");
      issues.push({
        type: "redundancy",
        message: `${displayWords} ${duplicatedWords.length > 1 ? "are" : "is"} repeated across multiple fields. Try synonyms for variety.`,
        penalty: Math.min(10, duplicatedWords.length * 3)
      });
    }

    return issues;
  }, [subject, scene, lighting, style, colorGrading, mood]);

  // Total penalty from auditor issues
  const auditorPenalty = useMemo(() => {
    return auditorIssues.reduce((sum, issue) => sum + issue.penalty, 0);
  }, [auditorIssues]);

  // Prompt Quality Score Algorithms (with auditor penalty)
  const qualityScores = useMemo(() => {
    let sectionsFilledCount = 0;
    if (subject.mainSubject) sectionsFilledCount++;
    if (scene.location || scene.environment) sectionsFilledCount++;
    if (camera.cameraType || camera.lens) sectionsFilledCount++;
    if (lighting) sectionsFilledCount++;
    if (style) sectionsFilledCount++;
    if (colorGrading) sectionsFilledCount++;
    if (mood) sectionsFilledCount++;
    if (details.length > 0) sectionsFilledCount++;
    const completeness = Math.min(20, sectionsFilledCount * 2.5);

    let visualScore = 0;
    if (subject.mainSubject) visualScore += 10;
    if (subject.characterName) visualScore += 2;
    if (subject.age) visualScore += 2;
    if (subject.gender) visualScore += 2;
    if (subject.appearance) visualScore += 2;
    if (subject.clothing) visualScore += 2;
    if (subject.accessories) visualScore += 2;
    const visualDetail = Math.min(20, visualScore);

    let cameraScore = 0;
    if (camera.cameraType) cameraScore += 5;
    if (camera.lens) cameraScore += 5;
    if (camera.shotType) cameraScore += 5;
    if (camera.movement) cameraScore += 5;
    const cameraDetail = Math.min(20, cameraScore);

    const lightingDetail = lighting ? 15 : 0;

    let compScore = 0;
    if (camera.shotType) compScore += 7.5;
    if (camera.movement) compScore += 7.5;
    const composition = Math.min(15, compScore);

    let storyScore = 0;
    if (subject.expression) storyScore += 3;
    if (subject.pose) storyScore += 3;
    if (scene.weather || scene.timeOfDay) storyScore += 2;
    if (scene.props) storyScore += 2;
    const storytelling = Math.min(10, storyScore);

    const rawOverall = Math.round(completeness + visualDetail + cameraDetail + lightingDetail + composition + storytelling);
    const overall = Math.max(0, rawOverall - auditorPenalty);

    return {
      completeness: Math.round((completeness / 20) * 100),
      visualDetail: Math.round((visualDetail / 20) * 100),
      cameraDetail: Math.round((cameraDetail / 20) * 100),
      lightingDetail: Math.round((lightingDetail / 15) * 100),
      composition: Math.round((composition / 15) * 100),
      storytelling: Math.round((storytelling / 10) * 100),
      overall
    };
  }, [subject, scene, camera, lighting, style, colorGrading, mood, details, auditorPenalty]);

  // Smart Suggestions builder with Quick-Apply actions
  const suggestions = useMemo(() => {
    const list = [];
    if (!subject.mainSubject) {
      list.push({
        id: "subject",
        message: "Specify a main subject description to define the visual focus.",
        section: "subject",
        quickApply: null // requires manual text input
      });
    }
    if (!camera.cameraType) {
      list.push({
        id: "cameraType",
        message: "Add a camera model to establish texture. Quick-apply: Cinema Camera",
        section: "camera",
        quickApply: () => { updateCamera("cameraType", "Cinema Camera"); }
      });
    }
    if (!camera.lens) {
      list.push({
        id: "lens",
        message: "Focal lenses control composition scale & blur. Quick-apply: 50mm",
        section: "camera",
        quickApply: () => { updateCamera("lens", "50mm"); }
      });
    }
    if (!lighting) {
      list.push({
        id: "lighting",
        message: "Lighting defines contrast and mood. Quick-apply: Golden Hour",
        section: "lighting",
        quickApply: () => { setLighting("Golden Hour"); }
      });
    }
    if (!camera.movement && ["kling", "runway", "pika", "veo", "hailuo"].includes(platform)) {
      list.push({
        id: "movement",
        message: "Camera movement is crucial for video models. Quick-apply: Steadicam",
        section: "camera",
        quickApply: () => { updateCamera("movement", "Steadicam"); }
      });
    }
    if (!scene.weather && !scene.timeOfDay) {
      list.push({
        id: "weatherTime",
        message: "Weather or time of day provides a realistic setting. Quick-apply: Dusk",
        section: "scene",
        quickApply: () => { updateScene("timeOfDay", "Dusk"); }
      });
    }
    if (details.length === 0) {
      list.push({
        id: "details",
        message: "Visual details enrich image resolution. Quick-apply: Sharp Focus + Depth of Field",
        section: "details",
        quickApply: () => { setDetails(["Sharp Focus", "Depth of Field"]); }
      });
    }
    if (!style) {
      list.push({
        id: "style",
        message: "A cinematic style gives the prompt artistic direction. Quick-apply: Photorealistic",
        section: "style",
        quickApply: () => { setStyle("Photorealistic"); }
      });
    }
    if (!mood) {
      list.push({
        id: "mood",
        message: "Mood sets the emotional tone. Quick-apply: Emotional",
        section: "mood",
        quickApply: () => { setMood("Emotional"); }
      });
    }
    if (!colorGrading) {
      list.push({
        id: "colorGrading",
        message: "Color grading adds cinematic texture. Quick-apply: Teal Orange",
        section: "color",
        quickApply: () => { setColorGrading("Teal Orange"); }
      });
    }

    // Inject auditor issues as warnings
    auditorIssues.forEach((issue, idx) => {
      list.unshift({
        id: `auditor_${idx}`,
        message: `⚠ ${issue.message}`,
        section: null,
        quickApply: null,
        isWarning: true
      });
    });

    return list;
  }, [subject, scene, camera, lighting, style, mood, colorGrading, details, platform, auditorIssues]);

  // Clipboard Copiers
  const copyToClipboard = (text, typeLabel = "Prompt") => {
    if (!text || text.trim() === "") {
      triggerToast("Nothing to copy yet!", "error");
      return;
    }
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${typeLabel} to Clipboard!`);
  };

  // Text Downloaders
  const downloadTXT = () => {
    if (!compiledPrompt) {
      triggerToast("Prompt is empty!", "error");
      return;
    }
    
    let content = `=== CINEMATIC AI PROMPT ===\nTarget Platform: ${platform.toUpperCase()}\n\nPROMPT:\n${compiledPrompt}\n\n`;
    if (negativePromptText) {
      content += `NEGATIVE PROMPT:\n${negativePromptText}\n\n`;
    }
    content += `=== PROMPT STATISTICS ===\nWords: ${stats.words} | Characters: ${stats.chars} | Quality Score: ${qualityScores.overall}%\n`;

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `cinematic-prompt-${platform}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("Downloaded TXT File!");
  };

  const downloadMarkdown = () => {
    if (!compiledPrompt) {
      triggerToast("Prompt is empty!", "error");
      return;
    }

    let md = `# Cinematic Prompt Architect\n\n`;
    md += `* **Target AI Platform:** ${PLATFORMS.find(p => p.id === platform)?.label || platform}\n`;
    md += `* **Quality Score:** ${qualityScores.overall}%\n`;
    md += `* **Word Count:** ${stats.words} | **Characters:** ${stats.chars}\n\n`;
    md += `## Compiled Prompt\n\n\`\`\`text\n${compiledPrompt}\n\`\`\`\n\n`;
    if (negativePromptText) {
      md += `## Negative Prompt\n\n\`\`\`text\n${negativePromptText}\n\`\`\`\n\n`;
    }
    md += `## Technical Summary\n\n`;
    md += `* **Subject Details:** ${Object.entries(subject).filter(([_, v]) => v).map(([k, v]) => `*${k}*: ${v}`).join(", ") || "None"}\n`;
    md += `* **Scene & Location:** ${Object.entries(scene).filter(([_, v]) => v).map(([k, v]) => `*${k}*: ${v}`).join(", ") || "None"}\n`;
    md += `* **Camera Settings:** ${Object.entries(camera).filter(([_, v]) => v).map(([k, v]) => `*${k}*: ${v}`).join(", ") || "None"}\n`;
    md += `* **Lighting Setup:** ${lighting || "Not Specified"}\n`;
    md += `* **Cinematic Style:** ${style || "Not Specified"}\n`;
    md += `* **Color Grade:** ${colorGrading || "Not Specified"}\n`;
    md += `* **Mood:** ${mood || "Not Specified"}\n`;
    md += `* **Visual details:** ${details.join(", ") || "None"}\n`;

    const element = document.createElement("a");
    const file = new Blob([md], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `cinematic-prompt-${platform}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("Downloaded Markdown File!");
  };

  // Reset Everything
  const handleReset = () => {
    setSubject({
      mainSubject: "",
      characterName: "",
      age: "",
      gender: "",
      appearance: "",
      clothing: "",
      expression: "",
      pose: "",
      accessories: ""
    });
    setScene({
      location: "",
      environment: "",
      weather: "",
      season: "",
      timeOfDay: "",
      background: "",
      props: "",
      architecture: ""
    });
    setCamera({
      cameraType: "",
      lens: "",
      shotType: "",
      movement: ""
    });
    setLighting("");
    setStyle("");
    setColorGrading("");
    setMood("");
    setDetails([]);
    setPlatform("midjourney");
    setAspectRatio("16:9");
    setNegativePromptOptions(["Low Quality", "Blur", "Bad Anatomy", "Watermark", "Logo", "Artifacts"]);
    setCompiledPrompt("");
    triggerToast("Reset Prompt Architect!", "info");
  };

  // Save layout configuration as a local favorite preset (now includes platform & aspectRatio)
  const saveToFavorites = () => {
    if (!subject.mainSubject) {
      triggerToast("Add a main subject first before saving to favorites!", "error");
      return;
    }
    const newFavorite = {
      id: Date.now(),
      title: subject.mainSubject.slice(0, 30) + (subject.mainSubject.length > 30 ? "..." : ""),
      data: { subject, scene, camera, lighting, style, colorGrading, mood, details, platform, aspectRatio }
    };
    setFavorites(prev => [newFavorite, ...prev]);
    triggerToast("Saved configuration to Favorites!");
  };

  // Apply favorite (restores platform & aspectRatio if saved)
  const applyFavorite = (fav) => {
    setSubject(fav.data.subject);
    setScene(fav.data.scene);
    setCamera(fav.data.camera);
    setLighting(fav.data.lighting);
    setStyle(fav.data.style);
    setColorGrading(fav.data.colorGrading);
    setMood(fav.data.mood);
    setDetails(fav.data.details);
    if (fav.data.platform) setPlatform(fav.data.platform);
    if (fav.data.aspectRatio) setAspectRatio(fav.data.aspectRatio);
    triggerToast("Applied configuration from Favorites!", "info");
  };

  const removeFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => prev.filter(f => f.id !== id));
    triggerToast("Removed from Favorites", "info");
  };

  // Summaries helper
  const getSubjectSummary = () => {
    const parts = [subject.characterName, subject.mainSubject].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : "Optional main characters & features";
  };

  const getSceneSummary = () => {
    const parts = [scene.location, scene.timeOfDay].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : "Optional location, weather, props";
  };

  const getCameraSummary = () => {
    const parts = [camera.cameraType, camera.lens, camera.shotType].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : "Optional lenses, movements, camera types";
  };

  // SVG quality ring math
  const ringRadius = 36;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (qualityScores.overall / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[99999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border animate-slide-up bg-slate-900 border-slate-800 text-white">
          {toast.type === "success" && (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "info" && (
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Cinematic Compilation Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
            
            {/* Spinning cinematic rings */}
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Compiling Cinematic Prompt</h3>
              <p className="text-sm text-slate-400 h-10 px-6 font-medium animate-pulse">
                {LOADING_STEPS[loadingStepIndex]}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main card panel */}
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-7xl border border-slate-200 flex flex-col gap-6">
        
        {/* Tool Header */}
        <div className="flex flex-col items-center text-center gap-1 border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Cinematic AI Prompt Architect</h1>
          <p className="text-slate-500 max-w-2xl text-sm sm:text-base font-medium">
            Design highly immersive, structured cinematic prompts optimized by advanced LLMs on the server.
          </p>
        </div>

        {/* Dual column builder area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: PRESETS & BUILDER */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Style Presets Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Cinematic Style Presets
                </h3>
                <p className="text-xs text-slate-500">Apply a director or lighting setup instantly to configure fields</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className="text-left px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/30 text-slate-700 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion Cards container */}
            <div className="flex flex-col gap-4">
              
              {/* 1. SUBJECT */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "subject" ? null : "subject")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">1.</span>
                      <span className="font-bold text-slate-900">SUBJECT</span>
                    </div>
                    <span className="text-xs text-slate-400 font-normal truncate max-w-xs">{getSubjectSummary()}</span>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "subject" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "subject" && (
                  <div className="p-5 border-t border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Main Subject *</label>
                      <textarea
                        value={subject.mainSubject}
                        onChange={(e) => updateSubject("mainSubject", e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none min-h-[70px]"
                        placeholder="Define the primary subject, scene focal point, or main character..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Character Name</label>
                      <input
                        type="text"
                        value={subject.characterName}
                        onChange={(e) => updateSubject("characterName", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. John Wick, Sarah Connor"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Age</label>
                        <input
                          type="text"
                          value={subject.age}
                          onChange={(e) => updateSubject("age", e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                          placeholder="e.g. 35-year-old, elderly"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
                        <input
                          type="text"
                          value={subject.gender}
                          onChange={(e) => updateSubject("gender", e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                          placeholder="e.g. woman, man"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Appearance & Features</label>
                      <input
                        type="text"
                        value={subject.appearance}
                        onChange={(e) => updateSubject("appearance", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. piercing green eyes, windswept silver hair, battle scars"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clothing</label>
                      <input
                        type="text"
                        value={subject.clothing}
                        onChange={(e) => updateSubject("clothing", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. leather duster, futuristic chrome armor"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Accessories</label>
                      <input
                        type="text"
                        value={subject.accessories}
                        onChange={(e) => updateSubject("accessories", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. copper spectacles, glowing artifact"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expression</label>
                      <input
                        type="text"
                        value={subject.expression}
                        onChange={(e) => updateSubject("expression", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. determined grimace, faint smirk"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pose / Action</label>
                      <input
                        type="text"
                        value={subject.pose}
                        onChange={(e) => updateSubject("pose", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. standing in rain-slicked alleyway, crouched on roof"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SCENE */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "scene" ? null : "scene")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">2.</span>
                      <span className="font-bold text-slate-900">SCENE</span>
                    </div>
                    <span className="text-xs text-slate-400 font-normal truncate max-w-xs">{getSceneSummary()}</span>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "scene" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "scene" && (
                  <div className="p-5 border-t border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                      <input
                        type="text"
                        value={scene.location}
                        onChange={(e) => updateScene("location", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. dystopian cyberpunk alleyway, ancient jungle ruins"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Environment</label>
                      <input
                        type="text"
                        value={scene.environment}
                        onChange={(e) => updateScene("environment", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. dense mystical wood, high-tech command center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weather</label>
                      <div className="flex flex-wrap gap-1">
                        {["Sunny", "Rainy", "Snowy", "Foggy", "Stormy", "Wind-swept"].map(w => (
                          <button
                            key={w}
                            onClick={() => updateScene("weather", scene.weather === w ? "" : w)}
                            className={`px-2 py-1 text-xs rounded-lg border font-semibold transition ${scene.weather === w ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Season</label>
                      <div className="flex flex-wrap gap-1">
                        {["Spring", "Summer", "Autumn", "Winter"].map(s => (
                          <button
                            key={s}
                            onClick={() => updateScene("season", scene.season === s ? "" : s)}
                            className={`px-2 py-1 text-xs rounded-lg border font-semibold transition ${scene.season === s ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Time of Day</label>
                      <div className="flex flex-wrap gap-1">
                        {["Dawn", "Morning", "Noon", "Afternoon", "Dusk", "Twilight", "Midnight", "Night"].map(t => (
                          <button
                            key={t}
                            onClick={() => updateScene("timeOfDay", scene.timeOfDay === t ? "" : t)}
                            className={`px-2.5 py-1 text-xs rounded-lg border font-semibold transition ${scene.timeOfDay === t ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Architecture</label>
                      <input
                        type="text"
                        value={scene.architecture}
                        onChange={(e) => updateScene("architecture", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. brutalist concrete blocks, gothic cathedral arches"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Background details</label>
                      <input
                        type="text"
                        value={scene.background}
                        onChange={(e) => updateScene("background", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. towering neon screens, distant mountain peaks, traffic light trails"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Important Props</label>
                      <input
                        type="text"
                        value={scene.props}
                        onChange={(e) => updateScene("props", e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. steaming cup of tea, holographic projector, glowing sword"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. CAMERA */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "camera" ? null : "camera")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">3.</span>
                      <span className="font-bold text-slate-900">CAMERA</span>
                    </div>
                    <span className="text-xs text-slate-400 font-normal truncate max-w-xs">{getCameraSummary()}</span>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "camera" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "camera" && (
                  <div className="p-5 border-t border-slate-100 bg-white flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Camera Type</label>
                      <div className="flex flex-wrap gap-1">
                        {["Cinema Camera", "DSLR", "Drone", "Handheld", "IMAX"].map(type => (
                          <button
                            key={type}
                            onClick={() => updateCamera("cameraType", type)}
                            className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition ${camera.cameraType === type ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Camera Lens</label>
                      <div className="flex flex-wrap gap-1">
                        {["24mm", "35mm", "50mm", "85mm", "135mm", "Macro", "Fisheye"].map(lens => (
                          <button
                            key={lens}
                            onClick={() => updateCamera("lens", lens)}
                            className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition ${camera.lens === lens ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            {lens}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shot Type</label>
                      <div className="flex flex-wrap gap-1">
                        {["Extreme Wide", "Wide", "Medium", "Close Up", "Extreme Close Up", "Overhead", "POV", "Tracking Shot", "Orbit Shot"].map(shot => (
                          <button
                            key={shot}
                            onClick={() => updateCamera("shotType", shot)}
                            className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition ${camera.shotType === shot ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            {shot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Camera Movement</label>
                      <div className="flex flex-wrap gap-1">
                        {["Static", "Dolly", "Crane", "Steadicam", "Drone", "Slow Push In", "Fast Push", "Tilt", "Pan", "Zoom"].map(mov => (
                          <button
                            key={mov}
                            onClick={() => updateCamera("movement", mov)}
                            className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition ${camera.movement === mov ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            {mov}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. LIGHTING */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "lighting" ? null : "lighting")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">4.</span>
                    <span className="font-bold text-slate-900">LIGHTING</span>
                    {lighting && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 ml-2">{lighting}</span>}
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "lighting" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "lighting" && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Golden Hour", "Blue Hour", "Sunset", "Sunrise", "Soft Light", "Hard Light", "Volumetric", "Studio", "Neon", "Candle Light", "Moonlight", "Cyberpunk", "Backlight", "Rim Light"].map(lit => (
                        <button
                          key={lit}
                          onClick={() => setLighting(lighting === lit ? "" : lit)}
                          className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${lighting === lit ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                        >
                          {lit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. CINEMATIC STYLE */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "style" ? null : "style")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">5.</span>
                    <span className="font-bold text-slate-900">CINEMATIC STYLE</span>
                    {style && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 ml-2">{style}</span>}
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "style" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "style" && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Photorealistic", "Hollywood", "Sci-Fi", "Fantasy", "Anime", "Dark", "Noir", "Vintage", "Documentary", "Horror", "Adventure", "Epic", "Minimal", "Luxury", "Commercial"].map(sty => (
                        <button
                          key={sty}
                          onClick={() => setStyle(style === sty ? "" : sty)}
                          className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${style === sty ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                        >
                          {sty}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. COLOR GRADING */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "color" ? null : "color")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">6.</span>
                    <span className="font-bold text-slate-900">COLOR GRADING</span>
                    {colorGrading && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 ml-2">{colorGrading}</span>}
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "color" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "color" && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Kodak", "Fuji", "Teal Orange", "Warm", "Cool", "Muted", "High Contrast", "Low Contrast", "Black & White", "Cinematic HDR"].map(col => (
                        <button
                          key={col}
                          onClick={() => setColorGrading(colorGrading === col ? "" : col)}
                          className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${colorGrading === col ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 7. MOOD */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "mood" ? null : "mood")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">7.</span>
                    <span className="font-bold text-slate-900">MOOD</span>
                    {mood && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 ml-2">{mood}</span>}
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "mood" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "mood" && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Emotional", "Peaceful", "Tense", "Hopeful", "Dark", "Happy", "Sad", "Dreamlike", "Mystical", "Energetic"].map(m => (
                        <button
                          key={m}
                          onClick={() => setMood(mood === m ? "" : m)}
                          className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${mood === m ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 8. DETAILS */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "details" ? null : "details")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">8.</span>
                    <span className="font-bold text-slate-900">DETAILS</span>
                    {details.length > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 ml-2">{details.length} Selected</span>}
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "details" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "details" && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["Ultra Detailed", "8K", "HDR", "Hyper Realistic", "Sharp Focus", "Depth of Field", "Bokeh", "Film Grain", "Natural Skin", "Realistic Eyes"].map(det => {
                        const active = details.includes(det);
                        return (
                          <button
                            key={det}
                            onClick={() => toggleDetail(det)}
                            className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-between transition ${active ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                          >
                            <span>{det}</span>
                            {active && (
                              <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 9. AI PLATFORM */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "platform" ? null : "platform")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">9.</span>
                    <span className="font-bold text-slate-900">AI PLATFORM</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 ml-2">
                      {PLATFORMS.find(p => p.id === platform)?.label}
                    </span>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "platform" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "platform" && (
                  <div className="p-5 border-t border-slate-100 bg-white flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Platform</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PLATFORMS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setPlatform(p.id); }}
                            className={`text-left px-3 py-2.5 text-xs font-bold rounded-xl border transition ${platform === p.id ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {platform === "midjourney" && (
                      <div className="border-t border-slate-100 pt-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aspect Ratio (MJ Parameter)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["16:9", "9:16", "1:1", "4:3", "3:2", "21:9"].map(ar => (
                            <button
                              key={ar}
                              onClick={() => { setAspectRatio(ar); }}
                              className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition ${aspectRatio === ar ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                              {ar}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* NEGATIVE PROMPT */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "negative" ? null : "negative")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">NEGATIVE PROMPT</span>
                    {negativePromptOptions.length > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 ml-2">{negativePromptOptions.length} Tags</span>}
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "negative" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "negative" && (
                  <div className="p-5 border-t border-slate-100 bg-white flex flex-col gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["Low Quality", "Blur", "Extra Fingers", "Bad Anatomy", "Text", "Watermark", "Logo", "Artifacts", "Oversaturated", "Noise", "Duplicate Objects"].map(neg => {
                        const active = negativePromptOptions.includes(neg);
                        return (
                          <button
                            key={neg}
                            onClick={() => toggleNegativeOption(neg)}
                            className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-between transition ${active ? "bg-slate-200 border-slate-350 text-slate-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                          >
                            <span>{neg}</span>
                            {active && (
                              <svg className="w-3.5 h-3.5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {negativePromptText && (
                      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                        <div className="text-xs text-slate-600 font-mono break-all line-clamp-2 select-all flex-1">{negativePromptText}</div>
                        <button
                          onClick={() => copyToClipboard(negativePromptText, "Negative Prompt")}
                          className="shrink-0 text-xs px-2.5 py-1.5 font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
                        >
                          Copy Tags
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FAVORITE SETTINGS PANEL */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "favorites" ? null : "favorites")}
                  className="w-full flex items-center justify-between p-4 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">MY FAVORITES</span>
                    {favorites.length > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 ml-2">{favorites.length} Saved</span>}
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === "favorites" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === "favorites" && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    {favorites.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2">
                        <span>No saved prompts yet. Click the Save Favorite button below after compiling a prompt.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {favorites.map((fav) => (
                          <div
                            key={fav.id}
                            onClick={() => applyFavorite(fav)}
                            className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/10 cursor-pointer transition text-left"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 truncate max-w-xs">{fav.title}</span>
                              <span className="text-[10px] text-slate-400">Saved: {new Date(fav.id).toLocaleDateString()}</span>
                            </div>
                            <button
                              onClick={(e) => removeFavorite(e, fav.id)}
                              className="px-2 py-1 text-[10px] font-bold border border-slate-200 bg-white hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Core Prominent Generation Trigger Button */}
            <div className="mt-4 p-4 border border-amber-200 bg-amber-50/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-800">All set with the options?</h4>
                <p className="text-xs text-slate-500 font-semibold">Click to generate a custom-optimized cinematic AI prompt</p>
              </div>
              <button
                onClick={generatePrompt}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl transition shadow-md hover:shadow-lg transform hover:-translate-y-px flex items-center justify-center shrink-0 animate-pulse"
              >
                Generate Cinematic Prompt
              </button>
            </div>

          </div>

          {/* RIGHT SIDE: LIVE PREVIEW & SCORES (STICKY) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-20 h-fit">
            
            {/* Live Preview Panel */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex flex-col gap-4 shadow-sm">
              <div className="border-b border-slate-200/60 pb-2.5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Structured Config Preview
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                {activeParts.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs italic bg-white border border-slate-200/80 rounded-xl">
                    Add a main subject description in the builder to see preview configurations...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 leading-relaxed text-sm p-4 border border-slate-200 bg-white rounded-xl max-h-56 overflow-y-auto pr-1">
                    {activeParts.map((part) => {
                      let colorClass = "text-slate-800 bg-slate-50 border-slate-200";
                      if (part.key === "subject") colorClass = "text-amber-800 bg-amber-50 border-amber-100";
                      else if (part.key === "scene") colorClass = "text-emerald-800 bg-emerald-50 border-emerald-100";
                      else if (part.key === "camera") colorClass = "text-blue-800 bg-blue-50 border-blue-100";
                      else if (part.key === "lighting") colorClass = "text-yellow-800 bg-yellow-50 border-yellow-100";
                      else if (part.key === "style") colorClass = "text-purple-800 bg-purple-50 border-purple-100";
                      else if (part.key === "color") colorClass = "text-rose-800 bg-rose-50 border-rose-100";
                      else if (part.key === "mood") colorClass = "text-indigo-800 bg-indigo-50 border-indigo-100";
                      else if (part.key === "details") colorClass = "text-slate-800 bg-slate-50 border-slate-200";

                      return (
                        <span
                          key={part.key}
                          className={`px-2 py-0.5 text-xs rounded border ${colorClass} inline-flex items-center gap-1 font-semibold hover:-translate-y-px transition cursor-pointer`}
                          onClick={() => setExpandedSection(part.key === "color" || part.key === "mood" ? "color" : part.key)}
                        >
                          <span className="text-[9px] opacity-60 uppercase font-extrabold">{part.key}:</span>
                          <span>{part.val}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Quality Score Panel */}
            <div className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm bg-white">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Prompt Quality Score</h3>
                <p className="text-[11px] text-slate-500">Completeness analysis based on cinematic attributes</p>
              </div>

              <div className="flex items-center gap-5">
                {/* Circle display */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      className="text-slate-100"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r={ringRadius}
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className={`${
                        qualityScores.overall >= 80 ? "text-emerald-500" : qualityScores.overall >= 50 ? "text-amber-500" : "text-rose-500"
                      } transition-all duration-500`}
                      strokeWidth="6"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r={ringRadius}
                      cx="40"
                      cy="40"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-extrabold text-slate-800">{qualityScores.overall}%</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
                  </div>
                </div>

                {/* Sub gauges */}
                <div className="flex-1 flex flex-col gap-1.5 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Subject Detail</span>
                      <span>{qualityScores.visualDetail}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${qualityScores.visualDetail}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Camera specs</span>
                      <span>{qualityScores.cameraDetail}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${qualityScores.cameraDetail}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Lighting setup</span>
                      <span>{qualityScores.lightingDetail}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${qualityScores.lightingDetail}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Composition & Motion</span>
                      <span>{qualityScores.composition}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${qualityScores.composition}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Suggestions Drawer */}
            {suggestions.length > 0 && (
              <div className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm bg-amber-50/20">
                <div className="flex items-center gap-2 text-amber-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider">Architect Recommendations</h4>
                </div>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                  {suggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className={`text-left p-2.5 text-xs rounded-xl border transition w-full flex items-center justify-between gap-2 ${
                        sug.isWarning
                          ? "bg-rose-50 border-rose-200 text-rose-800"
                          : "bg-white border-amber-100 hover:border-amber-300 text-slate-700"
                      }`}
                    >
                      <span
                        className={`flex-1 cursor-pointer ${!sug.isWarning ? "hover:text-amber-800" : ""}`}
                        onClick={() => { if (sug.section) setExpandedSection(sug.section); }}
                      >
                        {sug.message}
                      </span>
                      {sug.quickApply && (
                        <button
                          onClick={(e) => { e.stopPropagation(); sug.quickApply(); triggerToast("Quick-applied!", "info"); }}
                          className="shrink-0 px-2 py-1 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* BOTTOM SECTION: COMPILED PROMPT CARD */}
        <div ref={bottomSectionRef} className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col gap-4 mt-4 shadow-sm scroll-mt-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-3 gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Architect Compiled Prompt</h3>
              <p className="text-xs text-slate-500">Edit raw prompt below, then copy or export to your clipboard</p>
            </div>
            
            {/* Quick stats badges */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                Words: <strong className="text-slate-800">{stats.words}</strong>
              </span>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                Chars: <strong className="text-slate-800">{stats.chars}</strong>
              </span>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                Est. Tokens: <strong className="text-slate-800">{stats.tokens}</strong>
              </span>
              {stats.sdTokenWarning && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-700">
                  SD CLIP: ~{stats.sdEstTokens}/75 tokens ⚠ Prompt may be truncated
                </span>
              )}
            </div>
          </div>

          {/* Compiled Output Text Box (Editable Text Area) */}
          <textarea
            value={compiledPrompt}
            onChange={(e) => setCompiledPrompt(e.target.value)}
            className="w-full p-4 border border-slate-200 bg-white rounded-xl font-mono text-sm leading-relaxed text-slate-800 min-h-[120px] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none shadow-inner"
            placeholder="Fill in main subject details and click 'Generate Cinematic Prompt' above..."
          />

          {/* Large Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-2 border-t border-slate-200/60 pt-4">
            
            {/* Reset & Save Favorite */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
              >
                Reset Architect
              </button>
              <button
                onClick={saveToFavorites}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-150 text-amber-800 transition"
              >
                Save Favorite
              </button>
            </div>

            {/* Export and Copy options */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => copyToClipboard(compiledPrompt, "Prompt")}
                className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-px"
              >
                Copy Prompt
              </button>
              
              <div className="flex gap-1">
                <button
                  onClick={downloadTXT}
                  className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
                  title="Download as TXT"
                >
                  .TXT
                </button>
                <button
                  onClick={downloadMarkdown}
                  className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
                  title="Download as Markdown"
                >
                  .MD
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
