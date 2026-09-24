"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_EVENT_NAME,
  CookieConsent,
} from "./ConsentBanner";

export default function AnalyticsLoader() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      try {
        const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CookieConsent;
          if (parsed && parsed.analytics === true) {
            setHasConsent(true);
            return;
          }
        }
      } catch {
        // Ignore parse error
      }
      setHasConsent(false);
    };

    evaluate();

    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ consent?: CookieConsent } & Partial<CookieConsent>>;
      const consent = customEvent.detail?.consent || customEvent.detail;
      setHasConsent(Boolean(consent?.analytics));
    };

    window.addEventListener(CONSENT_EVENT_NAME, handleConsentUpdate);
    return () => {
      window.removeEventListener(CONSENT_EVENT_NAME, handleConsentUpdate);
    };
  }, []);

  return (
    <Analytics
      beforeSend={(event) => {
        if (!hasConsent) {
          return null;
        }
        return event;
      }}
    />
  );
}
