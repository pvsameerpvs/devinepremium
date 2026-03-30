"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveAdminSession, type AdminSession } from "@/lib/auth";

interface LoginResponse extends AdminSession {
  message: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await apiRequest<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (session.user.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      saveAdminSession({
        token: session.token,
        user: session.user,
      });
      router.push("/dashboard");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#152344_0%,#223761_35%,#f8f3e8_36%,#fffdfa_100%)] px-4 py-16">
      <div className="mx-auto max-w-xl rounded-[34px] bg-white p-10 shadow-[0_40px_100px_rgba(15,23,42,0.16)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#A65A2A]">
          Secure admin login
        </p>
        <h1 className="mt-4 text-3xl font-black text-slate-900">
          Access the operations dashboard
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Use your admin email and password to manage bookings, users, and
          payment states.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Admin email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              placeholder="admin@devinepremium.com"
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
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              placeholder="Enter your password"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#152344] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Open dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
