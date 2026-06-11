interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  accepted: "bg-indigo-100 text-indigo-700 border-indigo-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  pending: "Pending",
  accepted: "Accepted",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200";
  const label = STATUS_LABELS[status] || status.replace(/_/g, " ");

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${style}`}
    >
      {label}
    </span>
  );
}
