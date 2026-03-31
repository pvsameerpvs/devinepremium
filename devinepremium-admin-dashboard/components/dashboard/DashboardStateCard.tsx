import type { ReactNode } from "react";

export function DashboardStateCard({
  title,
  description,
  action,
  tone = "default",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`mx-auto max-w-4xl rounded-[32px] border p-8 shadow-sm sm:p-10 ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white"
      }`}
    >
      <h1
        className={`text-2xl font-black sm:text-3xl ${
          tone === "error" ? "text-red-700" : "text-slate-900"
        }`}
      >
        {title}
      </h1>
      <p
        className={`mt-4 text-sm leading-7 ${
          tone === "error" ? "text-red-700/90" : "text-slate-600"
        }`}
      >
        {description}
      </p>
      {action ? (
        <div className="mt-8 flex [&>*]:w-full sm:[&>*]:w-auto">{action}</div>
      ) : null}
    </div>
  );
}
