"use client";

import { CUSTOMER_TIME_SLOTS } from "@/lib/booking";

interface OrderActionPanelProps {
  activePanelType: "cancel" | "reschedule";
  bookingId: string;
  activeMutation: string;
  inlineMessage: string;
  requestNote: string;
  setRequestNote: (note: string) => void;
  requestedDate: string;
  setRequestedDate: (date: string) => void;
  requestedTimeSlot: string;
  setRequestedTimeSlot: (time: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function OrderActionPanel({
  activePanelType,
  bookingId,
  activeMutation,
  inlineMessage,
  requestNote,
  setRequestNote,
  requestedDate,
  setRequestedDate,
  requestedTimeSlot,
  setRequestedTimeSlot,
  onSubmit,
  onClose,
}: OrderActionPanelProps) {
  return (
    <div className="rounded-[24px] border border-cyan-200 bg-cyan-50/30 p-5 mt-4 shadow-md transition-all animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between mb-4 border-b border-cyan-100 pb-3">
        <h4 className="text-sm font-bold text-slate-900">
          {activePanelType === "cancel" ? "Send cancellation request" : "Send reschedule request"}
        </h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="grid gap-5">
        {activePanelType === "reschedule" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">New date</span>
              <input
                type="date"
                value={requestedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setRequestedDate(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 bg-white"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">New time</span>
              <select
                value={requestedTimeSlot}
                onChange={(event) => setRequestedTimeSlot(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 bg-white"
              >
                {CUSTOMER_TIME_SLOTS.map((timeSlot) => (
                  <option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Note to admin (optional)</span>
          <textarea
            value={requestNote}
            onChange={(event) => setRequestNote(event.target.value)}
            className="min-h-[100px] rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 bg-white resize-y"
            placeholder={
              activePanelType === "cancel"
                ? "Tell us why you want to cancel..."
                : "Tell us which time works better..."
            }
          />
        </label>
      </div>

      {inlineMessage && (
        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${inlineMessage.toLowerCase().includes("success") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {inlineMessage}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onSubmit}
          disabled={Boolean(activeMutation) && activeMutation.includes(bookingId)}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#00B4D8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0097b7] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto shadow-md"
        >
          {activeMutation && activeMutation.includes(bookingId) ? "Sending request..." : "Send request"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 sm:w-auto"
        >
          Close
        </button>
      </div>
    </div>
  );
}
