"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const next = searchParams.get("next") || "/";

  const isSignUp = pathname === "/signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  // 1. Google OAuth
  const handleGoogleLogin = async () => {
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to sign in with Google" });
    }
  };

  // 2. Magic Link Email Login
  const handleMagicLink = async () => {
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address first." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setMessage({
        type: "success",
        text: `Magic login link sent to ${email}. Check your inbox!`,
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send magic link" });
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Reset
  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter your email above to reset password." });
      return;
    }
    setLoading(true);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/account/reset-password`,
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Password reset link sent to your email." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send reset link." });
    } finally {
      setLoading(false);
    }
  };

  // 4. Primary Email + Password Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    if (magicLinkMode) {
      handleMagicLink();
      return;
    }

    if (!password) {
      setMessage({ type: "error", text: "Please enter your password." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage({
          type: "success",
          text: "Account created successfully! Check your email to confirm and start using Boring Tools.",
        });
      } else {
        // Sign In Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // If user doesn't exist, automatically offer sign up
          if (signInError.message.includes("Invalid login credentials")) {
            const { error: autoSignUpError } = await supabase.auth.signUp({
              email,
              password,
            });
            if (autoSignUpError) throw autoSignUpError;
            setMessage({
              type: "success",
              text: "Account created! Check your email to confirm or sign in.",
            });
            setLoading(false);
            return;
          }
          throw signInError;
        }

        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Authentication failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-[#0f172a] flex flex-col justify-between p-6 sm:p-10 selection:bg-orange-100"
      style={
        {
          "--bg-page": "#ffffff",
          "--bg-surface": "#ffffff",
          "--text-primary": "#0f172a",
          "--text-muted": "#64748b",
          "--accent": "#ea580c",
          "--accent-hover": "#c2410c",
          "--border-subtle": "#e2e8f0",
        } as React.CSSProperties
      }
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP-LEFT CONTROL (Outside Centered Column)
          Small app logo/icon + back control, low visual weight, ~13px
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-900 transition font-normal"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Boring Tools</span>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CENTERED FORM COLUMN (max-w ~440px, flat layout)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[440px] mx-auto my-auto py-8 sm:py-12">
        
        {/* ─── 2. HEADER BLOCK (Two-line header) ─── */}
        <div className="text-left mb-6">
          {/* Line 1: Short bold tagline (~24-28px, bold, primary text) */}
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Simple tools. Serious speed.
          </h1>
          {/* Line 2: Muted gray, medium weight (~16-18px) */}
          <p className="text-base text-slate-500 font-medium mt-1">
            {isSignUp ? "Create your free Boring Tools account" : "Log in to your Boring Tools account"}
          </p>
        </div>

        {/* ─── 3. OAUTH / ALTERNATE-METHOD BUTTON STACK ─── */}
        <div className="space-y-2 mb-6">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-[44px] px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-xl border border-slate-200 transition shadow-none flex items-center justify-center relative active:scale-[0.99]"
          >
            <span className="absolute left-4 flex items-center">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27A7.2 7.2 0 014.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 000 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </span>
            <span>{isSignUp ? "Sign up with Google" : "Continue with Google"}</span>
          </button>

          {/* Magic Link / Passkey Button */}
          <button
            type="button"
            onClick={() => {
              setMagicLinkMode(!magicLinkMode);
              setMessage(null);
            }}
            className={`w-full h-[44px] px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-xl border transition shadow-none flex items-center justify-center relative active:scale-[0.99] ${
              magicLinkMode ? "border-[#ea580c] ring-1 ring-[#ea580c]" : "border-slate-200"
            }`}
          >
            <span className="absolute left-4 flex items-center text-slate-600">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </span>
            <span>{magicLinkMode ? "Using Passwordless Magic Link" : "Continue with Magic Link"}</span>
          </button>
          {magicLinkMode && (
            <p className="text-[11px] text-slate-500 text-center pt-1">
              Note: Magic link will be sent from <strong>Supabase</strong> (check Spam if needed).
            </p>
          )}
        </div>

        {/* ─── 1px Hairline Rule (No 'OR' text divider) ─── */}
        <hr className="my-6 border-slate-200" />

        {/* Message / Status Alert */}
        {message && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-xs leading-relaxed ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <p className="font-semibold">{message.text}</p>
            {message.type === "success" && (
              <div className="mt-2.5 pt-2.5 border-t border-emerald-200/80 text-[11px] text-emerald-800 space-y-1">
                <p className="font-medium text-emerald-900">
                  📩 <strong>Sender Information:</strong> Auth email is dispatched by <strong>Supabase</strong> (<code className="bg-emerald-100/80 text-emerald-900 px-1 py-0.5 rounded text-[10px]">noreply@mail.app.supabase.io</code>).
                </p>
                <p className="text-emerald-700">
                  If you don&apos;t see it in your primary inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── 4. EMAIL + PASSWORD FORM ─── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address Field */}
          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full h-[42px] px-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition"
            />
          </div>

          {/* Password Field (Only shown when not in pure Magic Link mode) */}
          {!magicLinkMode && (
            <div>
              <label className="block text-[12px] font-medium text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={!magicLinkMode}
                className="w-full h-[42px] px-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition"
              />

              {/* Forgot Password Link Directly Below Password Field (Only on Login) */}
              {!isSignUp && (
                <div className="mt-2 text-left">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[13px] text-[#ea580c] hover:underline font-normal transition"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── 5. PRIMARY SUBMIT BUTTON (ONLY FILLED ACCENT ELEMENT ON PAGE) ─── */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-semibold rounded-xl transition shadow-none flex items-center justify-center disabled:opacity-50 active:scale-[0.99]"
            >
              {loading
                ? "Processing..."
                : magicLinkMode
                ? "Send Magic Link"
                : isSignUp
                ? "Create account"
                : "Continue"}
            </button>
          </div>
        </form>

        {/* ─── Mode Switcher Link (Login <-> Sign Up) ─── */}
        <div className="text-center mt-5 text-[13px] text-slate-600">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <Link href="/login" className="text-[#ea580c] font-medium hover:underline">
                Log in
              </Link>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#ea580c] font-medium hover:underline">
                Sign up
              </Link>
            </span>
          )}
        </div>

        {/* ─── 6. LEGAL FOOTER TEXT ─── */}
        <p className="text-[12px] text-center text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto">
          By continuing, you agree to Boring Tools&apos;{" "}
          <Link href="/terms-of-service" className="text-[#ea580c] underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-[#ea580c] underline">
            Privacy Policy
          </Link>
          .
        </p>

      </div>

      {/* Empty bottom spacer for perfect vertical balance on tall monitors */}
      <div className="hidden sm:block" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginFormContent />
    </Suspense>
  );
}
