"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import type { BookingRecord } from "@/lib/account";
import type { UserSession } from "@/lib/auth";
import { CUSTOMER_TIME_SLOTS } from "@/lib/booking";
import { hasCustomerAction } from "./account-shared";
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
    <section className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between bg-white p-6 rounded-[28px] shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00B4D8]">
            Orders
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            Booking history & actions
          </h2>
          <p className="mt-2 text-sm text-slate-600 block max-w-lg leading-relaxed">
            See every booking in one place, easily check the next step, and 
            manage your service times directly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void mutateBookings()}
          className="rounded-full border border-[#00B4D8] text-[#00B4D8] px-5 py-2 text-sm font-semibold transition hover:bg-[#00B4D8] hover:text-white shadow-sm flex items-center justify-center min-w-[140px]"
        >
          Refresh orders
        </button>
      </div>

      <div className="flex bg-white p-2 rounded-full border border-slate-200 shadow-sm max-w-fit">
        <button
          type="button"
          onClick={() => setOrdersTab("history")}
          className={`rounded-full px-5 py-2.5 text-sm font-bold transition flex-1 sm:min-w-[180px] ${
            ordersTab === "history"
              ? "bg-[#0B132B] text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Booking history ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setOrdersTab("actions")}
          className={`rounded-full px-5 py-2.5 text-sm font-bold transition flex-1 sm:min-w-[180px] ${
            ordersTab === "actions"
              ? "bg-[#00B4D8] text-white shadow-md relative"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 relative"
          }`}
        >
          Action needed {actionCount > 0 && (
             <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] text-white font-black shadow-sm ring-2 ring-white">
                {actionCount}
             </span>
          )}
        </button>
      </div>

      <OrdersSummary bookings={bookings} />

      <div className="space-y-5 pt-2">
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
          <div className="rounded-[30px] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            {ordersTab === "history" ? (
              <>
                <p className="text-xl font-bold text-slate-900">
                  No orders found.
                </p>
                <p className="mt-3 text-sm text-slate-500 max-w-sm mx-auto">
                  When you book a service, it will appear here for you to track status, payments, and history.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-slate-900">
                  All caught up!
                </p>
                <p className="mt-3 text-sm text-slate-500 max-w-sm mx-auto">
                  No customer action is needed right now. If a booking requires your attention, it will appear here.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
