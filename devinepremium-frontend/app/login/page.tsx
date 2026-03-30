"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  getStoredUserSession,
  saveUserSession,
  type UserSession,
} from "@/lib/auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

interface AuthResponse extends UserSession {
  message: string;
}

function getRedirectTarget() {
  if (typeof window === "undefined") {
    return "/account";
  }

  const redirect = new URLSearchParams(window.location.search).get("redirect");

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/account";
  }

  return redirect;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [heroImageSrc, setHeroImageSrc] = useState("/log-in-image.jpg");

  useEffect(() => {
    const session = getStoredUserSession();

    if (session?.token) {
      router.replace(getRedirectTarget());
      return;
    }

    setIsCheckingSession(false);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";

      const session = await apiRequest<AuthResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(mode === "register" ? { fullName, phone } : {}),
        }),
      });

      saveUserSession({
        token: session.token,
        user: session.user,
      });
      setSuccess(session.message);
      router.push(getRedirectTarget());
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setSuccess("");

    if (!isSupabaseConfigured()) {
      setError(
        "Google auth is not configured yet. Add your Supabase URL and anon key in the frontend env file.",
      );
      return;
    }

    setIsGoogleLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
        getRedirectTarget(),
      )}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (googleError) {
      setError(
        googleError instanceof Error
          ? googleError.message
          : "Google sign-in failed.",
      );
      setIsGoogleLoading(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-[linear-gradient(145deg,#d6f4fa_0%,#f6fbfd_42%,#f7f0fb_100%)] px-4 py-16">
        <div className="mx-auto max-w-xl rounded-[34px] border border-white/70 bg-white/[0.88] p-10 text-center shadow-[0_36px_120px_rgba(13,13,26,0.12)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-600">
            Devine Premium
          </p>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Preparing your login
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Please wait while we check your account session.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[linear-gradient(145deg,#d6f4fa_0%,#f7fcfd_42%,#f8f2fb_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:h-dvh lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#00B4D8]/16 blur-3xl" />
        <div className="absolute right-[-6rem] top-[10rem] h-72 w-72 rounded-full bg-[#7B2D8B]/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[15%] h-80 w-80 rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white/[0.84] shadow-[0_42px_150px_rgba(13,13,26,0.12)] backdrop-blur lg:h-[calc(100dvh-2rem)] lg:max-h-[920px] xl:grid-cols-[1.02fr_0.98fr]">
        <section className="relative min-h-[280px] overflow-hidden bg-[#0D0D1A] lg:h-full">
          <Image
            src={heroImageSrc}
            alt="Devine Premium customer login"
            fill
            priority
            className="object-cover"
            onError={() => {
              if (heroImageSrc !== "/hero-cleaning.jpg") {
                setHeroImageSrc("/hero-cleaning.jpg");
              }
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,28,0.18)_0%,rgba(10,12,22,0.66)_48%,rgba(8,12,22,0.9)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,180,216,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(123,45,139,0.2),transparent_32%)]" />

          <div className="relative flex h-full flex-col justify-between px-6 py-6 text-white sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Customer login
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Back to website
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-300">
                Devine Premium
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-[3rem]">
                Login to your account
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-200">
                Track orders and continue payment from the same frontend website.
              </p>
            </div>
            <div />
          </div>
        </section>

        <section className="relative px-4 py-4 sm:px-6 sm:py-6 lg:flex lg:h-full lg:items-center lg:px-8 lg:py-8">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-6 lg:w-full lg:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Frontend account
              </span>
              <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-700">
                Login required
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">
              {mode === "login" ? "Sign in to continue" : "Create your account"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {mode === "login"
                ? "Open your customer account to track orders and continue payment."
                : "Register with your email so your future bookings and payment status stay linked."}
            </p>

            <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-[#00B4D8] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "register"
                    ? "bg-[#7B2D8B] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Register
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {mode === "register" && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Full name
                    </span>
                    <div className="flex rounded-[22px] border border-slate-200 bg-slate-50/80 p-1 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
                      <span className="flex items-center px-3 text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="w-full rounded-[18px] bg-transparent px-1 py-2.5 text-slate-900 outline-none"
                        placeholder="Your full name"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone
                    </span>
                    <div className="flex rounded-[22px] border border-slate-200 bg-slate-50/80 p-1 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
                      <span className="flex items-center px-3 text-slate-400">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="w-full rounded-[18px] bg-transparent px-1 py-2.5 text-slate-900 outline-none"
                        placeholder="+971..."
                      />
                    </div>
                  </label>
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </span>
                <div className="flex rounded-[22px] border border-slate-200 bg-slate-50/80 p-1 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
                  <span className="flex items-center px-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-[18px] bg-transparent px-1 py-2.5 text-slate-900 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </span>
                <div className="flex rounded-[22px] border border-slate-200 bg-slate-50/80 p-1 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
                  <span className="flex items-center px-3 text-slate-400">
                    <LockKeyhole className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-[18px] bg-transparent px-1 py-2.5 text-slate-900 outline-none"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="rounded-[18px] px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#00B4D8_0%,#0097b7_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(0,180,216,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_48px_rgba(0,180,216,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "login"
                      ? "Login to account"
                      : "Create account"}
                </span>
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isSubmitting}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-base text-slate-700">
                  G
                </span>
                {isGoogleLoading
                  ? "Redirecting to Google..."
                  : "Continue with Google"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
