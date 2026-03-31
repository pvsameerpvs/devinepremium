"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
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

async function getSessionFromCallbackUrl() {
  const supabase = getSupabaseBrowserClient();
  const currentUrl = new URL(window.location.href);
  const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));
  const authError =
    currentUrl.searchParams.get("error_description") ??
    currentUrl.searchParams.get("error") ??
    hashParams.get("error_description") ??
    hashParams.get("error");

  if (authError) {
    throw new Error(decodeURIComponent(authError.replace(/\+/g, " ")));
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (session?.access_token) {
    return session;
  }

  return new Promise<Session | null>((resolve, reject) => {
    const timeoutId = window.setTimeout(async () => {
      subscription.unsubscribe();

      try {
        const {
          data: { session: fallbackSession },
          error: fallbackError,
        } = await supabase.auth.getSession();

        if (fallbackError) {
          reject(fallbackError);
          return;
        }

        resolve(fallbackSession);
      } catch (error) {
        reject(error);
      }
    }, 1500);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!authSession?.access_token) {
        return;
      }

      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
      resolve(authSession);
    });
  });
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function completeGoogleLogin() {
      try {
        if (!isSupabaseConfigured()) {
          throw new Error(
            "Supabase Google auth is not configured on the frontend.",
          );
        }

        const session = await getSessionFromCallbackUrl();

        if (!session?.access_token) {
          throw new Error("Google session was not found after redirect.");
        }

        const backendSession = await apiRequest<AuthResponse>(
          "/api/v1/auth/google",
          {
            method: "POST",
            body: JSON.stringify({
              accessToken: session.access_token,
            }),
          },
        );

        saveUserSession({
          token: backendSession.token,
          user: backendSession.user,
        });

        router.replace(getRedirectTarget());
      } catch (callbackError) {
        if (!isActive) {
          return;
        }

        setError(
          callbackError instanceof Error
            ? callbackError.message
            : "Google login could not be completed.",
        );
      }
    }

    void completeGoogleLogin();

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d7f3f9_0%,#f7fbfd_55%,#ffffff_100%)] px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-cyan-100 bg-white p-10 shadow-[0_30px_120px_rgba(13,13,26,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-500">
          Devine Premium
        </p>
        <h1 className="mt-4 text-3xl font-black text-slate-900">
          Completing Google sign-in
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Please wait while we connect your Google account to your Devine Premium
          account.
        </p>

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <p className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
            Redirecting you to your account...
          </p>
        )}
      </div>
    </main>
  );
}
