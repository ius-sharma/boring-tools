"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";

export interface UserState {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface SubscriptionState {
  planTier: "free" | "pro_monthly" | "pro_yearly";
  status: string;
  currentPeriodEnd?: string;
}

export interface CreditsState {
  creditsBalance: number;
  bonusCredits: number;
  dailyQuotaLimit: number;
  totalAvailable: number;
  isPro: boolean;
  isGuest: boolean;
}

export interface UpgradeModalData {
  reason?: "GUEST_LIMIT_REACHED" | "CREDITS_EXHAUSTED" | "UNAUTHORIZED" | "RATE_LIMITED" | string;
  message?: string;
  isGuest?: boolean;
  remainingCredits?: number;
  toolName?: string;
  upgradeUrl?: string;
}

interface AuthContextValue {
  user: UserState | null;
  subscription: SubscriptionState | null;
  credits: CreditsState;
  loading: boolean;
  isAuthModalOpen: boolean;
  isUpgradeModalOpen: boolean;
  authModalMessage: string;
  upgradeModalData: UpgradeModalData | null;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
  openUpgradeModal: (data?: UpgradeModalData) => void;
  closeUpgradeModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const defaultCredits: CreditsState = {
  creditsBalance: 3,
  bonusCredits: 0,
  dailyQuotaLimit: 3,
  totalAvailable: 3,
  isPro: false,
  isGuest: true,
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  subscription: null,
  credits: defaultCredits,
  loading: true,
  isAuthModalOpen: false,
  isUpgradeModalOpen: false,
  authModalMessage: "",
  upgradeModalData: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  loginWithGoogle: async () => {},
  loginWithEmail: async () => ({}),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [credits, setCredits] = useState<CreditsState>(defaultCredits);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
  const [upgradeModalData, setUpgradeModalData] = useState<UpgradeModalData | null>(null);

  const supabase = createClient();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSubscription(data.subscription);
        setCredits(data.credits || defaultCredits);
      }
    } catch (e) {
      console.error("Failed to load user state:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const openAuthModal = (message?: string) => {
    setAuthModalMessage(message || "");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openUpgradeModal = (data?: UpgradeModalData) => {
    setUpgradeModalData(data || null);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalData(null);
  };

  useEffect(() => {
    refreshUser();

    // Listen to Supabase auth changes in real-time
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    // Listen for global quota exceeded events from any API call across any tool
    const handleQuotaExceededEvent = (event: Event) => {
      const customEvent = event as CustomEvent<UpgradeModalData>;
      openUpgradeModal(customEvent.detail);
    };

    window.addEventListener("boring-tools:quota-exceeded", handleQuotaExceededEvent);

    // Global fetch interceptor for 402 / 429 quota responses
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      try {
        const url = typeof args[0] === "string" ? args[0] : (args[0] instanceof URL ? args[0].pathname : (args[0] as Request)?.url || "");
        if (url.includes("/api/") && (response.status === 402 || response.status === 429)) {
          const cloned = response.clone();
          cloned.json().then((data) => {
            openUpgradeModal({
              reason: data?.error || (data?.isGuest ? "GUEST_LIMIT_REACHED" : "CREDITS_EXHAUSTED"),
              message: data?.message,
              isGuest: Boolean(data?.isGuest),
              remainingCredits: data?.remainingCredits ?? 0,
              upgradeUrl: data?.upgradeUrl || "/pricing",
            });
            refreshUser();
          }).catch(() => {
            openUpgradeModal();
          });
        }
      } catch {
        // Safe ignore
      }
      return response;
    };

    return () => {
      authSub?.unsubscribe();
      window.removeEventListener("boring-tools:quota-exceeded", handleQuotaExceededEvent);
      window.fetch = originalFetch;
    };
  }, [refreshUser, supabase]);

  const loginWithGoogle = async () => {
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google sign in error:", err.message);
    }
  };

  const loginWithEmail = async (email: string) => {
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || "Failed to send login link" };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSubscription(null);
      setCredits(defaultCredits);
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        credits,
        loading,
        isAuthModalOpen,
        isUpgradeModalOpen,
        authModalMessage,
        upgradeModalData,
        openAuthModal,
        closeAuthModal,
        openUpgradeModal,
        closeUpgradeModal,
        loginWithGoogle,
        loginWithEmail,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
