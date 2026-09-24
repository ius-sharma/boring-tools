"use client";

import { useEffect } from "react";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_EVENT_NAME,
  CookieConsent,
} from "./ConsentBanner";

const ADSENSE_CLIENT_ID = "ca-pub-7528581776456991";
const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

export default function GoogleAdsenseLoader() {
  useEffect(() => {
    // Dynamically inject the AdSense script into document head
    const injectAdSenseScript = () => {
      if (typeof document === "undefined") return;

      // Avoid duplicate injections
      const existingScript = document.querySelector(
        `script[src*="adsbygoogle.js?client=${ADSENSE_CLIENT_ID}"]`
      );
      if (existingScript) return;

      const script = document.createElement("script");
      script.async = true;
      script.src = ADSENSE_SRC;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-ad-client", ADSENSE_CLIENT_ID);
      document.head.appendChild(script);
    };

    // Remove the AdSense script if user revokes marketing consent
    const removeAdSenseScript = () => {
      if (typeof document === "undefined") return;
      const existingScript = document.querySelector(
        `script[src*="adsbygoogle.js?client=${ADSENSE_CLIENT_ID}"]`
      );
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };

    // Check stored consent
    const evaluateConsent = () => {
      try {
        const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CookieConsent;
          if (parsed && parsed.marketing === true) {
            injectAdSenseScript();
            return;
          }
        }
      } catch (err) {
        console.error("AdSense consent evaluation error:", err);
      }
      removeAdSenseScript();
    };

    // Initial check on mount
    evaluateConsent();

    // Listen for consent update events dispatched by ConsentBanner
    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ consent?: CookieConsent } & Partial<CookieConsent>>;
      const consent = customEvent.detail?.consent || customEvent.detail;
      if (consent && consent.marketing === true) {
        injectAdSenseScript();
      } else {
        removeAdSenseScript();
      }
    };

    window.addEventListener(CONSENT_EVENT_NAME, handleConsentUpdate);
    return () => {
      window.removeEventListener(CONSENT_EVENT_NAME, handleConsentUpdate);
    };
  }, []);

  return null;
}
