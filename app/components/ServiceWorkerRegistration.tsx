"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // 1. Service Worker: Only register on live production domain (never localhost)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local");

      if (isLocalhost) {
        // Unregister service worker and clear caches to avoid stale chunks in development
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        const registerSW = () => {
          navigator.serviceWorker
            .register("/service-worker.js")
            .catch((err) => {
              console.debug("ServiceWorker registration note:", err);
            });
        };

        if (document.readyState === "complete") {
          registerSW();
        } else {
          window.addEventListener("load", registerSW);
        }
      }
    }

    // 2. Monitor Network Connection
    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (!isOffline && !justReconnected) return null;

  return (
    <aside
      aria-label="Network status banner"
      className="fixed bottom-4 left-4 z-50 pointer-events-none animate-fade-in"
    >
      {isOffline ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs border border-slate-700 shadow-xl backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Offline mode — Tools running from cache</span>
        </div>
      ) : justReconnected ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/90 text-emerald-200 text-xs border border-emerald-700 shadow-xl backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Back online</span>
        </div>
      ) : null}
    </aside>
  );
}
