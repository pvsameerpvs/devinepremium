"use client";

import { useEffect } from "react";

export default function StaffPwaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Staff PWA Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <img
          src="/logo.png"
          alt="Devine Premium"
          className="mx-auto mb-6 h-12 w-auto"
        />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl font-bold text-red-600">!</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please try again or contact your admin.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 w-full rounded-2xl bg-[#152344] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
