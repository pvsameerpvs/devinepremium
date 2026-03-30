"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import {
  getStoredUserSession,
  type UserSession,
} from "@/lib/auth";

interface PaymentCheckoutResponse {
  payment: {
    id: string;
    status: string;
    amount: number;
    method: string;
  };
  booking: {
    bookingReference: string;
    serviceTitle: string;
  };
}

function PaymentCheckoutContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const [message, setMessage] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getStoredUserSession());
    setIsReady(true);
  }, []);

  const loginRedirect = paymentId
    ? `/login?redirect=${encodeURIComponent(
        `/payment/checkout?paymentId=${paymentId}`,
      )}`
    : "/login?redirect=%2Faccount";

  const { data, error, isLoading, mutate } = useSWR(
    paymentId && session?.token
      ? [`/api/v1/payments/${paymentId}`, session.token]
      : null,
    ([path, token]) =>
      apiRequest<PaymentCheckoutResponse>(path, {
        method: "GET",
        token,
      }),
  );

  async function handleCompletePayment() {
    if (!paymentId || !session?.token) {
      return;
    }

    setIsPaying(true);
    setMessage("");

    try {
      const response = await apiRequest<{ message: string }>(
        `/api/v1/payments/${paymentId}/complete`,
        {
          method: "POST",
          token: session.token,
        },
      );

      setMessage(response.message);
      await mutate();
    } catch (submissionError) {
      setMessage(
        submissionError instanceof Error
          ? submissionError.message
          : "Payment could not be completed.",
      );
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0d0d1a_0%,#1a1531_35%,#f6fbfc_36%,#ffffff_100%)] px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-[34px] bg-white shadow-[0_40px_120px_rgba(13,13,26,0.2)]">
        <div className="rounded-t-[34px] bg-[#0D0D1A] px-8 py-10 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Online payment
          </p>
          <h1 className="mt-4 text-3xl font-black">
            Complete your order payment
          </h1>
        </div>

        <div className="space-y-6 px-8 py-8">
          {!paymentId && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
              Missing payment ID. Please reopen this page from your booking flow.
            </div>
          )}

          {!isReady && paymentId && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Checking your account session...
            </div>
          )}

          {isReady && !session && paymentId && (
            <div className="space-y-4 rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-amber-900">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Login required
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-900">
                  Sign in before continuing payment
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Online payment is available only for logged-in customers, so
                  your order stays linked to your account history.
                </p>
              </div>
              <Link
                href={loginRedirect}
                className="inline-flex rounded-full bg-[#00B4D8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0097b7]"
              >
                Login to continue
              </Link>
            </div>
          )}

          {isLoading && paymentId && session && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Loading payment details...
            </div>
          )}

          {error && session && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error instanceof Error ? error.message : "Payment lookup failed."}
            </div>
          )}

          {data && session && (
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Order reference
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {data.booking.bookingReference}
                </p>
                <p className="mt-4 text-sm text-slate-600">
                  {data.booking.serviceTitle}
                </p>
              </div>

              <div className="rounded-[28px] bg-cyan-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Payment summary
                </p>
                <p className="mt-3 text-4xl font-black text-slate-900">
                  {data.payment.amount.toFixed(2)} AED
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Method: {data.payment.method}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Status: {data.payment.status}
                </p>
              </div>

              {data.payment.status !== "paid" && (
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={isPaying}
                  className="w-full rounded-2xl bg-[#7B2D8B] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#632271] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPaying ? "Processing payment..." : "Pay now"}
                </button>
              )}

              {message && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
                  {message}
                </div>
              )}
            </div>
          )}

          {session && (
            <Link
              href="/account"
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Back to account
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PaymentCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0d0d1a_0%,#1a1531_35%,#f6fbfc_36%,#ffffff_100%)] px-4 py-16">
          <div className="mx-auto max-w-2xl rounded-[34px] bg-white px-8 py-10 shadow-[0_40px_120px_rgba(13,13,26,0.2)]">
            Loading payment checkout...
          </div>
        </main>
      }
    >
      <PaymentCheckoutContent />
    </Suspense>
  );
}
