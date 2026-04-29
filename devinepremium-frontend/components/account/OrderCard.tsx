"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  User, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Info,
  Phone,
  History,
  LayoutGrid
} from "lucide-react";
import type { BookingRecord, BookingStatusHistory } from "@/lib/account";
import { formatAddressLine, formatStatusLabel, canManageBooking } from "./account-shared";
import { OrderActionPanel } from "./OrderActionPanel";

export function getNextStepMessage(booking: BookingRecord) {
  if (booking.customerRequest?.status === "pending") {
    return "Our concierge team is reviewing your request.";
  }

  if (booking.paymentMethod === "online" && booking.paymentStatus !== "paid") {
    return "Finalize your payment to secure this appointment.";
  }

  switch (booking.status) {
    case "pending":
      return "Your booking is currently being processed by our team.";
    case "accepted":
      return "Your service is confirmed. We are preparing for the visit.";
    case "scheduled":
      return "Confirmed. A technician has been assigned to your service.";
    case "in_progress":
      return "Service is currently being performed at your location.";
    case "completed":
      return "Service successfully completed. Thank you for choosing us.";
    case "cancelled":
      return "This appointment has been successfully cancelled.";
    case "rejected":
      return "We were unable to accommodate this request.";
    default:
      return "Your luxury service is on track.";
  }
}

export function toDisplayText(value: string) {
  return formatStatusLabel(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getStatusColor(status: string) {
  switch (status) {
    case "paid":
    case "completed":
    case "accepted":
    case "scheduled":
      return "bg-green-50 text-green-700 ring-green-600/20";
    case "pending":
    case "cash_due":
    case "in_progress":
      return "bg-cyan-50 text-cyan-700 ring-cyan-600/20";
    case "failed":
    case "rejected":
    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-600/20";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-500/10";
  }
}

interface OrderCardProps {
  booking: BookingRecord;
  isActionOpen: boolean;
  activePanelType?: "cancel" | "reschedule" | null;
  activeMutation: string;
  inlineMessage: string;
  onOpenCancel: (booking: BookingRecord) => void;
  onOpenReschedule: (booking: BookingRecord) => void;
  onCloseAction: () => void;
  onSubmitAction: (bookingId: string) => void;
  requestNote: string;
  setRequestNote: (note: string) => void;
  requestedDate: string;
  setRequestedDate: (date: string) => void;
  requestedTimeSlot: string;
  setRequestedTimeSlot: (time: string) => void;
}

export function OrderCard({
  booking,
  isActionOpen,
  activePanelType,
  activeMutation,
  inlineMessage,
  onOpenCancel,
  onOpenReschedule,
  onCloseAction,
  onSubmitAction,
  requestNote,
  setRequestNote,
  requestedDate,
  setRequestedDate,
  requestedTimeSlot,
  setRequestedTimeSlot,
}: OrderCardProps) {
  const firstPayment = booking.payments?.[0];
  const requestStatus = booking.customerRequest?.status;
  const hasPendingRequest = requestStatus === "pending";
  const nextStepMessage = getNextStepMessage(booking);
  
  const [isExpanded, setIsExpanded] = useState(isActionOpen);

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
      {/* Card Header (Visible always) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative cursor-pointer px-6 py-7 sm:px-8"
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Ref: {booking.bookingReference}
              </span>
              <div className="h-1 w-1 rounded-full bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">
                {new Date(booking.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors">
              {booking.serviceTitle}
            </h3>
            
            <div className="mt-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-bold">{booking.schedule.date}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-bold">{booking.schedule.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CreditCard className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-bold">{booking.totalAmount.toFixed(2)} {booking.currency}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${getStatusColor(booking.status)}`}>
                {toDisplayText(booking.status)}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${getStatusColor(booking.paymentStatus)}`}>
                Payment: {toDisplayText(booking.paymentStatus)}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${isExpanded ? 'bg-slate-100 text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                {isExpanded ? 'Show less' : 'View Details'}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all sm:hidden">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Status Prompt Line */}
        {!isExpanded && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cyan-50/50 px-5 py-3 border border-cyan-100/50">
            <Info className="h-4 w-4 text-cyan-600 shrink-0" />
            <p className="text-xs font-bold text-cyan-800 tracking-tight">
              {nextStepMessage}
            </p>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid gap-8 border-t border-slate-100 bg-slate-50/30 p-6 sm:p-8 lg:grid-cols-12">
            {/* Left Column: Details */}
            <div className="space-y-8 lg:col-span-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Summary Info */}
                <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <LayoutGrid className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Information</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-4 w-4 text-cyan-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service Location</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700 leading-relaxed">
                          {formatAddressLine(booking.address)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="mt-1 h-4 w-4 text-cyan-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Contact</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{booking.contactName}</p>
                        <p className="text-[11px] text-slate-500">{booking.contactEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staff Assignment */}
                {booking.assignedStaff ? (
                  <div className="rounded-3xl border border-cyan-100 bg-cyan-50/20 p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-cyan-100/30 pb-3">
                      <ShieldCheck className="h-4 w-4 text-cyan-600" />
                      <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-600">Technician Team</h4>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center text-center">
                      <div className="relative">
                        <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
                          {booking.assignedStaff.profilePhotoUrl ? (
                            <img
                              src={booking.assignedStaff.profilePhotoUrl}
                              alt={booking.assignedStaff.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-cyan-100 text-cyan-700 font-black text-2xl">
                              {booking.assignedStaff.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                          <ShieldCheck className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      
                      <p className="mt-4 text-base font-black text-slate-900">{booking.assignedStaff.fullName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mt-1">Lead Professional</p>
                      
                      {booking.assignedStaff.phone && (
                        <a
                          href={`tel:${booking.assignedStaff.phone}`}
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-cyan-700 shadow-sm border border-cyan-100 transition-transform hover:scale-105"
                        >
                          <Phone className="h-3 w-3" />
                          Contact Technician
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
                    <User className="h-10 w-10 text-slate-200 mb-3" />
                    <p className="text-sm font-bold text-slate-400 leading-tight">Team assignment in progress</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Awaiting local dispatch</p>
                  </div>
                )}
              </div>

              {/* Action Prompt */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-cyan-700">
                  <ArrowUpRight className="h-5 w-5" />
                  <p className="text-sm font-black tracking-tight">{nextStepMessage}</p>
                </div>
                
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {booking.paymentMethod === "online" && booking.paymentStatus !== "paid" && firstPayment && (
                    <Link
                      href={`/payment/checkout?paymentId=${firstPayment.id}`}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] shadow-xl shadow-slate-900/10"
                    >
                      Complete Payment
                      <CreditCard className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </Link>
                  )}

                  {canManageBooking(booking) && !hasPendingRequest && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenReschedule(booking)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                      >
                        Reschedule visit
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCancel(booking)}
                        className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Request Details */}
              {booking.customerRequest && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700">Open Modification Request</h4>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-amber-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Request Details</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {toDisplayText(booking.customerRequest.type)} - {toDisplayText(booking.customerRequest.status)}
                      </p>
                    </div>
                    {booking.customerRequest.requestedSchedule && (
                      <div className="rounded-2xl bg-white p-4 shadow-sm border border-amber-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">New Proposed Time</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {booking.customerRequest.requestedSchedule.date} at {booking.customerRequest.requestedSchedule.timeSlot}
                        </p>
                      </div>
                    )}
                  </div>
                  {booking.customerRequest.note && (
                    <div className="mt-4 flex gap-3 items-start">
                      <MessageSquare className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        "{booking.customerRequest.note}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Panel Injection */}
              {isActionOpen && (
                <div className="rounded-3xl border-2 border-cyan-500 bg-white shadow-2xl overflow-hidden">
                  <OrderActionPanel
                    activePanelType={activePanelType!}
                    bookingId={booking.id}
                    activeMutation={activeMutation}
                    inlineMessage={inlineMessage}
                    requestNote={requestNote}
                    setRequestNote={setRequestNote}
                    requestedDate={requestedDate}
                    setRequestedDate={setRequestedDate}
                    requestedTimeSlot={requestedTimeSlot}
                    setRequestedTimeSlot={setRequestedTimeSlot}
                    onSubmit={() => onSubmitAction(booking.id)}
                    onClose={onCloseAction}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Timeline / History */}
            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Logs</h4>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                </div>

                <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-100">
                  {booking.statusHistory?.length ? (
                    booking.statusHistory.map((entry: BookingStatusHistory) => (
                      <div key={entry.id} className="relative pl-10">
                        <div className="absolute left-1 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-cyan-600 shadow-sm ring-1 ring-slate-100 z-10" />
                        
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm font-black text-slate-900 leading-tight">
                            {entry.fromStatus === entry.toStatus && entry.note?.includes("staff") 
                              ? "Team Assignment Update" 
                              : toDisplayText(entry.toStatus)}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">
                            {new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                          {entry.note && (
                            <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                              <p className="text-xs leading-relaxed text-slate-600 font-medium">
                                {entry.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Awaiting history...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
