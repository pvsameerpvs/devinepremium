"use client";

import { useState } from "react";
import { RefreshCcw, LayoutGrid, AlertCircle, History, Package } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { BookingRecord } from "@/lib/account";
import type { UserSession } from "@/lib/auth";
import { CUSTOMER_TIME_SLOTS } from "@/lib/booking";
import { hasCustomerAction, shellCardClass } from "./account-shared";
import { OrdersSummary } from "./OrdersSummary";
import { OrderCard } from "./OrderCard";

export function OrdersPanel({
  bookings,
  mutateBookings,
  session,
}: {
  bookings: BookingRecord[];
  mutateBookings: () => Promise<unknown>;
  session: UserSession;
}) {
  const [ordersTab, setOrdersTab] = useState<"history" | "actions">("history");
  const [activePanel, setActivePanel] = useState<{
    bookingId: string;
    type: "cancel" | "reschedule";
  } | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTimeSlot, setRequestedTimeSlot] = useState<string>(
    CUSTOMER_TIME_SLOTS[0],
  );
  const [activeMutation, setActiveMutation] = useState("");
  const [inlineMessage, setInlineMessage] = useState("");

  const filteredBookings = ordersTab === "history"
    ? bookings
    : bookings.filter((booking) => hasCustomerAction(booking));

  const actionCount = bookings.filter((booking) => hasCustomerAction(booking)).length;

  function openCancelPanel(booking: BookingRecord) {
    setInlineMessage("");
    setRequestNote("");
    setActivePanel({
      bookingId: booking.id,
      type: "cancel",
    });
  }

  function openReschedulePanel(booking: BookingRecord) {
    setInlineMessage("");
    setRequestNote("");
    setRequestedDate(booking.schedule.date);
    setRequestedTimeSlot(booking.schedule.timeSlot);
    setActivePanel({
      bookingId: booking.id,
      type: "reschedule",
    });
  }

  function closeActionPanel() {
    setActivePanel(null);
    setInlineMessage("");
  }

  async function submitActionRequest(bookingId: string) {
    if (activePanel?.type === "cancel") {
      await submitCancelRequest(bookingId);
    } else {
      await submitRescheduleRequest(bookingId);
    }
  }

  async function submitCancelRequest(bookingId: string) {
    setActiveMutation(`cancel:${bookingId}`);
    setInlineMessage("");

    try {
      const response = await apiRequest<{ message: string }>(
        `/api/v1/bookings/${bookingId}/cancel-request`,
        {
          method: "POST",
          token: session.token,
          body: JSON.stringify({
            note: requestNote,
          }),
        },
      );

      setInlineMessage(response.message);
      if (!response.message.toLowerCase().includes("error")) {
         setTimeout(() => {
           setActivePanel(null);
           mutateBookings();
         }, 1500);
      }
    } catch (error) {
      setInlineMessage(
        error instanceof Error ? error.message : "Could not send request.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  async function submitRescheduleRequest(bookingId: string) {
    if (!requestedDate || !requestedTimeSlot) {
      setInlineMessage("Please choose a new date and time.");
      return;
    }

    setActiveMutation(`reschedule:${bookingId}`);
    setInlineMessage("");

    try {
      const response = await apiRequest<{ message: string }>(
        `/api/v1/bookings/${bookingId}/reschedule-request`,
        {
          method: "POST",
          token: session.token,
          body: JSON.stringify({
            schedule: {
              date: requestedDate,
              timeSlot: requestedTimeSlot,
            },
            note: requestNote,
          }),
        },
      );

      setInlineMessage(response.message);
      if (!response.message.toLowerCase().includes("error")) {
        setTimeout(() => {
          setActivePanel(null);
          mutateBookings();
        }, 1500);
      }
    } catch (error) {
      setInlineMessage(
        error instanceof Error ? error.message : "Could not send request.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  return (
    <section className="space-y-8">
      {/* Header Section */}
      <div className={`${shellCardClass} overflow-hidden`}>
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-700 ring-1 ring-inset ring-cyan-700/10">
                Service History
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                My Bookings
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                Track status updates, manage payments, and request schedule changes for your luxury services.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => void mutateBookings()}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-sm"
            >
              <RefreshCcw className="h-4 w-4 text-cyan-600 transition-transform group-hover:rotate-180 duration-500" />
              Refresh Data
            </button>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <OrdersSummary bookings={bookings} />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOrdersTab("history")}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all ${
            ordersTab === "history"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 shadow-sm"
          }`}
        >
          <History className="h-4 w-4" />
          Full History ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setOrdersTab("actions")}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all relative ${
            ordersTab === "actions"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/10"
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 shadow-sm"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          Attention Needed
          {actionCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-black ring-2 ring-white shadow-sm animate-bounce">
              {actionCount}
            </span>
          )}
        </button>
      </div>

      {/* Grid Section */}
      <div className="space-y-6">
        {filteredBookings.length ? (
          filteredBookings.map((booking) => (
            <OrderCard
              key={booking.id}
              booking={booking}
              isActionOpen={activePanel?.bookingId === booking.id}
              activePanelType={activePanel?.bookingId === booking.id ? activePanel.type : null}
              activeMutation={activeMutation}
              inlineMessage={inlineMessage}
              onOpenCancel={openCancelPanel}
              onOpenReschedule={openReschedulePanel}
              onCloseAction={closeActionPanel}
              onSubmitAction={submitActionRequest}
              requestNote={requestNote}
              setRequestNote={setRequestNote}
              requestedDate={requestedDate}
              setRequestedDate={setRequestedDate}
              requestedTimeSlot={requestedTimeSlot}
              setRequestedTimeSlot={setRequestedTimeSlot}
            />
          ))
        ) : (
          <div className={`${shellCardClass} p-16 text-center`}>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-50 mb-6 border border-slate-100">
              <Package className="h-10 w-10 text-slate-200" />
            </div>
            {ordersTab === "history" ? (
              <>
                <h3 className="text-xl font-bold text-slate-900">
                  No bookings discovered yet
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-400 max-w-sm mx-auto">
                  When you book a luxury service, your order details and progress tracking will appear here.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900">
                  Clear Skies!
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-400 max-w-sm mx-auto">
                  No bookings currently require your attention. All operations are proceeding normally.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
