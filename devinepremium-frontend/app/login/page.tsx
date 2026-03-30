"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveUserSession, type UserSession } from "@/lib/auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

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
          email,
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d7f3f9_0%,#f7fbfd_55%,#ffffff_100%)] px-4 py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-cyan-100 bg-white shadow-[0_30px_120px_rgba(13,13,26,0.12)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <section className="bg-[#0D0D1A] px-8 py-10 text-white sm:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Devine Premium
            </p>
            <h1 className="mt-6 max-w-md text-4xl font-black leading-tight">
              Customer login for order history and payment follow-up.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Sign in with email to view your orders, track status updates,
              and continue online payments from one place.
            </p>
            <div className="mt-10 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div>
                <p className="text-sm font-semibold text-white">
                  What you get inside your account
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Order history, live status, payment state, service totals,
                  and personal service details linked to your email.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-cyan-400/40 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300 hover:text-white"
              >
                Back to website
              </Link>
            </div>
          </section>

          <section className="px-8 py-10 sm:px-12">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-[#00B4D8] text-white"
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
                    ? "bg-[#7B2D8B] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Register
              </button>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {mode === "register" && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Full name
                    </span>
                    <input
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                      placeholder="Your full name"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Phone
                    </span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                      placeholder="+971..."
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                  placeholder="Enter your password"
                />
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
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#00B4D8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0097b7] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "login"
                    ? "Login to account"
                    : "Create account"}
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
                disabled={isGoogleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="text-base">G</span>
                {isGoogleLoading ? "Redirecting to Google..." : "Continue with Google"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
