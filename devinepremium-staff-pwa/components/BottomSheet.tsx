"use client";

import { useEffect, useRef } from "react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "default" | "danger";
}

export function BottomSheet({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  variant = "default",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      document.documentElement.classList.add("scroll-lock");
      confirmRef.current?.focus();
    } else {
      document.documentElement.classList.remove("scroll-lock");
    }
    return () => {
      document.documentElement.classList.remove("scroll-lock");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab") {
        const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bottom-sheet-title"
      aria-describedby="bottom-sheet-message"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        role="presentation"
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl will-change-transform"
      >
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200" />
        <h3 id="bottom-sheet-title" className="text-lg font-bold text-slate-900">
          {title}
        </h3>
        <p id="bottom-sheet-message" className="mt-2 text-sm leading-relaxed text-slate-600">
          {message}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#152344]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className={
              variant === "danger"
                ? "flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                : "flex-1 rounded-2xl bg-[#152344] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#152344]"
            }
          >
            {loading ? "Updating..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
