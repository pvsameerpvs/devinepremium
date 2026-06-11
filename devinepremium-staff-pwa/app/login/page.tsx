"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { saveStaffSession } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: string;
  };
}

export default function StaffLoginPage() {
  const { refreshSession, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#152344] to-[#223761]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await apiRequest<LoginResponse>("/api/v1/staff/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveStaffSession({
        token: result.token,
        user: result.user,
      });

      refreshSession();
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#152344] to-[#223761] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="Devine Premium"
            className="mx-auto mb-4 h-16 w-auto"
          />
          <h1 className="text-2xl font-black text-white">Staff Login</h1>
          <p className="mt-2 text-sm text-slate-300">
            Devine Premium Operations
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-700">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-700">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-[#152344] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
